export type NatMode = 'PAT' | 'DYNAMIC' | 'STATIC';
export type Protocol = 'TCP' | 'UDP' | 'ICMP';
export type DeviceType = 'pc' | 'nat' | 'web';
export type DropReason = 'NO_TRANSLATION_MAPPING' | 'NAT_POOL_EXHAUSTED';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  privateIp?: string;
  publicIp?: string;
  staticMappedIp?: string; // Used when in STATIC NAT mode
}

export interface PacketHeader {
  srcIp: string;
  srcPort: number; // For ICMP, represents the Echo Identifier
  dstIp: string;
  dstPort: number; // For ICMP, represents 0 or Echo Identifier
}

export interface Packet {
  id: string;
  direction: 'outbound' | 'inbound';
  protocol: Protocol;
  srcDeviceId: string;
  dstDeviceId: string;
  originalHeader: PacketHeader;
  translatedHeader?: PacketHeader;
  icmpId?: number;
  status: 'created' | 'processing' | 'translated' | 'delivered' | 'dropped';
  dropReason?: DropReason;
  timestamp: number;
}

export interface NatMapping {
  id: string;
  mode: NatMode;
  protocol: Protocol;
  insideLocalIp: string;
  insideLocalPort: number;   // Or ICMP Echo ID
  insideGlobalIp: string;
  insideGlobalPort: number;  // Or ICMP Echo ID / allocated PAT port
  outsideIp: string;
  outsidePort: number;
  ttl: number;               // Initialized to 30 seconds; -1 or Infinity for Static NAT
  isStatic: boolean;
}

export interface StaticMappingConfig {
  insideLocalIp: string;
  insideGlobalIp: string;
  deviceId?: string;
}

export interface DynamicPoolStatus {
  pool: string[];
  leases: { privateIp: string; publicIp: string }[];
  availableCount: number;
}

export interface PortStatus {
  startPort: number;
  endPort: number;
  allocatedCount: number;
  availableCount: number;
}

export interface SimInitState {
  devices: Device[];
  mode: NatMode;
  dynamicPool: string[];
  staticMappings: StaticMappingConfig[];
  table: NatMapping[];
  dynamicPoolStatus: DynamicPoolStatus;
  portStatus: PortStatus;
}

export interface SendPacketPayload {
  srcDeviceId: string;
  dstDeviceId: string;
  protocol: Protocol;
  srcPort?: number;
  icmpId?: number;
  dstPort?: number;
  autoReply?: boolean;
}

export interface SendUnsolicitedPayload {
  dstIp: string;
  dstPort: number;
  protocol: Protocol;
  srcServerId?: string;
  icmpId?: number;
}

export interface ChangeModePayload {
  mode: NatMode;
}
