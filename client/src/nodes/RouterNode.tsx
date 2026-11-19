import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Network, Activity, Layers, ShieldCheck } from 'lucide-react';
import { DynamicPoolStatus, NatMode, PortStatus } from '../../../shared/types';

interface RouterNodeProps {
  data: {
    mode: NatMode;
    activeCount: number;
    dynamicPoolStatus: DynamicPoolStatus | null;
    portStatus: PortStatus | null;
    isProcessing: boolean;
    isDropped: boolean;
    dropReason?: string;
  };
}

export const RouterNode: React.FC<RouterNodeProps> = ({ data }) => {
  const { mode, activeCount, dynamicPoolStatus, portStatus, isProcessing, isDropped, dropReason } =
    data;

  const modeColors: Record<NatMode, { badge: string; border: string }> = {
    PAT: { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', border: 'border-emerald-500/40' },
    DYNAMIC: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40', border: 'border-amber-500/40' },
    STATIC: { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/40', border: 'border-purple-500/40' },
  };

  return (
    <div
      className={`relative px-5 py-4 rounded-2xl border transition-all duration-300 shadow-2xl min-w-[260px] ${
        isDropped
          ? 'bg-rose-950/90 border-rose-500 ring-4 ring-rose-500/50 shadow-rose-500/30'
          : isProcessing
          ? 'bg-slate-900 border-emerald-400 ring-4 ring-emerald-500/40 shadow-emerald-500/20'
          : 'bg-slate-900/95 border-slate-700 hover:border-slate-500'
      }`}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="lan-in"
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="lan-out"
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-slate-900 opacity-0 pointer-events-none"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="wan-out"
        className="!w-3.5 !h-3.5 !bg-indigo-500 !border-2 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="wan-in"
        className="!w-3.5 !h-3.5 !bg-indigo-500 !border-2 !border-slate-900 opacity-0 pointer-events-none"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>NAT Gateway</span>
              {isProcessing && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Border Router</span>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${modeColors[mode].badge}`}
        >
          {mode}
        </span>
      </div>

      {/* Dual Interfaces */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-blue-400 font-semibold uppercase flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Inside (LAN)</span>
          </div>
          <div className="font-mono text-xs text-slate-200 mt-0.5">192.168.1.1</div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-indigo-400 font-semibold uppercase flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Outside (WAN)</span>
          </div>
          <div className="font-mono text-xs text-slate-200 mt-0.5">203.0.113.5</div>
        </div>
      </div>

      {/* Live State Details */}
      <div className="space-y-1.5 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
        <div className="flex justify-between items-center text-slate-400">
          <span className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Sessions:</span>
          </span>
          <span className="text-emerald-300 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            {activeCount}
          </span>
        </div>

        {mode === 'PAT' && portStatus && (
          <div className="flex justify-between items-center text-slate-400">
            <span>PAT Port Range:</span>
            <span className="text-slate-300 font-medium">40000–50000</span>
          </div>
        )}

        {mode === 'DYNAMIC' && dynamicPoolStatus && (
          <div className="flex justify-between items-center text-slate-400">
            <span>Public IP Pool:</span>
            <span
              className={`font-semibold ${
                dynamicPoolStatus.availableCount === 0 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {dynamicPoolStatus.pool.length - dynamicPoolStatus.availableCount}/
              {dynamicPoolStatus.pool.length} Leased
            </span>
          </div>
        )}

        {mode === 'STATIC' && (
          <div className="flex justify-between items-center text-slate-400">
            <span>Mapping Type:</span>
            <span className="text-purple-300">1-to-1 Bidirectional</span>
          </div>
        )}
      </div>

      {/* Processing or Dropped Banner */}
      {isDropped && (
        <div className="mt-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-center py-1 px-2 rounded-lg text-[11px] font-semibold animate-pulse">
          DROPPED: {dropReason}
        </div>
      )}
      {isProcessing && !isDropped && (
        <div className="mt-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center py-1 px-2 rounded-lg text-[11px] font-semibold animate-pulse">
          Rewriting Headers...
        </div>
      )}
    </div>
  );
};
