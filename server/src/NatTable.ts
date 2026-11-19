import { NatMapping, NatMode, Protocol, StaticMappingConfig } from '../../shared/types.js';
import { PortManager } from './PortManager.js';

export type TableUpdateCallback = (table: NatMapping[]) => void;

export class NatTable {
  private entries: NatMapping[] = [];
  private timer: NodeJS.Timeout | null = null;
  private portManager: PortManager;
  private onTableUpdated?: TableUpdateCallback;

  constructor(portManager: PortManager, onTableUpdated?: TableUpdateCallback) {
    this.portManager = portManager;
    this.onTableUpdated = onTableUpdated;
    this.startTtlTimer();
  }

  setUpdateCallback(cb: TableUpdateCallback): void {
    this.onTableUpdated = cb;
  }

  /**
   * Starts the 1-second TTL countdown timer loop
   */
  public startTtlTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  public stopTtlTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Tick function called every 1000ms
   */
  public tick(): void {
    let changed = false;
    const remainingEntries: NatMapping[] = [];

    for (const entry of this.entries) {
      if (entry.isStatic) {
        remainingEntries.push(entry);
        continue;
      }

      const nextTtl = entry.ttl - 1;
      if (nextTtl <= 0) {
        // Entry expired! Release port or dynamic IP
        changed = true;
        if (entry.mode === 'PAT') {
          this.portManager.releasePort(entry.insideGlobalPort);
        } else if (entry.mode === 'DYNAMIC') {
          // Check if any other non-expired entries still use this private IP
          const stillInUse = this.entries.some(
            (other) =>
              other.id !== entry.id &&
              other.insideLocalIp === entry.insideLocalIp &&
              other.ttl > 1
          );
          if (!stillInUse) {
            this.portManager.releaseIp(entry.insideGlobalIp);
          }
        }
      } else {
        remainingEntries.push({ ...entry, ttl: nextTtl });
        if (nextTtl !== entry.ttl) {
          changed = true;
        }
      }
    }

    this.entries = remainingEntries;
    if (changed && this.onTableUpdated) {
      this.onTableUpdated(this.getEntries());
    }
  }

  public getEntries(): NatMapping[] {
    return [...this.entries];
  }

  /**
   * Find matching outbound mapping:
   * - In PAT: exact match on insideLocalIp + insideLocalPort + protocol
   * - In DYNAMIC: match insideLocalIp
   * - In STATIC: match insideLocalIp
   */
  public findOutbound(
    insideLocalIp: string,
    insideLocalPort: number,
    protocol: Protocol,
    mode: NatMode
  ): NatMapping | undefined {
    if (mode === 'PAT') {
      return this.entries.find(
        (e) =>
          e.insideLocalIp === insideLocalIp &&
          e.insideLocalPort === insideLocalPort &&
          e.protocol === protocol
      );
    } else {
      // DYNAMIC or STATIC
      // First look for exact match (same port)
      const exact = this.entries.find(
        (e) =>
          e.insideLocalIp === insideLocalIp &&
          e.insideLocalPort === insideLocalPort &&
          e.protocol === protocol
      );
      if (exact) return exact;

      // Otherwise look for any entry matching insideLocalIp
      return this.entries.find((e) => e.insideLocalIp === insideLocalIp);
    }
  }

  /**
   * Find matching inbound mapping:
   * - In PAT: matches insideGlobalIp + insideGlobalPort (or ICMP Echo ID)
   * - In DYNAMIC / STATIC: matches insideGlobalIp
   */
  public findInbound(
    insideGlobalIp: string,
    insideGlobalPort: number,
    protocol: Protocol,
    mode: NatMode,
    icmpId?: number
  ): NatMapping | undefined {
    if (mode === 'PAT') {
      return this.entries.find((e) => {
        if (e.insideGlobalIp !== insideGlobalIp) return false;
        if (protocol === 'ICMP') {
          return e.protocol === 'ICMP' && (e.insideGlobalPort === insideGlobalPort || (icmpId !== undefined && e.insideGlobalPort === icmpId));
        }
        return e.insideGlobalPort === insideGlobalPort && e.protocol === protocol;
      });
    } else {
      // DYNAMIC or STATIC: 1-to-1 IP translation
      return this.entries.find((e) => e.insideGlobalIp === insideGlobalIp);
    }
  }

  /**
   * Add a new mapping or refresh an existing mapping's TTL to 30
   */
  public addOrRefresh(mapping: NatMapping): NatMapping {
    const existingIndex = this.entries.findIndex((e) => e.id === mapping.id);

    if (existingIndex >= 0) {
      if (!this.entries[existingIndex].isStatic) {
        this.entries[existingIndex] = {
          ...this.entries[existingIndex],
          ttl: 30,
        };
      }
      if (this.onTableUpdated) {
        this.onTableUpdated(this.getEntries());
      }
      return this.entries[existingIndex];
    } else {
      this.entries.push(mapping);
      if (this.onTableUpdated) {
        this.onTableUpdated(this.getEntries());
      }
      return mapping;
    }
  }

  public refreshTtl(mappingId: string): void {
    const entry = this.entries.find((e) => e.id === mappingId);
    if (entry && !entry.isStatic) {
      entry.ttl = 30;
      if (this.onTableUpdated) {
        this.onTableUpdated(this.getEntries());
      }
    }
  }

  /**
   * Initializes static NAT entries
   */
  public initStaticMappings(staticConfigs: StaticMappingConfig[]): void {
    // Remove existing static mappings
    this.entries = this.entries.filter((e) => !e.isStatic);

    for (const config of staticConfigs) {
      const id = `static-${config.insideLocalIp}`;
      this.entries.push({
        id,
        mode: 'STATIC',
        protocol: 'TCP',
        insideLocalIp: config.insideLocalIp,
        insideLocalPort: 0, // In 1:1 Static NAT, any port is preserved
        insideGlobalIp: config.insideGlobalIp,
        insideGlobalPort: 0,
        outsideIp: '*',
        outsidePort: 0,
        ttl: -1, // Infinite
        isStatic: true,
      });
    }

    if (this.onTableUpdated) {
      this.onTableUpdated(this.getEntries());
    }
  }

  public clear(): void {
    this.entries = [];
    if (this.onTableUpdated) {
      this.onTableUpdated(this.getEntries());
    }
  }
}
