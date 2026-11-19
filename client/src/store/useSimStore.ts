import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import {
  Device,
  DropReason,
  DynamicPoolStatus,
  NatMapping,
  NatMode,
  Packet,
  PortStatus,
  Protocol,
  SimInitState,
  StaticMappingConfig,
} from '../../../shared/types';

interface SimStore {
  // Socket State
  socket: Socket | null;
  connected: boolean;

  // Simulator Data
  devices: Device[];
  mode: NatMode;
  table: NatMapping[];
  dynamicPoolStatus: DynamicPoolStatus | null;
  portStatus: PortStatus | null;
  staticMappings: StaticMappingConfig[];

  // Packets & Animation
  packets: Packet[];
  activePacket: Packet | null;
  selectedPacket: Packet | null;
  lastTranslatedPacket: Packet | null;

  // Form Controls
  selectedSrcDeviceId: string;
  selectedDstDeviceId: string;
  protocol: Protocol;
  srcPort: number;
  icmpId: number;
  autoReply: boolean;

  // Active Test Scenario
  activeTestId: string | null;

  // Actions
  initSocket: () => void;
  setMode: (mode: NatMode) => void;
  setSelectedSrcDevice: (id: string) => void;
  setSelectedDstDevice: (id: string) => void;
  setProtocol: (p: Protocol) => void;
  setSrcPort: (port: number) => void;
  setIcmpId: (id: number) => void;
  setAutoReply: (val: boolean) => void;
  setSelectedPacket: (packet: Packet | null) => void;
  sendPacket: (override?: {
    srcDeviceId?: string;
    dstDeviceId?: string;
    protocol?: Protocol;
    srcPort?: number;
    icmpId?: number;
    autoReply?: boolean;
  }) => void;
  sendUnsolicited: (dstIp: string, dstPort: number, protocol?: Protocol, icmpId?: number) => void;
  resetSimulation: () => void;
  runTestScenario: (testId: string) => void;
}

const SERVER_URL =
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:3000'
    : '/';

