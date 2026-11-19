import {
  Device,
  DropReason,
  NatMapping,
  NatMode,
  Packet,
  PacketHeader,
  Protocol,
  StaticMappingConfig,
} from '../../shared/types.js';
import { NatTable } from './NatTable.js';
import { PortManager } from './PortManager.js';

export interface NatEngineEvents {
  onPacketCreated: (packet: Packet) => void;
  onPacketProcessing: (packet: Packet) => void;
  onPacketTranslated: (packet: Packet) => void;
  onPacketDelivered: (packet: Packet) => void;
  onPacketDropped: (packet: Packet, reason: DropReason) => void;
  onTableUpdated: (table: NatMapping[]) => void;
}

export class NatEngine {
  private mode: NatMode = 'PAT';
  private portManager: PortManager;
  private natTable: NatTable;
  private events: NatEngineEvents;

  private primaryPublicIp: string = '203.0.113.5';
  private staticMappings: StaticMappingConfig[] = [
    { insideLocalIp: '192.168.1.10', insideGlobalIp: '203.0.113.10', deviceId: 'pc-1' },
    { insideLocalIp: '192.168.1.11', insideGlobalIp: '203.0.113.11', deviceId: 'pc-2' },
  ];

  private devices: Device[] = [
    { id: 'pc-1', name: 'PC-01', type: 'pc', privateIp: '192.168.1.10', staticMappedIp: '203.0.113.10' },
    { id: 'pc-2', name: 'PC-02', type: 'pc', privateIp: '192.168.1.11', staticMappedIp: '203.0.113.11' },
    { id: 'pc-3', name: 'PC-03', type: 'pc', privateIp: '192.168.1.12' },
    { id: 'nat-router', name: 'NAT Router', type: 'nat', privateIp: '192.168.1.1', publicIp: '203.0.113.5' },
    { id: 'web-1', name: 'WEB-1', type: 'web', publicIp: '8.8.8.8' },
    { id: 'web-2', name: 'WEB-2', type: 'web', publicIp: '1.1.1.1' },
  ];

  constructor(portManager: PortManager, natTable: NatTable, events: NatEngineEvents) {
    this.portManager = portManager;
    this.natTable = natTable;
    this.events = events;
  }

  public getMode(): NatMode {
    return this.mode;
  }

  public setMode(mode: NatMode): void {
    this.mode = mode;
    this.reset();
    if (mode === 'STATIC') {
      this.natTable.initStaticMappings(this.staticMappings);
    }
  }

  public getDevices(): Device[] {
    return this.devices;
  }

  public getStaticMappings(): StaticMappingConfig[] {
    return this.staticMappings;
  }

  public getDynamicPool(): string[] {
    return this.portManager.getDynamicPoolStatus().pool;
  }

  public setDynamicPool(pool: string[]): void {
    this.portManager.setDynamicPool(pool);
  }

  public reset(): void {
    this.portManager.reset();
    this.natTable.clear();
    if (this.mode === 'STATIC') {
      this.natTable.initStaticMappings(this.staticMappings);
    }
  }

