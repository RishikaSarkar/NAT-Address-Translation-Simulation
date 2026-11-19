import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, Server, Cloud } from 'lucide-react';
import { Device } from '../../../shared/types';

interface ServerNodeProps {
  data: {
    device: Device;
    isActive: boolean;
  };
}

export const ServerNode: React.FC<ServerNodeProps> = ({ data }) => {
  const { device, isActive } = data;
  const isDns = device.id === 'web-1';

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border transition-all duration-300 shadow-lg min-w-[170px] ${
        isActive
          ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-indigo-500/20'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900 opacity-0 pointer-events-none"
      />

      <div className="flex items-center space-x-3 mb-2">
        <div
          className={`p-2 rounded-lg ${
            isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isDns ? <Globe className="w-5 h-5" /> : <Server className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm tracking-wide text-slate-100">
              {device.name}
            </span>
            {isActive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400/90">
            {isDns ? 'DNS / Web' : 'Cloud Server'}
          </span>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center text-slate-400 font-mono text-[11px] bg-slate-950/50 px-2 py-1 rounded">
          <span>IP:</span>
          <span className="text-slate-200 font-medium">{device.publicIp}</span>
        </div>

        <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] px-2 py-0.5">
          <span>Port:</span>
          <span className="text-indigo-300">{isDns ? '80 (HTTP)' : '443 (HTTPS)'}</span>
        </div>
      </div>
    </div>
  );
};