export const useSimStore = create<SimStore>((set, get) => ({
  socket: null,
  connected: false,

  devices: [
    { id: 'pc-1', name: 'PC-01', type: 'pc', privateIp: '192.168.1.10', staticMappedIp: '203.0.113.10' },
    { id: 'pc-2', name: 'PC-02', type: 'pc', privateIp: '192.168.1.11', staticMappedIp: '203.0.113.11' },
    { id: 'pc-3', name: 'PC-03', type: 'pc', privateIp: '192.168.1.12' },
    { id: 'nat-router', name: 'NAT Router', type: 'nat', privateIp: '192.168.1.1', publicIp: '203.0.113.5' },
    { id: 'web-1', name: 'WEB-1', type: 'web', publicIp: '8.8.8.8' },
    { id: 'web-2', name: 'WEB-2', type: 'web', publicIp: '1.1.1.1' },
  ],
  mode: 'PAT',
  table: [],
  dynamicPoolStatus: null,
  portStatus: null,
  staticMappings: [],

  packets: [],
  activePacket: null,
  selectedPacket: null,
  lastTranslatedPacket: null,

  selectedSrcDeviceId: 'pc-1',
  selectedDstDeviceId: 'web-1',
  protocol: 'TCP',
  srcPort: 5000,
  icmpId: 1,
  autoReply: true,
  activeTestId: null,

  initSocket: () => {
    if (get().socket) return;

    const socket = io(SERVER_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to NAT Simulator server');
      set({ connected: true });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ connected: false });
    });

    socket.on('sim:state-init', (data: SimInitState) => {
      set({
        devices: data.devices,
        mode: data.mode,
        table: data.table,
        dynamicPoolStatus: data.dynamicPoolStatus,
        portStatus: data.portStatus,
        staticMappings: data.staticMappings,
      });
    });

    socket.on('packet:created', (packet: Packet) => {
      set((state) => ({
        activePacket: packet,
        selectedPacket: packet,
        packets: [packet, ...state.packets.filter((p) => p.id !== packet.id)].slice(0, 50),
      }));
    });

    socket.on('packet:processing', (packet: Packet) => {
      set((state) => ({
        activePacket: packet,
        packets: state.packets.map((p) => (p.id === packet.id ? packet : p)),
      }));
    });

    socket.on('packet:translated', (packet: Packet) => {
      set((state) => ({
        activePacket: packet,
        lastTranslatedPacket: packet,
        selectedPacket: packet,
        packets: state.packets.map((p) => (p.id === packet.id ? packet : p)),
      }));
    });

    socket.on('packet:delivered', (packet: Packet) => {
      set((state) => ({
        activePacket: packet,
        packets: state.packets.map((p) => (p.id === packet.id ? packet : p)),
      }));

      // Keep activePacket visible briefly for animation completion
      setTimeout(() => {
        if (get().activePacket?.id === packet.id) {
          set({ activePacket: null });
        }
      }, 1500);
    });

    socket.on('packet:dropped', ({ packet, reason }: { packet: Packet; reason: DropReason }) => {
      const droppedPacket = { ...packet, dropReason: reason, status: 'dropped' as const };
      set((state) => ({
        activePacket: droppedPacket,
        selectedPacket: droppedPacket,
        packets: state.packets.map((p) => (p.id === packet.id ? droppedPacket : p)),
      }));

      setTimeout(() => {
        if (get().activePacket?.id === packet.id) {
          set({ activePacket: null });
        }
      }, 2500);
    });

    socket.on('nat:table-updated', ({ table, dynamicPoolStatus, portStatus }) => {
      set({ table, dynamicPoolStatus, portStatus });
    });

    set({ socket });
  },

  setMode: (mode: NatMode) => {
    const { socket } = get();
    if (socket) {
      socket.emit('sim:change-mode', { mode });
    }
  },

  setSelectedSrcDevice: (id: string) => set({ selectedSrcDeviceId: id }),
  setSelectedDstDevice: (id: string) => set({ selectedDstDeviceId: id }),
  setProtocol: (p: Protocol) => set({ protocol: p }),
  setSrcPort: (port: number) => set({ srcPort: port }),
  setIcmpId: (id: number) => set({ icmpId: id }),
  setAutoReply: (val: boolean) => set({ autoReply: val }),
  setSelectedPacket: (packet: Packet | null) => set({ selectedPacket: packet }),

  sendPacket: (override) => {
    const {
      socket,
      selectedSrcDeviceId,
      selectedDstDeviceId,
      protocol,
      srcPort,
      icmpId,
      autoReply,
    } = get();

    if (!socket) return;

    const payload = {
      srcDeviceId: override?.srcDeviceId ?? selectedSrcDeviceId,
      dstDeviceId: override?.dstDeviceId ?? selectedDstDeviceId,
      protocol: override?.protocol ?? protocol,
      srcPort: override?.srcPort ?? srcPort,
      icmpId: override?.icmpId ?? icmpId,
      autoReply: override?.autoReply ?? autoReply,
    };

    socket.emit('sim:send-packet', payload);

    // Auto increment port for subsequent packet test ease
    if (payload.protocol !== 'ICMP' && !override) {
      set({ srcPort: srcPort + 1 });
    } else if (payload.protocol === 'ICMP' && !override) {
      set({ icmpId: icmpId + 1 });
    }
  },

  sendUnsolicited: (dstIp, dstPort, protocol = 'TCP', icmpId = 99) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('sim:send-unsolicited', {
      dstIp,
      dstPort,
      protocol,
      icmpId,
      srcServerId: 'web-1',
    });
  },

  resetSimulation: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('sim:reset');
    }
    set({
      packets: [],
      activePacket: null,
      selectedPacket: null,
      lastTranslatedPacket: null,
      activeTestId: null,
      srcPort: 5000,
      icmpId: 1,
    });
  },

  runTestScenario: (testId: string) => {
    set({ activeTestId: testId });
    const { setMode, sendPacket, sendUnsolicited } = get();

    switch (testId) {
      case 'T1': // PAT, TCP outbound: PC-01 sends to 8.8.8.8:80
        setMode('PAT');
        setTimeout(() => {
          sendPacket({
            srcDeviceId: 'pc-1',
            dstDeviceId: 'web-1',
            protocol: 'TCP',
            srcPort: 5000,
            autoReply: true,
          });
        }, 200);
        break;

      case 'T2': // PAT, two hosts: PC-01 and PC-02 both send with same port 5000
        setMode('PAT');
        setTimeout(() => {
          sendPacket({
            srcDeviceId: 'pc-1',
            dstDeviceId: 'web-1',
            protocol: 'TCP',
            srcPort: 5000,
            autoReply: false,
          });
          setTimeout(() => {
            sendPacket({
              srcDeviceId: 'pc-2',
              dstDeviceId: 'web-1',
              protocol: 'TCP',
              srcPort: 5000,
              autoReply: false,
            });
          }, 800);
        }, 200);
        break;

      case 'T3': // Inbound reply: Verified round-trip via autoReply
        setMode('PAT');
        setTimeout(() => {
          sendPacket({
            srcDeviceId: 'pc-1',
            dstDeviceId: 'web-2',
            protocol: 'TCP',
            srcPort: 5002,
            autoReply: true,
          });
        }, 200);
        break;

      case 'T4': // ICMP Ping: Echo ID mapped
        setMode('PAT');
        setTimeout(() => {
          sendPacket({
            srcDeviceId: 'pc-1',
            dstDeviceId: 'web-1',
            protocol: 'ICMP',
            icmpId: 1,
            autoReply: true,
          });
        }, 200);
        break;

      case 'T5': // Unsolicited packet to unmapped port -> Drop NO_TRANSLATION_MAPPING
        setMode('PAT');
        setTimeout(() => {
          sendUnsolicited('203.0.113.5', 9999, 'TCP');
        }, 200);
        break;

      case 'T6': // TTL Expiry: Observe countdown timer
        // Just send a packet to observe its TTL countdown
        setMode('PAT');
        setTimeout(() => {
          sendPacket({
            srcDeviceId: 'pc-2',
            dstDeviceId: 'web-1',
            protocol: 'UDP',
            srcPort: 5050,
            autoReply: false,
          });
        }, 200);
        break;

      case 'T7': // Dynamic NAT: Pool exhausted (Pool size 2, 3 hosts send)
        setMode('DYNAMIC');
        setTimeout(() => {
          // PC-1 takes pool IP 1
          sendPacket({
            srcDeviceId: 'pc-1',
            dstDeviceId: 'web-1',
            protocol: 'TCP',
            srcPort: 5000,
            autoReply: false,
          });
          // PC-2 takes pool IP 2
          setTimeout(() => {
            sendPacket({
              srcDeviceId: 'pc-2',
              dstDeviceId: 'web-1',
              protocol: 'TCP',
              srcPort: 5000,
              autoReply: false,
            });
            // PC-3 tries to send -> NAT_POOL_EXHAUSTED!
            setTimeout(() => {
              sendPacket({
                srcDeviceId: 'pc-3',
                dstDeviceId: 'web-1',
                protocol: 'TCP',
                srcPort: 5000,
                autoReply: false,
              });
            }, 800);
          }, 800);
        }, 300);
        break;

      case 'T8': // Static NAT: PC-01 has static mapping; PC-03 unmapped -> NO_TRANSLATION_MAPPING
        setMode('STATIC');
        setTimeout(() => {
          // PC-01 sends and succeeds (maps to 203.0.113.10)
          sendPacket({
            srcDeviceId: 'pc-1',
            dstDeviceId: 'web-1',
            protocol: 'TCP',
            srcPort: 5000,
            autoReply: true,
          });
          // PC-03 sends and drops (NO_TRANSLATION_MAPPING)
          setTimeout(() => {
            sendPacket({
              srcDeviceId: 'pc-3',
              dstDeviceId: 'web-1',
              protocol: 'TCP',
              srcPort: 5000,
              autoReply: false,
            });
          }, 1200);
        }, 300);
        break;

      default:
        break;
    }
  },
}));
