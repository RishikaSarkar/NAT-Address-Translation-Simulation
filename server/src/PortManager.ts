import { DynamicPoolStatus, PortStatus } from '../../shared/types.js';

export class PortManager {
  private readonly startPort: number = 40000;
  private readonly endPort: number = 50000;
  private allocatedPorts: Set<number> = new Set();

  // Dynamic NAT IP Pool management
  private dynamicPool: string[] = ['203.0.113.20', '203.0.113.21'];
  // Map of privateIp -> publicIp
  private activeLeases: Map<string, string> = new Map();

  constructor(dynamicPool?: string[]) {
    if (dynamicPool && dynamicPool.length > 0) {
      this.dynamicPool = [...dynamicPool];
    }
  }

  /**
   * Allocate the lowest available port in range 40000-50000
   */
  allocatePort(): number | null {
    for (let port = this.startPort; port <= this.endPort; port++) {
      if (!this.allocatedPorts.has(port)) {
        this.allocatedPorts.add(port);
        return port;
      }
    }
    return null; // All ports exhausted
  }

  /**
   * Release an allocated PAT port
   */
  releasePort(port: number): void {
    this.allocatedPorts.delete(port);
  }

  /**
   * Check if a port is allocated
   */
  isPortAllocated(port: number): boolean {
    return this.allocatedPorts.has(port);
  }

  /**
   * Request a public IP lease for a private IP.
   * Reuses existing lease if private IP already has one active.
   * Returns null if all pool IPs are leased.
   */
  leaseIp(privateIp: string): string | null {
    if (this.activeLeases.has(privateIp)) {
      return this.activeLeases.get(privateIp)!;
    }

    // Find first unused IP from the dynamic pool
    const usedIps = new Set(this.activeLeases.values());
    for (const ip of this.dynamicPool) {
      if (!usedIps.has(ip)) {
        this.activeLeases.set(privateIp, ip);
        return ip;
      }
    }

    return null; // NAT_POOL_EXHAUSTED
  }

  /**
   * Release a leased IP by public IP or by private IP
   */
  releaseIp(publicIp: string): void {
    for (const [pIp, pubIp] of this.activeLeases.entries()) {
      if (pubIp === publicIp) {
        this.activeLeases.delete(pIp);
        break;
      }
    }
  }

  releaseLeaseForPrivateIp(privateIp: string): void {
    this.activeLeases.delete(privateIp);
  }

  /**
   * Check if a private host has an active lease
   */
  getLeaseForPrivateIp(privateIp: string): string | undefined {
    return this.activeLeases.get(privateIp);
  }

  /**
   * Get dynamic pool status
   */
  getDynamicPoolStatus(): DynamicPoolStatus {
    const leases = Array.from(this.activeLeases.entries()).map(([privateIp, publicIp]) => ({
      privateIp,
      publicIp,
    }));
    const usedCount = this.activeLeases.size;
    return {
      pool: [...this.dynamicPool],
      leases,
      availableCount: Math.max(0, this.dynamicPool.length - usedCount),
    };
  }

  /**
   * Get PAT port status
   */
  getPortStatus(): PortStatus {
    const totalPorts = this.endPort - this.startPort + 1;
    const allocatedCount = this.allocatedPorts.size;
    return {
      startPort: this.startPort,
      endPort: this.endPort,
      allocatedCount,
      availableCount: totalPorts - allocatedCount,
    };
  }

  setDynamicPool(pool: string[]): void {
    this.dynamicPool = [...pool];
  }

  /**
   * Reset all allocations and leases
   */
  reset(): void {
    this.allocatedPorts.clear();
    this.activeLeases.clear();
  }
}
