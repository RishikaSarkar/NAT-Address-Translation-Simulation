import React, { useEffect } from 'react';
import { useSimStore } from './store/useSimStore';
import { ControlBar } from './components/ControlBar';
import { TopologyCanvas } from './components/TopologyCanvas';
import { NatTablePanel } from './components/NatTablePanel';
import { PacketInspectorLog } from './components/PacketInspectorLog';
import { TestPresetsBar } from './components/TestPresetsBar';

export const App: React.FC = () => {
  const { initSocket } = useSimStore();

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Top Controls & App Header */}
      <ControlBar />

      {/* Main Interactive Workspace */}
      <main className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-0 overflow-y-auto">
        {/* Left Side: Topology + Packet Inspector */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <TopologyCanvas />
          <PacketInspectorLog />
        </div>

        {/* Right Side: Live NAT Table & RFC Helper */}
        <div className="xl:col-span-5 flex flex-col">
          <NatTablePanel />
        </div>
      </main>

      {/* Bottom 1-Click Verification Test Bar */}
      <TestPresetsBar />
    </div>
  );
};

export default App;
