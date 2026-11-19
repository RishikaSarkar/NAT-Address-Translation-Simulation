import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HostNode } from '../nodes/HostNode';
import { RouterNode } from '../nodes/RouterNode';
import { ServerNode } from '../nodes/ServerNode';
import { useSimStore } from '../store/useSimStore';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const nodeTypes = {
  hostNode: HostNode,
  routerNode: RouterNode,
  serverNode: ServerNode,
};

// Fixed positions for network topology
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  'pc-1': { x: 70, y: 70 },
  'pc-2': { x: 70, y: 200 },
  'pc-3': { x: 70, y: 330 },
  'nat-router': { x: 380, y: 170 },
  'web-1': { x: 760, y: 110 },
  'web-2': { x: 760, y: 260 },
};

// Node center offsets for packet overlay animation
const NODE_CENTERS: Record<string, { x: number; y: number }> = {
  'pc-1': { x: 155, y: 120 },
  'pc-2': { x: 155, y: 250 },
  'pc-3': { x: 155, y: 380 },
  'nat-router': { x: 510, y: 250 },
  'web-1': { x: 845, y: 160 },
  'web-2': { x: 845, y: 310 },
};

export const TopologyCanvas: React.FC = () => {
  const {
    devices,
    mode,
    table,
    dynamicPoolStatus,
    portStatus,
    activePacket,
  } = useSimStore();

  const isRouterProcessing =
    activePacket?.status === 'processing' || activePacket?.status === 'translated';
  const isRouterDropped = activePacket?.status === 'dropped';

  // Construct React Flow Nodes
  const nodes: Node[] = useMemo(() => {
    return [
      // PC-01
      {
        id: 'pc-1',
        type: 'hostNode',
        position: NODE_COORDINATES['pc-1'],
        data: {
          device: devices.find((d) => d.id === 'pc-1')!,
          isActive:
            activePacket?.srcDeviceId === 'pc-1' ||
            (activePacket?.direction === 'inbound' &&
              activePacket.dstDeviceId === 'pc-1'),
          mode,
        },
      },
      // PC-02
      {
        id: 'pc-2',
        type: 'hostNode',
        position: NODE_COORDINATES['pc-2'],
        data: {
          device: devices.find((d) => d.id === 'pc-2')!,
          isActive:
            activePacket?.srcDeviceId === 'pc-2' ||
            (activePacket?.direction === 'inbound' &&
              activePacket.dstDeviceId === 'pc-2'),
          mode,
        },
      },
      // PC-03
      {
        id: 'pc-3',
        type: 'hostNode',
        position: NODE_COORDINATES['pc-3'],
        data: {
          device: devices.find((d) => d.id === 'pc-3')!,
          isActive:
            activePacket?.srcDeviceId === 'pc-3' ||
            (activePacket?.direction === 'inbound' &&
              activePacket.dstDeviceId === 'pc-3'),
          mode,
        },
      },
      // NAT Router
      {
        id: 'nat-router',
        type: 'routerNode',
        position: NODE_COORDINATES['nat-router'],
        data: {
          mode,
          activeCount: table.length,
          dynamicPoolStatus,
          portStatus,
          isProcessing: isRouterProcessing,
          isDropped: isRouterDropped,
          dropReason: activePacket?.dropReason,
        },
      },
      // WEB-1
      {
        id: 'web-1',
        type: 'serverNode',
        position: NODE_COORDINATES['web-1'],
        data: {
          device: devices.find((d) => d.id === 'web-1')!,
          isActive:
            activePacket?.dstDeviceId === 'web-1' ||
            activePacket?.srcDeviceId === 'web-1',
        },
      },
      // WEB-2
      {
        id: 'web-2',
        type: 'serverNode',
        position: NODE_COORDINATES['web-2'],
        data: {
          device: devices.find((d) => d.id === 'web-2')!,
          isActive:
            activePacket?.dstDeviceId === 'web-2' ||
            activePacket?.srcDeviceId === 'web-2',
        },
      },
    ];
  }, [
    devices,
    mode,
    table.length,
    dynamicPoolStatus,
    portStatus,
    activePacket,
    isRouterProcessing,
    isRouterDropped,
  ]);

  // Construct React Flow Edges
  const edges: Edge[] = useMemo(() => {
    const isOutboundFrom = (id: string) =>
      activePacket?.direction === 'outbound' && activePacket?.srcDeviceId === id;
    const isInboundTo = (id: string) =>
      activePacket?.direction === 'inbound' && activePacket?.dstDeviceId === id;
    const isOutboundTo = (id: string) =>
      activePacket?.direction === 'outbound' && activePacket?.dstDeviceId === id;
    const isInboundFrom = (id: string) =>
      activePacket?.direction === 'inbound' && activePacket?.srcDeviceId === id;

    return [
      // LAN Edges: PC to Router
      {
        id: 'e-pc1-nat',
        source: 'pc-1',
        target: 'nat-router',
        sourceHandle: 'right',
        targetHandle: 'lan-in',
        animated: isOutboundFrom('pc-1') || isInboundTo('pc-1'),
        style: {
          stroke: isOutboundFrom('pc-1') || isInboundTo('pc-1') ? '#38bdf8' : '#334155',
          strokeWidth: isOutboundFrom('pc-1') || isInboundTo('pc-1') ? 3 : 2,
        },
      },
      {
        id: 'e-pc2-nat',
        source: 'pc-2',
        target: 'nat-router',
        sourceHandle: 'right',
        targetHandle: 'lan-in',
        animated: isOutboundFrom('pc-2') || isInboundTo('pc-2'),
        style: {
          stroke: isOutboundFrom('pc-2') || isInboundTo('pc-2') ? '#38bdf8' : '#334155',
          strokeWidth: isOutboundFrom('pc-2') || isInboundTo('pc-2') ? 3 : 2,
        },
      },
      {
        id: 'e-pc3-nat',
        source: 'pc-3',
        target: 'nat-router',
        sourceHandle: 'right',
        targetHandle: 'lan-in',
        animated: isOutboundFrom('pc-3') || isInboundTo('pc-3'),
        style: {
          stroke: isOutboundFrom('pc-3') || isInboundTo('pc-3') ? '#38bdf8' : '#334155',
          strokeWidth: isOutboundFrom('pc-3') || isInboundTo('pc-3') ? 3 : 2,
        },
      },
      // WAN Edges: Router to Web Servers
      {
        id: 'e-nat-web1',
        source: 'nat-router',
        target: 'web-1',
        sourceHandle: 'wan-out',
        targetHandle: 'left',
        animated: isOutboundTo('web-1') || isInboundFrom('web-1'),
        style: {
          stroke: isOutboundTo('web-1') || isInboundFrom('web-1') ? '#818cf8' : '#334155',
          strokeWidth: isOutboundTo('web-1') || isInboundFrom('web-1') ? 3 : 2,
        },
      },
      {
        id: 'e-nat-web2',
        source: 'nat-router',
        target: 'web-2',
        sourceHandle: 'wan-out',
        targetHandle: 'left',
        animated: isOutboundTo('web-2') || isInboundFrom('web-2'),
        style: {
          stroke: isOutboundTo('web-2') || isInboundFrom('web-2') ? '#818cf8' : '#334155',
          strokeWidth: isOutboundTo('web-2') || isInboundFrom('web-2') ? 3 : 2,
        },
      },
    ];
  }, [activePacket]);

  // Animated Packet Coordinates Calculation
  const packetAnimationCoords = useMemo(() => {
    if (!activePacket) return null;

    const routerPos = NODE_CENTERS['nat-router'];
    let startPos = NODE_CENTERS['pc-1'];
    let endPos = NODE_CENTERS['web-1'];

    if (activePacket.direction === 'outbound') {
      startPos = NODE_CENTERS[activePacket.srcDeviceId] || NODE_CENTERS['pc-1'];
      endPos = NODE_CENTERS[activePacket.dstDeviceId] || NODE_CENTERS['web-1'];

      if (activePacket.status === 'created') {
        return { x: startPos.x, y: startPos.y };
      }
      if (activePacket.status === 'processing' || activePacket.status === 'translated') {
        return { x: routerPos.x, y: routerPos.y };
      }
      if (activePacket.status === 'dropped') {
        return { x: routerPos.x, y: routerPos.y };
      }
      if (activePacket.status === 'delivered') {
        return { x: endPos.x, y: endPos.y };
      }
    } else {
      // Inbound Packet
      startPos = NODE_CENTERS[activePacket.srcDeviceId] || NODE_CENTERS['web-1'];
      endPos = NODE_CENTERS[activePacket.dstDeviceId] || NODE_CENTERS['pc-1'];

      if (activePacket.status === 'created') {
        return { x: startPos.x, y: startPos.y };
      }
      if (activePacket.status === 'processing' || activePacket.status === 'translated') {
        return { x: routerPos.x, y: routerPos.y };
      }
      if (activePacket.status === 'dropped') {
        return { x: routerPos.x, y: routerPos.y };
      }
      if (activePacket.status === 'delivered') {
        return { x: endPos.x, y: endPos.y };
      }
    }

    return { x: routerPos.x, y: routerPos.y };
  }, [activePacket]);

  return (
    <div className="relative w-full h-[470px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
      {/* Zone Annotations */}
      <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
          Private LAN (192.168.1.0/24)
        </span>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
          NAT Router Boundary
        </span>
      </div>

      <div className="absolute top-3 right-6 z-10 pointer-events-none flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
        <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
          Public Internet (WAN)
        </span>
      </div>

      {/* React Flow Topology */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
        <Controls showInteractive={false} className="!bg-slate-900 !border-slate-800 !text-slate-300" />
      </ReactFlow>

      {/* Animated Framer-Motion Packet Overlay */}
      <AnimatePresence>
        {activePacket && packetAnimationCoords && (
          <motion.div
            key={activePacket.id + activePacket.status}
            initial={{
              x: packetAnimationCoords.x,
              y: packetAnimationCoords.y,
              scale: 0.6,
              opacity: 0,
            }}
            animate={{
              x: packetAnimationCoords.x,
              y: packetAnimationCoords.y,
              scale: 1,
              opacity: 1,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 18,
              mass: 0.8,
            }}
            className="absolute top-0 left-0 -ml-16 -mt-10 z-30 pointer-events-none"
          >
            {/* Packet visual entity */}
            <div
              className={`flex flex-col items-center transition-all ${
                activePacket.status === 'dropped' ? 'animate-drop-shake' : ''
              }`}
            >
              {/* Packet Pill */}
              <div
                className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-bold shadow-2xl flex items-center space-x-2 border ${
                  activePacket.status === 'dropped'
                    ? 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/50 shadow-rose-500/50'
                    : activePacket.direction === 'outbound'
                    ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/40 shadow-blue-500/40'
                    : 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/40 shadow-indigo-500/40'
                }`}
              >
                <span>
                  {activePacket.protocol} {activePacket.direction === 'outbound' ? '➔' : '⬅'}
                </span>
                <span>
                  {activePacket.translatedHeader
                    ? `${activePacket.translatedHeader.srcPort}➔${activePacket.translatedHeader.dstPort}`
                    : `${activePacket.originalHeader.srcPort}➔${activePacket.originalHeader.dstPort}`}
                </span>
              </div>

              {/* Floating Header Rewrite / Drop Status Callout */}
              {activePacket.status === 'processing' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono shadow-lg whitespace-nowrap"
                >
                  Inspecting NAT Mapping...
                </motion.div>
              )}

              {activePacket.status === 'translated' && activePacket.translatedHeader && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-1 px-3 py-1 rounded-lg bg-emerald-950/95 border border-emerald-400/80 text-emerald-200 text-[10px] font-mono shadow-2xl flex items-center space-x-1.5 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {activePacket.direction === 'outbound'
                      ? `Src Rewritten: ${activePacket.originalHeader.srcIp}:${activePacket.originalHeader.srcPort} ➔ ${activePacket.translatedHeader.srcIp}:${activePacket.translatedHeader.srcPort}`
                      : `Dst Rewritten: ${activePacket.originalHeader.dstIp}:${activePacket.originalHeader.dstPort} ➔ ${activePacket.translatedHeader.dstIp}:${activePacket.translatedHeader.dstPort}`}
                  </span>
                </motion.div>
              )}

              {activePacket.status === 'dropped' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-1 px-3 py-1 rounded-lg bg-rose-950/95 border border-rose-400/80 text-rose-200 text-[10px] font-bold font-mono shadow-2xl flex items-center space-x-1.5 whitespace-nowrap"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>DROP: {activePacket.dropReason}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
