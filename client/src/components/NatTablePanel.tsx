import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Table, Clock, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Zap } from 'lucide-react';

export const NatTablePanel: React.FC = () => {
  const { table, mode, lastTranslatedPacket } = useSimStore();
  const [showRfcHelper, setShowRfcHelper] = useState(true);

  // Compute RFC Address Helper values based on last translated packet or first active entry
  const firstEntry = table[0];
  const rfcInsideLocal = lastTranslatedPacket
    ? lastTranslatedPacket.direction === 'outbound'
      ? `${lastTranslatedPacket.originalHeader.srcIp}:${lastTranslatedPacket.originalHeader.srcPort}`
      : `${lastTranslatedPacket.translatedHeader?.dstIp}:${lastTranslatedPacket.translatedHeader?.dstPort}`
    : firstEntry
    ? `${firstEntry.insideLocalIp}:${firstEntry.insideLocalPort}`
    : '192.168.1.10:5000';

  const rfcInsideGlobal = lastTranslatedPacket
    ? lastTranslatedPacket.direction === 'outbound'
      ? `${lastTranslatedPacket.translatedHeader?.srcIp}:${lastTranslatedPacket.translatedHeader?.srcPort}`
      : `${lastTranslatedPacket.originalHeader.dstIp}:${lastTranslatedPacket.originalHeader.dstPort}`
    : firstEntry
    ? `${firstEntry.insideGlobalIp}:${firstEntry.insideGlobalPort}`
    : '203.0.113.5:40000';

  const rfcOutsideLocal = lastTranslatedPacket
    ? `${lastTranslatedPacket.originalHeader.dstIp}:${lastTranslatedPacket.originalHeader.dstPort}`
    : firstEntry
    ? `${firstEntry.outsideIp}:${firstEntry.outsidePort}`
    : '8.8.8.8:80';

  const rfcOutsideGlobal = rfcOutsideLocal;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>Live NAT Translation Table</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {table.length} {table.length === 1 ? 'entry' : 'entries'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Authoritative state refreshed and timed out per 1-second ticks
            </p>
          </div>
        </div>

        {/* Toggle RFC helper */}
        <button
          onClick={() => setShowRfcHelper(!showRfcHelper)}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>RFC Helper</span>
          {showRfcHelper ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* RFC 3022 Terminology Card */}
      {showRfcHelper && (
        <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RFC 3022 Address Terminology Helper</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              (Live values from last translated packet)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-blue-500/20">
              <span className="text-[10px] text-blue-400 font-sans font-bold block mb-0.5">
                Inside Local
              </span>
              <span className="text-slate-200 font-semibold">{rfcInsideLocal}</span>
              <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                Host private IP:port
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 font-sans font-bold block mb-0.5">
                Inside Global
              </span>
              <span className="text-emerald-300 font-semibold">{rfcInsideGlobal}</span>
              <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                Router translated public IP:port
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-indigo-500/20">
              <span className="text-[10px] text-indigo-400 font-sans font-bold block mb-0.5">
                Outside Local
              </span>
              <span className="text-slate-300 font-semibold">{rfcOutsideLocal}</span>
              <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                Destination IP:port from LAN
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-indigo-500/20">
              <span className="text-[10px] text-indigo-400 font-sans font-bold block mb-0.5">
                Outside Global
              </span>
              <span className="text-slate-300 font-semibold">{rfcOutsideGlobal}</span>
              <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                Server actual public IP:port
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NAT Table */}
      <div className="mt-3 flex-1 overflow-x-auto overflow-y-auto max-h-[300px]">
        {table.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <Zap className="w-8 h-8 mb-2 text-slate-600 opacity-60" />
            <p className="text-xs font-medium text-slate-400">No active NAT translation entries</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Send a packet or run a test scenario to populate mappings
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Mode</th>
                <th className="py-2 px-3">Proto</th>
                <th className="py-2 px-3 text-blue-400">Inside Local</th>
                <th className="py-2 px-3 text-emerald-400">Inside Global</th>
                <th className="py-2 px-3 text-indigo-400">Outside</th>
                <th className="py-2 px-3 text-right">TTL (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {table.map((entry, idx) => {
                const ttlPercent = entry.isStatic ? 100 : Math.max(0, (entry.ttl / 30) * 100);
                const ttlColor =
                  entry.ttl > 10
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                    : entry.ttl > 5
                    ? 'text-amber-400 bg-amber-950/60 border-amber-800/50'
                    : 'text-rose-400 bg-rose-950/60 border-rose-800/50';

                const insideLocalFormatted =
                  entry.protocol === 'ICMP'
                    ? `${entry.insideLocalIp} (id ${entry.insideLocalPort})`
                    : `${entry.insideLocalIp}:${entry.insideLocalPort}`;

                const insideGlobalFormatted =
                  entry.protocol === 'ICMP'
                    ? `${entry.insideGlobalIp}:${entry.insideGlobalPort}`
                    : `${entry.insideGlobalIp}:${entry.insideGlobalPort}`;

                const outsideFormatted =
                  entry.protocol === 'ICMP'
                    ? entry.outsideIp
                    : `${entry.outsideIp}:${entry.outsidePort}`;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          entry.mode === 'PAT'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : entry.mode === 'DYNAMIC'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}
                      >
                        {entry.mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{entry.protocol}</td>
                    <td className="py-2.5 px-3 text-blue-300">{insideLocalFormatted}</td>
                    <td className="py-2.5 px-3 text-emerald-300 font-bold">
                      {insideGlobalFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-300">{outsideFormatted}</td>
                    <td className="py-2.5 px-3 text-right">
                      {entry.isStatic ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          ∞ (Static)
                        </span>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          {/* Mini Progress Bar */}
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                entry.ttl > 10
                                  ? 'bg-emerald-500'
                                  : entry.ttl > 5
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${ttlPercent}%` }}
                            />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${ttlColor}`}
                          >
                            {entry.ttl}s
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
