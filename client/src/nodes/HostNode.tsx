import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, ShieldAlert, Cpu } from 'lucide-react';
import { Device, NatMode } from '../../../shared/types';

interface HostNodeProps {
  data: {
    device: Device;
    isActive: boolean;
    mode: NatMode;
  };
}

export const HostNode: React.FC<HostNodeProps> = ({ data }) => {
  const { device, isActive, mode } = data;

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border transition-all duration-300 shadow-lg min-w-[170px] ${
        isActive
          ? 'bg-blue-950/80 border-blue-400 ring-2 ring-blue-500/50 shadow-blue-500/20'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div
          className={`p-2 rounded-lg ${
            isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Monitor className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm tracking-wide text-slate-100">
              {device.name}
            </span>
            {isActive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400/90">
            Host (LAN)
          </span>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center text-slate-400 font-mono text-[11px] bg-slate-950/50 px-2 py-1 rounded">
          <span>IP:</span>
          <span className="text-slate-200 font-medium">{device.privateIp}</span>
        </div>

        {mode === 'STATIC' && (
          <div
            className={`flex items-center justify-between text-[10px] px-2 py-0.5 rounded font-mono ${
              device.staticMappedIp
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <span>Static NAT:</span>
            <span>{device.staticMappedIp || 'Unmapped'}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-slate-900 opacity-0 pointer-events-none"
      />
    </div>
  );
};
