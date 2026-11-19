import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { NatMode, Protocol } from '../../../shared/types';
import {
  Send,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ControlBar: React.FC = () => {
  const {
    connected,
    mode,
    setMode,
    devices,
    selectedSrcDeviceId,
    selectedDstDeviceId,
    setSelectedSrcDevice,
    setSelectedDstDevice,
    protocol,
    setProtocol,
    srcPort,
    setSrcPort,
    icmpId,
    setIcmpId,
    autoReply,
    setAutoReply,
    sendPacket,
    sendUnsolicited,
    resetSimulation,
    activePacket,
  } = useSimStore();

  const isBusy = activePacket !== null && activePacket.status !== 'dropped';

  const modeDescriptions: Record<NatMode, string> = {
    PAT: 'Many private hosts → 1 Public IP (203.0.113.5) via unique ports 40000–50000',
    DYNAMIC: 'Private hosts lease from Public Pool (203.0.113.20–21); drops when pool is exhausted',
    STATIC: 'Fixed 1-to-1 IP bindings; unmapped hosts (e.g. PC-03) dropped with NO_TRANSLATION_MAPPING',
  };

  const hosts = devices.filter((d) => d.type === 'pc');
  const servers = devices.filter((d) => d.type === 'web');

  return (
    <header className="bg-slate-900 border-b border-slate-800/90 shadow-xl px-5 py-3">
      {/* Top row: App Brand, Mode Switcher, and Connection Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            NAT
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-100 flex items-center space-x-2">
              <span>NAT Address Translation Simulator</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                v1.0 Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-time header rewriting, live PAT/Dynamic/Static translation tables & TTL decay
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          {(['PAT', 'DYNAMIC', 'STATIC'] as NatMode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
                  active
                    ? m === 'PAT'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : m === 'DYNAMIC'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>
                  {m === 'PAT' ? 'PAT (Overload)' : m === 'DYNAMIC' ? 'Dynamic NAT' : 'Static NAT'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Server status & Reset */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800">
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">Socket Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="text-rose-400 font-medium">Connecting...</span>
              </>
            )}
          </div>

          <button
            onClick={resetSimulation}
            className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition border border-slate-700"
            title="Reset simulation state, NAT table, and packet log"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mode contextual explainer banner */}
      <div className="my-2.5 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            Mode Active
          </span>
          <span className="font-mono text-emerald-400 font-semibold">{mode}</span>
          <span className="text-slate-400">—</span>
          <span>{modeDescriptions[mode]}</span>
        </div>
      </div>

      {/* Bottom row: Packet Builder Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Host Select */}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium">Source:</label>
            <select
              value={selectedSrcDeviceId}
              onChange={(e) => setSelectedSrcDevice(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
            >
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.privateIp})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

          {/* Destination Server Select */}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium">Destination:</label>
            <select
              value={selectedDstDeviceId}
              onChange={(e) => setSelectedDstDevice(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.publicIp}:{s.id === 'web-1' ? '80' : '443'})
                </option>
              ))}
            </select>
          </div>

          {/* Protocol Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['TCP', 'UDP', 'ICMP'] as Protocol[]).map((p) => (
              <button
                key={p}
                onClick={() => setProtocol(p)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  protocol === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Port / ICMP ID input */}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium">
              {protocol === 'ICMP' ? 'Echo ID:' : 'Src Port:'}
            </label>
            <input
              type="number"
              min={1}
              max={65535}
              value={protocol === 'ICMP' ? icmpId : srcPort}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 1;
                if (protocol === 'ICMP') {
                  setIcmpId(val);
                } else {
                  setSrcPort(val);
                }
              }}
              className="w-20 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Auto-reply toggle */}
          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={autoReply}
              onChange={(e) => setAutoReply(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span>Auto-Reply</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => sendPacket()}
            disabled={isBusy}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              isBusy
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Packet</span>
          </button>

          <button
            onClick={() =>
              sendUnsolicited(
                mode === 'STATIC' ? '203.0.113.10' : '203.0.113.5',
                9999,
                protocol
              )
            }
            disabled={isBusy}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
              isBusy
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 active:scale-95'
            }`}
            title="Simulates unsolicited inbound traffic from the Internet to test firewall drop behavior"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Unsolicited Inbound</span>
          </button>
        </div>
      </div>
    </header>
  );
};
