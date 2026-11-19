# NAT Address Translation Simulator

An interactive, real-time educational tool that visualizes **Network Address Translation (NAT)** as specified in RFC 1631 / RFC 3022. Users can send simulated TCP, UDP, and ICMP packets across a multi-segment network topology (Private LAN $\rightarrow$ NAT Gateway Router $\rightarrow$ Public Internet), inspect step-by-step IP and port header translations, observe an authoritative translation table with a 1-second TTL countdown loop, and verify edge cases such as pool exhaustion and firewall drop behavior.

---

## Architecture & Features

### 1. Three Supported NAT Modes
- **PAT (Port Address Translation / NAT Overload):**
  - Many private hosts share a single primary public IP (`203.0.113.5`).
  - Sequentially allocates dynamic public ports from range `40000–50000`.
  - For ICMP Ping packets, maps the Echo Identifier (e.g. `1`) to the allocated PAT port (`40002`).
  - Active sessions refresh their 30-second TTL on subsequent traffic.
- **Dynamic NAT:**
  - Configurable public IP pool: `['203.0.113.20', '203.0.113.21']`.
  - Private hosts lease an IP from the pool on demand while maintaining their local port.
  - When the pool of 2 IPs is exhausted by active hosts, additional outbound traffic is dropped with `NAT_POOL_EXHAUSTED`.
- **Static NAT:**
  - Fixed 1-to-1 bidirectional mappings (`192.168.1.10` $\leftrightarrow$ `203.0.113.10`, `192.168.1.11` $\leftrightarrow$ `203.0.113.11`).
  - Entries are permanent (`∞ (Static)`) and do not expire.
  - Unmapped hosts (such as `PC-03`) are dropped with `NO_TRANSLATION_MAPPING`.

### 2. Live Network Topology (React Flow + Framer Motion)
- **Private LAN (`192.168.1.0/24`):** `PC-01` (`.10`), `PC-02` (`.11`), and `PC-03` (`.12`).
- **NAT Gateway Router:** Inside interface `192.168.1.1`, outside public interface `203.0.113.5`.
- **Public Internet Servers:** `WEB-1` (`8.8.8.8:80` - DNS/Web), `WEB-2` (`1.1.1.1:443` - Cloud Server).
- **Smooth Packet Motion & Router Pause:** Packets animate along cables, pause at the NAT router for header inspection and rewriting, and continue to destination or shake red on drops.

### 3. Live NAT Translation Table & RFC Helper
- Columns: `#`, `Mode`, `Proto`, `Inside Local`, `Inside Global`, `Outside`, and `TTL (s)`.
- Live visual progress bar and countdown timer (30s down to 1s, turning amber $<10$s, red $<5$s, or `∞ (Static)`).
- **RFC 3022 Address Terminology Helper:** Dynamically populates the 4 fundamental NAT addresses (*Inside Local*, *Inside Global*, *Outside Local*, *Outside Global*) based on the latest translated packet.

### 4. Packet Inspector & Lifecycle Event Log
- Step-by-step event trace: `packet:created` $\rightarrow$ `packet:processing` $\rightarrow$ `packet:translated` $\rightarrow$ `packet:delivered` / `packet:dropped`.
- Interactive **Before vs. After Header Comparison Table** highlighting ingress vs. egress IP and Port/Echo ID changes.

### 5. Automated Verification Suite (Report Scenarios T1–T8)
Quick-trigger buttons in the UI and automated test CLI covering:
- **T1: PAT TCP Outbound** — `PC-01` sends TCP to `8.8.8.8:80`; source rewritten to `203.0.113.5:40000`.
- **T2: PAT Multi-Host** — `PC-01` & `PC-02` both send using port `5000`; assigned distinct public ports `40000` & `40001`.
- **T3: Inbound Reply** — Full round-trip server response restored and delivered to private host.
- **T4: ICMP Ping** — Echo ID mapped to PAT identifier in place of transport port.
- **T5: Unsolicited Drop** — External traffic to unmapped router port dropped with `NO_TRANSLATION_MAPPING`.
- **T6: TTL Expiry** — 30s countdown timer expiry and automatic port reclamation.
- **T7: Dynamic Pool Exhaustion** — 3 hosts attempt outbound traffic across 2 pool IPs; 3rd dropped with `NAT_POOL_EXHAUSTED`.
- **T8: Static NAT** — Mapped `PC-01` translates to fixed IP; unmapped `PC-03` dropped.

---

## Monorepo Layout

```text
nat-simulator/
├── package.json              # Root workspace scripts ("install:all", "dev", "build", "test")
├── shared/                   # Shared TypeScript models & interfaces
│   ├── package.json
│   └── types.ts
├── server/                   # Node.js + Express + Socket.IO + TypeScript backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts          # Express + Socket.IO setup & event handlers
│       ├── NatEngine.ts      # Core outbound/inbound translation & drop logic
│       ├── PortManager.ts    # Port allocation (40000-50000) & Dynamic IP pool manager
│       ├── NatTable.ts       # Translation table state + 1-second TTL tick loop
│       └── test-scenarios.ts # Automated test runner for T1-T8
└── client/                   # React 19 + TypeScript + Vite frontend
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── store/useSimStore.ts        # Zustand global state store
        ├── components/
        │   ├── ControlBar.tsx          # NAT Mode, Protocol, Packet Builder, Send buttons
        │   ├── TopologyCanvas.tsx      # React Flow topology + Framer Motion animated packets
        │   ├── NatTablePanel.tsx       # Live NAT table with RFC Helper & TTL countdown
        │   ├── PacketInspectorLog.tsx  # Lifecycle log + Before/After header diff inspector
        │   └── TestPresetsBar.tsx      # 1-click trigger buttons for T1–T8 test scenarios
        └── nodes/                      # Custom React Flow nodes (HostNode, RouterNode, ServerNode)
```

---

## Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Automated Verification Test Suite (T1–T8)
```bash
npm test
```
All 14 assertions across test scenarios T1 through T8 will execute and verify.

### 3. Start Development Servers (Backend + Frontend)
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API & Socket.IO: `http://localhost:3000` (or `process.env.PORT`)
