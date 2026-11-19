import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Packet } from '../../../shared/types';
import {
  FileText,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const PacketInspectorLog: React.FC = () => {
  const { packets, selectedPacket, setSelectedPacket } = useSimStore();
  const [filterType, setFilterType] = useState<'ALL' | 'DELIVERED' | 'DROPPED'>('ALL');

  const filteredPackets = packets.filter((p) => {
    if (filterType === 'DELIVERED') return p.status === 'delivered';
    if (filterType === 'DROPPED') return p.status === 'dropped';
    return true;
  });

  const activeOrFirst = selectedPacket || packets[0] || null;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      {/* Panel Header & Filters */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>Packet Inspector & Event Log</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {packets.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Select any packet to inspect Before vs. After header transformations
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'DELIVERED', 'DROPPED'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                filterType === ft
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3 flex-1 min-h-0">
        {/* Left column: Event Log List */}
        <div className="lg:col-span-6 overflow-y-auto max-h-[320px] space-y-1.5 pr-1">
          {filteredPackets.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Clock className="w-7 h-7 mb-1 text-slate-600 opacity-60" />
              <p className="text-xs font-medium text-slate-400">No packet events logged yet</p>
            </div>
          ) : (
            filteredPackets.map((pkt) => {
              const isSelected = activeOrFirst?.id === pkt.id;
              const isDelivered = pkt.status === 'delivered';
              const isDropped = pkt.status === 'dropped';

              return (
                <div
                  key={pkt.id}
                  onClick={() => setSelectedPacket(pkt)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-150 font-mono ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-950/60 border-slate-800/90 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pkt.direction === 'outbound'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {pkt.direction.toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-200">{pkt.protocol}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px]">
                      {isDelivered && (
                        <span className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DELIVERED</span>
                        </span>
                      )}
                      {isDropped && (
                        <span className="flex items-center space-x-1 text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                          <AlertOctagon className="w-3 h-3" />
                          <span>{pkt.dropReason || 'DROPPED'}</span>
                        </span>
                      )}
                      {!isDelivered && !isDropped && (
                        <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {pkt.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">
                      {pkt.originalHeader.srcIp}:{pkt.originalHeader.srcPort} ➔{' '}
                      {pkt.originalHeader.dstIp}:{pkt.originalHeader.dstPort}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      {new Date(pkt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Before vs. After Header Inspector Table */}
        <div className="lg:col-span-6 bg-slate-950/80 rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Header Diff Inspection</span>
              </span>
              {activeOrFirst && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  ID: {activeOrFirst.id}
                </span>
              )}
            </div>

            {activeOrFirst ? (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                        <th className="pb-1.5">Field</th>
                        <th className="pb-1.5 text-blue-400">Before NAT (Ingress)</th>
                        <th className="pb-1.5 text-emerald-400">After NAT (Egress)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-[11px]">
                      <tr>
                        <td className="py-1.5 text-slate-400 font-medium">Source IP</td>
                        <td className="py-1.5 text-slate-200">
                          {activeOrFirst.originalHeader.srcIp}
                        </td>
                        <td className="py-1.5">
                          {activeOrFirst.translatedHeader ? (
                            <span
                              className={
                                activeOrFirst.translatedHeader.srcIp !==
                                activeOrFirst.originalHeader.srcIp
                                  ? 'text-emerald-300 font-bold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-700/40'
                                  : 'text-slate-300'
                              }
                            >
                              {activeOrFirst.translatedHeader.srcIp}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-1.5 text-slate-400 font-medium">
                          {activeOrFirst.protocol === 'ICMP' ? 'Src Echo ID' : 'Source Port'}
                        </td>
                        <td className="py-1.5 text-slate-200">
                          {activeOrFirst.originalHeader.srcPort}
                        </td>
                        <td className="py-1.5">
                          {activeOrFirst.translatedHeader ? (
                            <span
                              className={
                                activeOrFirst.translatedHeader.srcPort !==
                                activeOrFirst.originalHeader.srcPort
                                  ? 'text-emerald-300 font-bold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-700/40'
                                  : 'text-slate-300'
                              }
                            >
                              {activeOrFirst.translatedHeader.srcPort}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-1.5 text-slate-400 font-medium">Dest IP</td>
                        <td className="py-1.5 text-slate-200">
                          {activeOrFirst.originalHeader.dstIp}
                        </td>
                        <td className="py-1.5">
                          {activeOrFirst.translatedHeader ? (
                            <span
                              className={
                                activeOrFirst.translatedHeader.dstIp !==
                                activeOrFirst.originalHeader.dstIp
                                  ? 'text-emerald-300 font-bold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-700/40'
                                  : 'text-slate-300'
                              }
                            >
                              {activeOrFirst.translatedHeader.dstIp}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td className="py-1.5 text-slate-400 font-medium">
                          {activeOrFirst.protocol === 'ICMP' ? 'Dst Echo ID' : 'Dest Port'}
                        </td>
                        <td className="py-1.5 text-slate-200">
                          {activeOrFirst.originalHeader.dstPort}
                        </td>
                        <td className="py-1.5">
                          {activeOrFirst.translatedHeader ? (
                            <span
                              className={
                                activeOrFirst.translatedHeader.dstPort !==
                                activeOrFirst.originalHeader.dstPort
                                  ? 'text-emerald-300 font-bold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-700/40'
                                  : 'text-slate-300'
                              }
                            >
                              {activeOrFirst.translatedHeader.dstPort}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {activeOrFirst.status === 'dropped' && (
                  <div className="bg-rose-950/80 border border-rose-500/40 rounded-lg p-2.5 text-xs text-rose-200">
                    <span className="font-bold flex items-center space-x-1.5 text-rose-300 mb-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Packet Dropped by Router</span>
                    </span>
                    <span className="text-[11px] font-mono text-rose-400">
                      Reason: {activeOrFirst.dropReason}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No packet selected for inspection
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
