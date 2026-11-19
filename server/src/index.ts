import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PortManager } from './PortManager.js';
import { NatTable } from './NatTable.js';
import { NatEngine } from './NatEngine.js';
import {
  ChangeModePayload,
  SendPacketPayload,
  SendUnsolicitedPayload,
  SimInitState,
} from '../../shared/types.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Instantiate core NAT components
const portManager = new PortManager();
let natTable: NatTable;
let natEngine: NatEngine;

const emitTableUpdated = (table = natTable.getEntries()) => {
  io.emit('nat:table-updated', {
    table,
    dynamicPoolStatus: portManager.getDynamicPoolStatus(),
    portStatus: portManager.getPortStatus(),
  });
};

natTable = new NatTable(portManager, (table) => {
  emitTableUpdated(table);
});

natEngine = new NatEngine(portManager, natTable, {
  onPacketCreated: (packet) => io.emit('packet:created', packet),
  onPacketProcessing: (packet) => io.emit('packet:processing', packet),
  onPacketTranslated: (packet) => {
    io.emit('packet:translated', packet);
    emitTableUpdated();
  },
  onPacketDelivered: (packet) => io.emit('packet:delivered', packet),
  onPacketDropped: (packet, reason) => io.emit('packet:dropped', { packet, reason }),
  onTableUpdated: (table) => emitTableUpdated(table),
});

// Broadcast full simulation state
const getFullInitState = (): SimInitState => ({
  devices: natEngine.getDevices(),
  mode: natEngine.getMode(),
  dynamicPool: natEngine.getDynamicPool(),
  staticMappings: natEngine.getStaticMappings(),
  table: natTable.getEntries(),
  dynamicPoolStatus: portManager.getDynamicPoolStatus(),
  portStatus: portManager.getPortStatus(),
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial state upon connection
  socket.emit('sim:state-init', getFullInitState());

  socket.on('sim:send-packet', async (payload: SendPacketPayload) => {
    try {
      await natEngine.handleOutboundPacket(
        payload.srcDeviceId,
        payload.dstDeviceId,
        payload.protocol,
        payload.srcPort,
        payload.icmpId,
        payload.dstPort,
        payload.autoReply !== false
      );
    } catch (err) {
      console.error('Error handling outbound packet:', err);
    }
  });

  socket.on('sim:send-unsolicited', async (payload: SendUnsolicitedPayload) => {
    try {
      await natEngine.handleInboundPacket(
        payload.srcServerId || 'web-1',
        payload.dstIp,
        payload.dstPort,
        80,
        payload.protocol,
        payload.icmpId
      );
    } catch (err) {
      console.error('Error handling unsolicited inbound packet:', err);
    }
  });

  socket.on('sim:change-mode', (payload: ChangeModePayload) => {
    natEngine.setMode(payload.mode);
    io.emit('sim:state-init', getFullInitState());
  });

  socket.on('sim:reset', () => {
    natEngine.reset();
    io.emit('sim:state-init', getFullInitState());
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] NAT Address Translation Simulator running on port ${PORT}`);
});
