import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Play, CheckCircle, Flame, ShieldAlert, Cpu } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  badge: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'T1',
    name: 'T1: PAT TCP Outbound',
    description: 'PC-01 sends TCP to 8.8.8.8:80; source rewritten to 203.0.113.5:40000',
    badge: 'PAT',
  },
  {
    id: 'T2',
    name: 'T2: PAT Multi-Host',
    description: 'PC-01 & PC-02 send with port 5000; assigned distinct public ports 40000 & 40001',
    badge: 'PAT',
  },
  {
    id: 'T3',
    name: 'T3: Inbound Reply',
    description: 'Full round-trip: Server replies to 203.0.113.5:port, restored & delivered to PC',
    badge: 'Inbound',
  },
  {
    id: 'T4',
    name: 'T4: ICMP Ping',
    description: 'PC-01 pings 8.8.8.8; Echo ID (1) mapped to PAT identifier (40002) in place of port',
    badge: 'ICMP',
  },
  {
    id: 'T5',
    name: 'T5: Unsolicited Drop',
    description: 'External host sends to router on unmapped port; dropped with NO_TRANSLATION_MAPPING',
    badge: 'Firewall',
  },
  {
    id: 'T6',
    name: 'T6: TTL Expiry',
    description: 'Creates temporary session; watch 30s countdown tick down, expire, and free port',
    badge: 'TTL',
  },
  {
    id: 'T7',
    name: 'T7: Dynamic Pool Exhaustion',
    description: 'Pool has 2 IPs (.20, .21); 3 hosts send -> 3rd host dropped with NAT_POOL_EXHAUSTED',
    badge: 'Dynamic',
  },
  {
    id: 'T8',
    name: 'T8: Static NAT',
    description: 'PC-01 uses fixed 203.0.113.10; unmapped PC-03 drops with NO_TRANSLATION_MAPPING',
    badge: 'Static',
  },
];

export const TestPresetsBar: React.FC = () => {
  const { runTestScenario, activeTestId } = useSimStore();

  return (
    <div className="bg-slate-900/90 border-t border-slate-800/80 px-5 py-2.5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Automated Verification Suite (Report Scenarios T1–T8)
          </span>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            — One-click verification of every NAT translation rule and edge case
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        {TEST_CASES.map((tc) => {
          const isActive = activeTestId === tc.id;

          return (
            <button
              key={tc.id}
              onClick={() => runTestScenario(tc.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 hover:text-slate-100'
              }`}
              title={tc.description}
            >
              <Play
                className={`w-3 h-3 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'
                }`}
              />
              <span className="font-semibold">{tc.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