  /**
   * Helper to sleep between animation steps
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Send an outbound packet from a private host to a public server
   */
  public async handleOutboundPacket(
    srcDeviceId: string,
    dstDeviceId: string,
    protocol: Protocol,
    srcPort: number = 5000,
    icmpId: number = 1,
    dstPort?: number,
    autoReply: boolean = true
  ): Promise<void> {
    const srcDev = this.devices.find((d) => d.id === srcDeviceId);
    const dstDev = this.devices.find((d) => d.id === dstDeviceId);

    if (!srcDev || !dstDev || !srcDev.privateIp || !dstDev.publicIp) {
      console.error('Invalid source or destination device');
      return;
    }

    const defaultDstPort = protocol === 'ICMP' ? 0 : dstDev.id === 'web-2' ? 443 : 80;
    const resolvedDstPort = dstPort !== undefined ? dstPort : defaultDstPort;
    const packetSrcPort = protocol === 'ICMP' ? icmpId : srcPort;

    const originalHeader: PacketHeader = {
      srcIp: srcDev.privateIp,
      srcPort: packetSrcPort,
      dstIp: dstDev.publicIp,
      dstPort: resolvedDstPort,
    };

    const packetId = `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const packet: Packet = {
      id: packetId,
      direction: 'outbound',
      protocol,
      srcDeviceId,
      dstDeviceId,
      originalHeader,
      icmpId: protocol === 'ICMP' ? icmpId : undefined,
      status: 'created',
      timestamp: Date.now(),
    };

    // Step 1: Packet Created at source host
    this.events.onPacketCreated({ ...packet });
    await this.sleep(400);

    // Step 2: Packet arrives at NAT Router for inspection
    packet.status = 'processing';
    this.events.onPacketProcessing({ ...packet });
    await this.sleep(500);

    // Step 3: NAT Translation Logic
    let insideGlobalIp: string = '';
    let insideGlobalPort: number = 0;
    let isStaticMapping = false;

    // Check if an existing mapping already exists
    const existingEntry = this.natTable.findOutbound(
      packet.originalHeader.srcIp,
      packet.originalHeader.srcPort,
      packet.protocol,
      this.mode
    );

    if (existingEntry) {
      // Step 1 (Lookup - Found): Refresh TTL and reuse
      this.natTable.refreshTtl(existingEntry.id);
      insideGlobalIp = existingEntry.insideGlobalIp;
      insideGlobalPort =
        this.mode === 'PAT'
          ? existingEntry.insideGlobalPort
          : packet.originalHeader.srcPort;
    } else {
      // Step 2 (Create Mapping by Mode)
      if (this.mode === 'PAT') {
        const allocatedPort = this.portManager.allocatePort();
        if (!allocatedPort) {
          packet.status = 'dropped';
          packet.dropReason = 'NAT_POOL_EXHAUSTED';
          this.events.onPacketDropped({ ...packet }, 'NAT_POOL_EXHAUSTED');
          return;
        }

        insideGlobalIp = this.primaryPublicIp;
        insideGlobalPort = allocatedPort;

        const newMapping: NatMapping = {
          id: `pat-${Date.now()}-${allocatedPort}`,
          mode: 'PAT',
          protocol: packet.protocol,
          insideLocalIp: packet.originalHeader.srcIp,
          insideLocalPort: packet.originalHeader.srcPort,
          insideGlobalIp,
          insideGlobalPort,
          outsideIp: packet.originalHeader.dstIp,
          outsidePort: packet.originalHeader.dstPort,
          ttl: 30,
          isStatic: false,
        };
        this.natTable.addOrRefresh(newMapping);
      } else if (this.mode === 'DYNAMIC') {
        const leasedIp = this.portManager.leaseIp(packet.originalHeader.srcIp);
        if (!leasedIp) {
          // Dynamic pool exhausted!
          packet.status = 'dropped';
          packet.dropReason = 'NAT_POOL_EXHAUSTED';
          this.events.onPacketDropped({ ...packet }, 'NAT_POOL_EXHAUSTED');
          return;
        }

        insideGlobalIp = leasedIp;
        insideGlobalPort = packet.originalHeader.srcPort;

        const newMapping: NatMapping = {
          id: `dyn-${Date.now()}-${insideGlobalIp}`,
          mode: 'DYNAMIC',
          protocol: packet.protocol,
          insideLocalIp: packet.originalHeader.srcIp,
          insideLocalPort: packet.originalHeader.srcPort,
          insideGlobalIp,
          insideGlobalPort,
          outsideIp: packet.originalHeader.dstIp,
          outsidePort: packet.originalHeader.dstPort,
          ttl: 30,
          isStatic: false,
        };
        this.natTable.addOrRefresh(newMapping);
      } else if (this.mode === 'STATIC') {
        const staticConf = this.staticMappings.find(
          (m) => m.insideLocalIp === packet.originalHeader.srcIp
        );

        if (!staticConf) {
          // Unmapped host in Static NAT (e.g. PC-03)
          packet.status = 'dropped';
          packet.dropReason = 'NO_TRANSLATION_MAPPING';
          this.events.onPacketDropped({ ...packet }, 'NO_TRANSLATION_MAPPING');
          return;
        }

        insideGlobalIp = staticConf.insideGlobalIp;
        insideGlobalPort = packet.originalHeader.srcPort;
        isStaticMapping = true;

        // Ensure static entry is in table
        const mappingId = `static-${packet.originalHeader.srcIp}`;
        const newMapping: NatMapping = {
          id: mappingId,
          mode: 'STATIC',
          protocol: packet.protocol,
          insideLocalIp: packet.originalHeader.srcIp,
          insideLocalPort: packet.originalHeader.srcPort,
          insideGlobalIp,
          insideGlobalPort,
          outsideIp: packet.originalHeader.dstIp,
          outsidePort: packet.originalHeader.dstPort,
          ttl: -1,
          isStatic: true,
        };
        this.natTable.addOrRefresh(newMapping);
      }
    }

    // Step 4: Rewrite & Forward Outbound
    packet.status = 'translated';
    packet.translatedHeader = {
      srcIp: insideGlobalIp,
      srcPort: insideGlobalPort,
      dstIp: packet.originalHeader.dstIp,
      dstPort: packet.originalHeader.dstPort,
    };

    this.events.onPacketTranslated({ ...packet });
    await this.sleep(500);

    // Delivered to destination server
    packet.status = 'delivered';
    this.events.onPacketDelivered({ ...packet });

    // Step 5: Auto-trigger Server Reply if enabled
    if (autoReply) {
      await this.sleep(700);
      await this.handleInboundPacket(
        dstDev.id,
        insideGlobalIp,
        insideGlobalPort,
        packet.originalHeader.dstPort,
        packet.protocol,
        protocol === 'ICMP' ? insideGlobalPort : undefined
      );
    }
  }

  /**
   * Handle an inbound packet from the public internet (either reply or unsolicited)
   */
  public async handleInboundPacket(
    srcServerId: string,
    dstPublicIp: string,
    dstPublicPort: number,
    srcServerPort: number = 80,
    protocol: Protocol = 'TCP',
    icmpId?: number
  ): Promise<void> {
    const srcDev = this.devices.find((d) => d.id === srcServerId) || {
      id: srcServerId,
      name: srcServerId,
      type: 'web' as const,
      publicIp: '8.8.8.8',
    };

    const originalHeader: PacketHeader = {
      srcIp: srcDev.publicIp || '8.8.8.8',
      srcPort: srcServerPort,
      dstIp: dstPublicIp,
      dstPort: dstPublicPort,
    };

    const packetId = `pkt-in-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const packet: Packet = {
      id: packetId,
      direction: 'inbound',
      protocol,
      srcDeviceId: srcDev.id,
      dstDeviceId: 'nat-router',
      originalHeader,
      icmpId: protocol === 'ICMP' ? icmpId : undefined,
      status: 'created',
      timestamp: Date.now(),
    };

    // Step 1: Packet Created at public server
    this.events.onPacketCreated({ ...packet });
    await this.sleep(400);

    // Step 2: Packet arrives at NAT Router
    packet.status = 'processing';
    this.events.onPacketProcessing({ ...packet });
    await this.sleep(500);

    // Step 3: Inbound Lookup
    const entry = this.natTable.findInbound(
      dstPublicIp,
      dstPublicPort,
      protocol,
      this.mode,
      icmpId
    );

    if (!entry) {
      // Drop: Unsolicited inbound or no translation mapping exists
      packet.status = 'dropped';
      packet.dropReason = 'NO_TRANSLATION_MAPPING';
      this.events.onPacketDropped({ ...packet }, 'NO_TRANSLATION_MAPPING');
      return;
    }

    // Refresh TTL for non-static entry
    if (!entry.isStatic) {
      this.natTable.refreshTtl(entry.id);
    }

    // Step 4: Rewrite Inbound Header & Deliver to Private Host
    const targetHostPort =
      this.mode === 'PAT'
        ? entry.insideLocalPort
        : dstPublicPort; // For dynamic/static, preserved destination port

    packet.status = 'translated';
    packet.translatedHeader = {
      srcIp: packet.originalHeader.srcIp,
      srcPort: packet.originalHeader.srcPort,
      dstIp: entry.insideLocalIp,
      dstPort: targetHostPort,
    };

    // Target private device
    const targetDevice = this.devices.find((d) => d.privateIp === entry.insideLocalIp);
    if (targetDevice) {
      packet.dstDeviceId = targetDevice.id;
    }

    this.events.onPacketTranslated({ ...packet });
    await this.sleep(500);

    // Deliver to private host
    packet.status = 'delivered';
    this.events.onPacketDelivered({ ...packet });
  }
}
