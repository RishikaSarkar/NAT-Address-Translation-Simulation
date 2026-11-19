# NAT Address Translation Simulator
**Course Code:** 21CSE460T – Network Protocols and Algorithms  
**Degree / Department:** B.Tech Computer Science and Engineering, Department of Computing Technologies  
**Institution:** SRM Institute of Science and Technology, Kattankulathur – 603 203  
**Academic Year:** 2026–2027  

---

## BONAFIDE CERTIFICATE

This is to certify that the Case Study Report titled **“NAT Address Translation Simulator”** is a bonafide record of work carried out by **Sameer Yadav (RA2311003010915)** as part of the course **Network Protocols and Algorithms (21CSE460T)**, during the academic year 2026–2027.

This report has been submitted in partial fulfillment of the requirements for the successful completion of the course and has not been submitted elsewhere for any academic or non-academic purpose.

The work is found to be satisfactory and is hereby accepted.

**Submitted by:**  
Sameer Yadav (RA2311003010915)  

**Faculty Guide:**  
Dr. Nalini Pusarla  
Associate Professor, Department of Computing Technologies  

**Head of Department:**  
Dr. Niranjana G  
Head of Department, Department of Computing Technologies  

---

## TABLE OF CONTENTS

1. [Abstract](#1-abstract)
2. [List of Figures](#2-list-of-figures)
3. [List of Tables](#3-list-of-tables)
4. [List of Abbreviations](#4-list-of-abbreviations)
5. [Chapter I: Introduction](#chapter-i-introduction)
   - 1.1 Background
   - 1.2 Problem Statement
   - 1.3 Motivation and Relevance
   - 1.4 Objectives
   - 1.5 Scope and Limitations
   - 1.6 Organization of the Report
6. [Chapter II: Literature Survey](#chapter-ii-literature-survey)
   - 2.1 Overview
   - 2.2 Existing Approaches
   - 2.3 Technology Review
   - 2.4 Comparison of Existing Tools
   - 2.5 Review of Related Technical Sources
   - 2.6 Research Gap and Justification
7. [Chapter III: System Design and Architecture](#chapter-iii-system-design-and-architecture)
   - 3.1 Overview
   - 3.2 System Requirements
   - 3.3 Proposed Architecture
   - 3.4 Technology Stack
   - 3.5 Backend Design
   - 3.6 Communication Design
   - 3.7 Data Models
   - 3.8 Frontend Design
   - 3.9 NAT Translation Algorithms
   - 3.10 Security and Privacy Considerations
8. [Chapter IV: Methodology](#chapter-iv-methodology)
   - 4.1 Development Approach
   - 4.2 Outbound Packet Processing
   - 4.3 Inbound Processing and TTL Cleanup
   - 4.4 Experimental Setup & Network Topology
   - 4.5 Test Plan
9. [Chapter V: Results and Discussion](#chapter-v-results-and-discussion)
   - 5.1 Simulator Output & Visual Analysis
   - 5.2 Observed Test Results (T1–T8)
   - 5.3 Comparison with Existing Tools
   - 5.4 Discussion of Findings
10. [Chapter VI: Conclusion and Future Work](#chapter-vi-conclusion-and-future-work)
    - 6.1 Conclusion
    - 6.2 Future Work
11. [Chapter VII: References](#chapter-vii-references)

---

## 1. ABSTRACT

Network Address Translation (NAT) is the foundational networking technique that enables multiple devices on a private Local Area Network (LAN) to share a single public IPv4 address, mitigating global address exhaustion. Despite its universal deployment in home, campus, and enterprise gateways, NAT operates invisibly at the router level. Networking curricula and textbooks traditionally present NAT through static routing tables and packet diagrams, leaving students with an incomplete mental model of how IP and transport-layer port headers are rewritten dynamically in real time.

This project designs and implements the **NAT Address Translation Simulator**, an interactive, full-stack web application that visualizes Network Address Translation in real time. The simulator models an end-to-end topology comprising private LAN hosts (`PC-01`, `PC-02`, `PC-03`), a dual-homed NAT gateway router, and public Internet servers (`WEB-1`, `WEB-2`). Users can construct and dispatch simulated TCP, UDP, and ICMP packets, observe animated packets traveling across network boundaries, inspect step-by-step header modifications at the router interface, and monitor an authoritative live translation table with an active 1-second Time-To-Live (TTL) countdown loop.

The application fully implements the three primary NAT operational modes:
1. **Port Address Translation (PAT / NAT Overload)** with dynamic port allocation in the range 40000–50000 and ICMP Echo Identifier mapping;
2. **Dynamic NAT** with a leased public address pool and automated pool exhaustion drop detection;
3. **Static NAT** featuring permanent 1-to-1 bidirectional address translation.

Built with a **React 19, TypeScript, Tailwind CSS, React Flow, and Framer Motion** frontend and a **Node.js, Express, and Socket.IO** backend, the system demonstrates high responsiveness, strict adherence to RFC 1631 and RFC 3022 specifications, and complete verification across all eight standardized test scenarios (T1–T8).

**Keywords:** Network Address Translation, PAT, Dynamic NAT, Static NAT, IPv4 Exhaustion, Socket.IO, React Flow, Framer Motion, Educational Technology.

---

## 2. LIST OF FIGURES

| Figure No. | Caption |
| :--- | :--- |
| **Figure 1.1** | Many private hosts sharing one public IP address through a NAT router |
| **Figure 2.1** | The four RFC 3022 NAT address types (Inside/Outside, Local/Global) |
| **Figure 2.2** | Static NAT, Dynamic NAT, and PAT architectural comparison |
| **Figure 3.1** | Overall multi-layer system architecture |
| **Figure 3.2** | Backend module decomposition and state relationships |
| **Figure 3.3** | Real-time event sequence between browser client and server |
| **Figure 3.4** | Data model entity relationships (Device, Packet, NatMapping) |
| **Figure 3.5** | Layout and visual component hierarchy of the simulator screen |
| **Figure 4.1** | Six-phase incremental development lifecycle |
| **Figure 4.2** | Flowchart of outbound packet processing and translation logic |
| **Figure 4.3** | Flowchart of inbound packet processing and 1-second TTL cleanup loop |
| **Figure 5.1** | Screenshot of network topology canvas with animated packet in transit |
| **Figure 5.2** | Screenshot of live NAT translation table with countdown badges |

---

## 3. LIST OF TABLES

| Table No. | Title |
| :--- | :--- |
| **Table 2.1** | Comparative evaluation of Static NAT, Dynamic NAT, and PAT |
| **Table 2.2** | Comparison of existing approaches to learning and testing NAT |
| **Table 2.3** | Summary of foundational standards, RFCs, and literature reviewed |
| **Table 3.1** | Functional requirements specification (FR1–FR8) |
| **Table 3.2** | Non-functional requirements and design performance targets |
| **Table 3.3** | System technology stack and component justification |
| **Table 3.4** | Socket.IO real-time event definitions and payloads |
| **Table 3.5** | Packet lifecycle outcomes and drop reasons |
| **Table 4.1** | Project development phases, milestones, and deliverable outputs |
| **Table 4.2** | Standardized evaluation test suite specification (T1–T8) |
| **Table 5.1** | Worked example: NAT translation table state during active PAT session |
| **Table 5.2** | Empirical test results across scenarios T1–T8 with verification status |
| **Table 5.3** | Feature matrix comparing proposed simulator with legacy tooling |

---

## 4. LIST OF ABBREVIATIONS

| Abbreviation | Expanded Form |
| :--- | :--- |
| **NAT** | Network Address Translation |
| **PAT** | Port Address Translation (NAT Overload) |
| **IP** | Internet Protocol |
| **IPv4 / IPv6** | Internet Protocol version 4 / version 6 |
| **LAN** | Local Area Network |
| **WAN** | Wide Area Network |
| **ISP** | Internet Service Provider |
| **TCP** | Transmission Control Protocol |
| **UDP** | User Datagram Protocol |
| **ICMP** | Internet Control Message Protocol |
| **TTL** | Time To Live (Session lifetime in translation table) |
| **CIDR** | Classless Inter-Domain Routing |
| **RFC** | Request for Comments (Internet Engineering Task Force standard) |
| **UI** | User Interface |
| **API** | Application Programming Interface |
| **HTTP** | Hypertext Transfer Protocol |
| **JSON** | JavaScript Object Notation |
| **DNS** | Domain Name System |
| **WS** | WebSocket (Full-duplex client-server communication) |

---

## CHAPTER I: INTRODUCTION

### 1.1 Background
The global Internet relies fundamentally on the Internet Protocol version 4 (IPv4) addressing architecture defined in RFC 791 [1]. Utilizing a 32-bit address field, IPv4 theoretically yields $2^{32} \approx 4.29 \times 10^9$ unique address identifiers. Rapid expansion of personal computers, mobile smartphones, cloud infrastructure, and Internet of Things (IoT) sensors has severely outstripped this capacity, resulting in complete exhaustion of unallocated IANA address blocks.

To stave off network exhaustion without requiring immediate, prohibitive global hardware replacement, RFC 1918 [2] reserved three dedicated private address spaces:
* `10.0.0.0/8` ($10.0.0.0$ to $10.255.255.255$, 16.7 million addresses)
* `172.16.0.0/12` ($172.16.0.0$ to $172.31.255.255$, 1.04 million addresses)
* `192.168.0.0/16` ($192.168.0.0$ to $192.168.255.255$, 65,536 addresses)

These addresses are non-routable over public Internet backbones; border routers discard incoming packets bearing private source or destination addresses. Network Address Translation (NAT), formalized in RFC 1631 [3] and refined in RFC 3022 [4], bridges this divide. Positioned at the boundary between a private LAN and the public Internet, a NAT gateway dynamically rewrites packet headers on egress and ingress, maintaining an authoritative translation state table so that thousands of private hosts can transparently share one or a small pool of registered public addresses.

### 1.2 Problem Statement
In existing network environments, NAT operations execute invisibly inside the operating system kernel or dedicated routing hardware. Learners encounter significant cognitive barriers because:
1. **Static Presentation:** Standard textbooks represent NAT through static tables and terminal outputs, failing to convey the chronological progression of port binding, session multiplexing, and table expiry.
2. **Setup Overhead of Legacy Emulators:** Professional network simulation tools (e.g., Cisco Packet Tracer, GNS3, EVE-NG) require cumbersome local installation, complex Cisco IOS command-line configurations, and steep learning curves before NAT concepts can be examined.
3. **Black-box Packet Analysers:** Network packet sniffers such as Wireshark capture raw packet streams but require a live physical lab, produce high noise levels, and do not reveal why the gateway created a given binding or dropped an unsolicited packet.
4. **Lack of Special Case Visualization:** Concepts like ICMP Echo Identifier mapping (handling protocols without transport ports), Dynamic NAT pool exhaustion, and unsolicited packet filtering (firewalling effect) are rarely demonstrated interactively in a unified tool.

### 1.3 Motivation and Relevance
There is a distinct need for a lightweight, zero-install, browser-accessible simulation platform that animates packet traversal in real time, illuminates header rewriting at network boundaries, and exposes authoritative routing tables. Combining web technologies (React 19, React Flow, Framer Motion) with a real-time event-driven backend (Node.js, Express, Socket.IO) bridges pedagogy and production software architecture.

### 1.4 Objectives
1. Construct an interactive, visual network topology containing private hosts, a multi-interface NAT gateway, and public servers.
2. Provide interactive generation of TCP, UDP, and ICMP packets with configurable source addresses, destination targets, and ports.
3. Implement and contrast the three fundamental NAT operational modes:
   - **PAT (Overload)** with dynamic port allocation (40000–50000);
   - **Dynamic NAT** with a bounded public pool and exhaustion handling;
   - **Static NAT** with fixed 1-to-1 bidirectional mappings.
4. Animate the transit of packets across network links with visual pauses and header callouts at the NAT gateway.
5. Provide a live translation table with an active 1-second TTL countdown timer, demonstrating automated session eviction and port reclamation.
6. Gracefully handle and visually explain edge cases: ICMP identifier rewriting, unsolicited inbound firewall drops, and pool exhaustion.

### 1.5 Scope and Limitations
* **In Scope:** Simulation of an authoritative NAT gateway bridging a private LAN (`192.168.1.0/24`) to a public WAN; interactive generation of TCP, UDP, and ICMP Echo traffic; real-time header rewriting; 1-second interval TTL maintenance; and lifecycle packet logs.
* **Out of Scope:** Physical packet interception; raw socket capture on host OS network interfaces; IPv6 NAT64 translation; complex TCP state machine modeling (SYN/ACK 3-way handshake); and BGP/OSPF dynamic routing protocols.
* **Deliberate Pedagogical Adaptations:** NAT session timeouts are calibrated to 30 seconds (rather than RFC-recommended multi-minute timers) to make session expiration directly observable in classroom demonstrations.

### 1.6 Organization of the Report
Chapter II provides a literature survey covering IPv4 exhaustion, RFC standards, and existing tools. Chapter III details the system design, layered architecture, data models, and algorithms. Chapter IV outlines the implementation methodology, flowcharts, and test plan. Chapter V presents empirical results, screenshots, and discussion. Chapter VI summarizes conclusions and future enhancements.

---

## CHAPTER II: LITERATURE SURVEY

### 2.1 Overview
This chapter analyzes existing technical standards, historical solutions to IPv4 depletion, and educational tools currently utilized in computer networks pedagogy.

### 2.2 Existing Approaches
* **CIDR and Application Proxies:** Classless Inter-Domain Routing (RFC 1519 [9]) improved address allocation granularity but did not create additional addresses. Application-layer proxies require per-application configuration and cannot support non-standard protocols transparently.
* **IPv6 Transition:** IPv6 (RFC 8200 [7]) provides a 128-bit address space ($3.4 \times 10^{38}$ addresses), solving address exhaustion permanently. However, dual-stack complexity and legacy device support mean IPv4 with NAT remains dominant globally.
* **Network Address Translation:** RFC 1631 [3] and RFC 3022 [4] established traditional NAT, enabling multi-host multiplexing without altering host network stacks.

### 2.3 Technology Review

#### 2.3.1 RFC 3022 NAT Address Terminology
RFC 3022 standardizes four distinct address concepts that are essential for networking engineers:
1. **Inside Local:** The IP address assigned to a host on the private network (e.g., `192.168.1.10:5000`).
2. **Inside Global:** The registered public IP address assigned by the router to represent the inside host to the external Internet (e.g., `203.0.113.5:40000`).
3. **Outside Local:** The IP address of an external host as seen by devices inside the private network (e.g., `8.8.8.8:80`). In traditional NAT, this is identical to the Outside Global address.
4. **Outside Global:** The authentic public IP address assigned to the remote destination host on the Internet (e.g., `8.8.8.8:80`).

#### 2.3.2 Types of NAT
*Table 2.1: Comparative evaluation of the three NAT modes.*
| Feature | Static NAT | Dynamic NAT | PAT (NAT Overload) |
| :--- | :--- | :--- | :--- |
| **Address Ratio** | 1 Private to 1 Public | 1 Private to 1 Public (Leased) | Many Private to 1 Public |
| **Session Lifetime** | Permanent ($TTL = \infty$) | Dynamic lease (Inactivity TTL) | Per-session (Inactivity TTL) |
| **External Reachability** | Yes, inbound traffic permitted | Only while lease is active | No, unless active session exists |
| **Scalability Limit** | Public IP pool availability | Public IP pool exhaustion | Transport port range (16-bit) |
| **Typical Use Case** | DMZ servers (Web, Mail) | Medium enterprise client subnets | Home routers, mobile hotspots |

#### 2.3.3 Ports, Protocols, and Timeouts
TCP and UDP multiplex streams using 16-bit source and destination port numbers. For these protocols, PAT rewrites both the source IP and source port. 

**ICMP Translation (RFC 792 [8]):** ICMP packets (such as Echo Requests used by `ping`) lack transport ports. As mandated in RFC 3022 Section 4.1, a compliant NAT gateway uses the 16-bit **Echo Identifier** field of the ICMP header as the demultiplexing token, mapping local identifiers to allocated public identifiers.

**Session Lifetimes (RFC 4787 [5], RFC 5382 [6]):** Real routers maintain translation bindings until an idle timer expires (typically 2 minutes for UDP and 1 to 2 hours for TCP). The simulator scales this timeout to 30 seconds to allow visible, verifiable demonstration of timer decay and port release.

### 2.4 Comparison of Existing Tools
*Table 2.2: Comparison of existing approaches to learning and testing NAT.*
| Approach | Visual Animation | Live Translation Table | Zero Installation | Explains Edge Cases |
| :--- | :---: | :---: | :---: | :---: |
| **Textbooks / Slides** | No (Static) | No | Yes | High-level only |
| **Cisco Packet Tracer** | Limited | Via CLI commands | No (Proprietary install) | Requires CLI setup |
| **Wireshark** | No | No (Packet log only) | No (Driver install required) | No reason given |
| **Proposed Simulator** | **Yes (Framer Motion)** | **Yes (Live 1s TTL)** | **Yes (Web browser)** | **Yes (Visual badges)** |

### 2.5 Review of Related Technical Sources
*Table 2.3: Summary of foundational standards, RFCs, and literature reviewed.*
| Reference | Source | Key Contribution to Project | Identified Gap / Limitation |
| :--- | :--- | :--- | :--- |
| **[1]** | RFC 791 (IPv4) | Defines IP datagram format, addressing | No translation mechanism |
| **[2]** | RFC 1918 (Private IP) | Designates 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 | Addressing definitions only |
| **[3], [4]** | RFC 1631, RFC 3022 | Defines Traditional NAT, PAT, and 4 address terms | Text specification; no visualizer |
| **[5], [6]** | RFC 4787, RFC 5382 | UDP & TCP NAT behavioral and timer requirements | Production specs; no teaching tool |
| **[8]** | RFC 792 (ICMP) | Defines ICMP Echo Request / Reply identifiers | Requires special mapping rules |
| **[9], [10]**| Kurose & Ross, Tanenbaum | Academic explanations of NAT tables and routers | Static diagrams without motion |

### 2.6 Research Gap and Justification
Extensive literature and tooling exist, but there is an acute absence of an open, interactive, browser-executable simulator that combines:
1. Multi-protocol simulation (TCP, UDP, ICMP);
2. Visual animation of packets traversing network boundaries with header rewriting;
3. Authoritative server-side translation state with real-time TTL countdowns;
4. Explicit visualization of failure states (`NAT_POOL_EXHAUSTED`, `NO_TRANSLATION_MAPPING`).

The **NAT Address Translation Simulator** directly fills this gap.

---

## CHAPTER III: SYSTEM DESIGN AND ARCHITECTURE

### 3.1 Overview
The simulator employs a decoupled, client-server architecture. The backend maintains authoritative NAT state, executes allocation and translation algorithms, and manages the TTL timer. The frontend provides interactive controls, animates packet journeys, and renders live state updates received via WebSockets.

### 3.2 System Requirements
*Table 3.1: Functional requirements specification.*
| ID | Requirement Statement |
| :--- | :--- |
| **FR1** | The system shall display an interactive topology showing private hosts, a NAT gateway, and public servers. |
| **FR2** | The user shall be able to dispatch TCP, UDP, and ICMP packets with configurable source addresses and ports. |
| **FR3** | The system shall support toggling between PAT (Overload), Dynamic NAT, and Static NAT modes. |
| **FR4** | The backend shall translate outbound and inbound packets according to authoritative NAT rules. |
| **FR5** | The UI shall animate packets and display ingress and egress headers with clear differential highlights. |
| **FR6** | The system shall maintain and display a live NAT table with active 1-second TTL countdown timers. |
| **FR7** | The backend shall automatically evict expired entries upon TTL reaching zero and reclaim allocated ports/IPs. |
| **FR8** | The system shall detect, drop, and report invalid packets (`NO_TRANSLATION_MAPPING`, `NAT_POOL_EXHAUSTED`). |

*Table 3.2: Non-functional requirements and design targets.*
| Requirement | Performance Target | Implementation Technique |
| :--- | :--- | :--- |
| **Responsiveness** | UI state reflects backend within $<50\text{ ms}$ | WebSocket event broadcasting via Socket.IO |
| **Accuracy** | 100% adherence to RFC 3022 translation rules | Authoritative backend validation logic |
| **Animation Smoothness** | Consistent 60 FPS transitions | GPU-accelerated Framer Motion spring physics |
| **Zero Installation** | Runs natively in any evergreen modern web browser | Vite-bundled TypeScript single-page application |
| **Isolation & Safety** | Simulation only; no real network packets dispatched | In-memory packet representation and state machine |

### 3.3 Proposed Architecture
The system consists of four distinct architectural tiers:
1. **Presentation Layer:** Custom React components rendering SVG/Canvas topologies, interactive controls, and responsive tables.
2. **State Layer:** Zustand client store managing active animations, event queues, and UI filters.
3. **Communication Layer:** Full-duplex Socket.IO WebSocket protocol carrying bidirectional lifecycle events.
4. **Logic Layer:** Authoritative backend containing `NatEngine`, `PortManager`, and `NatTable`.

### 3.4 Technology Stack
*Table 3.3: System technology stack and component justification.*
| Part | Technology | Justification & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Component-driven declarative UI with strict compile-time type safety |
| **Topology Engine** | `@xyflow/react` (React Flow) | Hardware-accelerated, draggable node-and-edge network canvas |
| **Animation Library** | Framer Motion | Fluid spring physics for packet translation and shake-on-drop animations |
| **Client State** | Zustand | Lightweight, hook-based global state synchronization with minimal re-renders |
| **Styling** | Tailwind CSS | Utility-first, responsive dark-slate engineering dashboard aesthetics |
| **Backend Runtime** | Node.js + Express | Event-driven, asynchronous I/O execution environment |
| **Live Communication**| Socket.IO | Reliable WebSocket messaging with automatic reconnection fallback |
| **Shared Contracts** | TypeScript Types | Monorepo type contract ensuring schema parity between client and server |

### 3.5 Backend Design
The backend is decomposed into cohesive, single-responsibility modules:
* `PortManager`: Manages sequential allocation and reclamation of PAT ports ($40000 \le port \le 50000$) and tracks active dynamic IP pool leases.
* `NatTable`: Encapsulates the in-memory array of `NatMapping` records. Runs an authoritative `setInterval` tick loop every $1000\text{ ms}$, decrementing non-static TTL values and triggering port reclamation.
* `NatEngine`: The core orchestrator. Executes outbound and inbound translation algorithms, determines drop conditions, rewrites packet headers, and dispatches real-time socket events.
* `Socket Handler`: Ingests client commands (`sim:send-packet`, `sim:send-unsolicited`, `sim:change-mode`, `sim:reset`).

### 3.6 Communication Design
*Table 3.4: Socket.IO real-time event definitions and payloads.*
| Event Name | Direction | Payload Schema | Description |
| :--- | :---: | :--- | :--- |
| `sim:send-packet` | Client $\rightarrow$ Server | `{ srcDeviceId, dstDeviceId, protocol, srcPort, icmpId, autoReply }` | User initiates packet dispatch |
| `sim:send-unsolicited` | Client $\rightarrow$ Server | `{ dstIp, dstPort, protocol, icmpId }` | Test unsolicited inbound firewall drop |
| `sim:change-mode` | Client $\rightarrow$ Server | `{ mode: 'PAT' \| 'DYNAMIC' \| 'STATIC' }` | Switch active NAT operational mode |
| `sim:reset` | Client $\rightarrow$ Server | *empty* | Reset table, free ports, clear logs |
| `sim:state-init` | Server $\rightarrow$ Client | `{ devices, mode, dynamicPool, staticMappings, table, ... }` | Full state sync on connection |
| `packet:created` | Server $\rightarrow$ Client | `Packet` | Packet emerges from source host |
| `packet:processing` | Server $\rightarrow$ Client | `Packet` | Packet arrives at NAT gateway |
| `packet:translated` | Server $\rightarrow$ Client | `Packet` (with `translatedHeader`) | Router rewrites IP/port headers |
| `packet:delivered` | Server $\rightarrow$ Client | `Packet` | Packet reaches final destination |
| `packet:dropped` | Server $\rightarrow$ Client | `{ packet: Packet, reason: DropReason }` | Gateway discards packet with reason |
| `nat:table-updated` | Server $\rightarrow$ Client | `{ table: NatMapping[], dynamicPoolStatus, portStatus }` | Broadcasted on table add, tick, or drop |

### 3.7 Data Models
*Table 3.5: Packet lifecycle outcomes and drop reasons.*
| Outcome / Reason | Condition Triggered |
| :--- | :--- |
| `DELIVERED` | Valid mapping created or matched; packet forwarded to destination. |
| `NO_TRANSLATION_MAPPING` | Inbound packet does not match any active table entry (unsolicited), or an unmapped private host sends traffic in Static NAT mode. |
| `NAT_POOL_EXHAUSTED` | All public IP addresses in the Dynamic NAT pool (`203.0.113.20`, `203.0.113.21`) are actively leased. |

### 3.8 Frontend Design
The dashboard is structured into five cohesive visual modules:
1. **Control Bar:** Houses the segmented NAT Mode Switcher, contextual mode explainer badge, source host and destination server dropdowns, protocol selectors, port input, and primary action triggers.
2. **Topology Canvas (React Flow):** Renders LAN, Router, and WAN boundaries. Smooth Framer Motion packet tokens travel along SVG edges, pausing at the router for visual header rewriting.
3. **Live NAT Table Panel:** Displays real-time entries with animated progress bars and an interactive **RFC 3022 Address Terminology Helper** displaying dynamic values for the active session.
4. **Packet Inspector & Event Log:** Chronological log of lifecycle events coupled with an Ingress vs. Egress differential header table.
5. **1-Click Test Presets Bar:** Quick-trigger execution bar for automated test scenarios T1 through T8.

---

## CHAPTER IV: METHODOLOGY

### 4.1 Development Approach
The project adhered to an incremental six-phase lifecycle model:
* **Phase 1 (Study & Planning):** Review RFCs 791, 1631, 1918, 3022, 4787, 5382; formulate functional and non-functional requirements.
* **Phase 2 (Shared Types):** Define strict TypeScript interfaces for `Packet`, `Device`, `NatMapping`, and Socket events.
* **Phase 3 (Backend Implementation):** Develop `PortManager`, `NatTable`, and `NatEngine` with 1-second TTL interval timer.
* **Phase 4 (Frontend UI Components):** Construct interactive network topology with `@xyflow/react` and Framer Motion animated packets.
* **Phase 5 (Full Integration):** Connect client and server via bidirectional Socket.IO events.
* **Phase 6 (Testing & Verification):** Implement automated test runner covering test scenarios T1–T8.

### 4.2 Outbound Packet Processing
When a private host dispatches an outbound packet toward a public destination, the gateway executes the algorithmic decision tree:
1. **Lookup Step:** Check translation table for an existing session matching `(srcIp, srcPort, protocol)` (in PAT) or `srcIp` (in Dynamic/Static). If found, refresh $TTL = 30\text{ s}$ and skip to rewrite.
2. **Allocation Step by Mode:**
   - **PAT:** Request lowest available port from `PortManager` ($40000 \le port \le 50000$). For ICMP, map Echo ID to allocated port.
   - **Dynamic NAT:** Request free IP from pool (`203.0.113.20`, `.21`). If full, drop with `NAT_POOL_EXHAUSTED`.
   - **Static NAT:** Search fixed configuration. If unmapped (PC-03), drop with `NO_TRANSLATION_MAPPING`.
3. **Storage Step:** Insert mapping into table with $TTL = 30\text{ s}$ (or permanent $TTL = -1$ for Static NAT).
4. **Rewrite & Forward Step:** Rewrite source IP/port with inside global values, emit `packet:translated`, and forward to server.

### 4.3 Inbound Processing and TTL Cleanup
1. **Inbound Path:** Check if packet destination matches an active `insideGlobalIp` and `insideGlobalPort`. If no match, discard with `NO_TRANSLATION_MAPPING`. If match exists, rewrite destination to `insideLocalIp` and `insideLocalPort`, refresh TTL, and deliver to private host.
2. **TTL Cleanup Path:** Every $1000\text{ ms}$, decrement TTL by 1 for non-static entries. Evict entries reaching 0, release the associated PAT port or leased dynamic IP, and broadcast the updated table to all connected clients.

### 4.4 Experimental Setup & Network Topology
* **Private LAN (`192.168.1.0/24`):**
  - `PC-01`: `192.168.1.10` (Port 5000)
  - `PC-02`: `192.168.1.11` (Port 5000)
  - `PC-03`: `192.168.1.12` (Port 5000, unmapped in Static NAT)
* **NAT Gateway Router:**
  - Inside Interface: `192.168.1.1`
  - Outside Public IP (PAT): `203.0.113.5`
  - Dynamic Pool: `['203.0.113.20', '203.0.113.21']`
  - Static Mappings: `192.168.1.10` $\leftrightarrow$ `203.0.113.10`, `192.168.1.11` $\leftrightarrow$ `203.0.113.11`
* **Public Internet Servers:**
  - `WEB-1`: `8.8.8.8:80` (DNS/Web Server)
  - `WEB-2`: `1.1.1.1:443` (Cloud Server)

### 4.5 Test Plan
*Table 4.2: Standardized evaluation test suite specification (T1–T8).*
| ID | Scenario | Stimulus / Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **T1** | PAT TCP Outbound | PC-01 sends TCP to `8.8.8.8:80` | Source rewritten to `203.0.113.5:40000`; mapping created with 30s TTL |
| **T2** | PAT Multi-Host Overload | PC-01 and PC-02 both send with port `5000` | Both hosts share `203.0.113.5`, assigned distinct public ports (`40000` & `40001`) |
| **T3** | Inbound Reply Round-Trip | Remote server replies to `203.0.113.5:40000` | Destination rewritten back to `192.168.1.10:5000`; packet delivered |
| **T4** | ICMP Ping (Echo ID) | PC-01 pings `8.8.8.8` with Echo ID `1` | Echo ID mapped to allocated PAT port `40002` in place of transport port |
| **T5** | Unsolicited Inbound Drop | External server hits router port `9999` with no mapping | Packet discarded at router with reason `NO_TRANSLATION_MAPPING` |
| **T6** | TTL Expiry & Port Release | Active session left idle for 30s | TTL decrements to 0; entry is evicted; port 40000 is released for reuse |
| **T7** | Dynamic Pool Exhaustion | Dynamic mode; PC-01, PC-02 lease 2 pool IPs; PC-03 sends | PC-03 packet dropped at router with reason `NAT_POOL_EXHAUSTED` |
| **T8** | Static NAT Binding & Drop | Static mode; PC-01 sends; unmapped PC-03 sends | PC-01 translates to fixed `203.0.113.10` ($TTL=\infty$); PC-03 dropped with `NO_TRANSLATION_MAPPING` |

---

## CHAPTER V: RESULTS AND DISCUSSION

### 5.1 Simulator Output & Visual Analysis
*Table 5.1: Worked example: NAT translation table state during active PAT session.*
| No. | Proto | Inside Local | Inside Global | Outside | TTL (s) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | TCP | `192.168.1.10:5000` | `203.0.113.5:40000` | `8.8.8.8:80` | 30 |
| 2 | TCP | `192.168.1.11:5000` | `203.0.113.5:40001` | `8.8.8.8:80` | 30 |
| 3 | ICMP | `192.168.1.10 (id 1)` | `203.0.113.5:40002` | `8.8.8.8` | 30 |

### 5.2 Observed Test Results (T1–T8)
*Table 5.2: Empirical test results across scenarios T1–T8 with verification status.*
| ID | Scenario | Expected Outcome | Empirically Observed Behavior | Status |
| :--- | :--- | :--- | :--- | :---: |
| **T1** | PAT TCP Outbound | Source rewritten to `203.0.113.5:40000`; entry added with 30s TTL | Ingress `192.168.1.10:5000` translated to Egress `203.0.113.5:40000`; Table entry added with $TTL \approx 30\text{ s}$ | **PASS** |
| **T2** | PAT Multi-Host | Distinct public ports allocated for identical source ports | PC-01 allocated port `40000`; PC-02 allocated port `40001` on public IP `203.0.113.5` | **PASS** |
| **T3** | Inbound Reply | Destination restored to private IP and port | Inbound packet to `203.0.113.5:40000` rewritten to `192.168.1.10:5000` and delivered to PC-01 | **PASS** |
| **T4** | ICMP Ping | Echo ID used in place of port number | Echo ID `1` mapped to PAT identifier `40002`; entry logged as `192.168.1.10 (id 1)` | **PASS** |
| **T5** | Unsolicited Drop | External packet without mapping discarded | Packet to unmapped port `9999` rejected with `NO_TRANSLATION_MAPPING`; red alert shown | **PASS** |
| **T6** | TTL Expiry | Entry removed after 30s; port returned to pool | Entry timed out after 30 ticks; port `40000` confirmed unallocated and available | **PASS** |
| **T7** | Pool Exhaustion | Dynamic pool limited to 2 IPs; 3rd host dropped | PC-01 leased `.20`; PC-02 leased `.21`; PC-03 packet dropped with `NAT_POOL_EXHAUSTED` | **PASS** |
| **T8** | Static NAT | Fixed IP used; unmapped host dropped | PC-01 translated to fixed `203.0.113.10` ($TTL=\infty$); PC-03 dropped with `NO_TRANSLATION_MAPPING` | **PASS** |

### 5.3 Comparison with Existing Tools
*Table 5.3: Feature matrix comparing proposed simulator with legacy tooling.*
| Feature | Textbook / Slides | Cisco Packet Tracer | Wireshark Sniffer | Proposed Simulator |
| :--- | :---: | :---: | :---: | :---: |
| **Animated Packet Journey** | No | Yes | No | **Yes (Framer Motion)** |
| **Real-time Header Diff** | Static text | Via CLI inspect | Raw hex/pcap decode | **Interactive visual diff** |
| **Live Table with TTL** | Static table | CLI command | No table view | **Live 1-second countdown** |
| **Three Distinct NAT Modes** | Described | Supported | Real network only | **Supported & switchable** |
| **Installation Requirement** | None (Paper) | Heavy desktop install | Driver & app install | **Zero install (Browser)** |
| **Simulation Safety** | Non-executable | Simulated sandbox | Transmits real traffic | **100% In-memory safe** |

### 5.4 Discussion of Findings
1. **PAT Multiplexing Efficiency:**
   By multiplexing sessions over 10,001 ports ($40000 \le port \le 50000$), a single public IPv4 address comfortably supports thousands of concurrent client sessions. The simulator successfully demonstrated that two independent workstations transmitting from the same private port (`5000`) encounter zero collision.
2. **Session Persistence & Mapping Reuse:**
   When subsequent packets are dispatched from an existing active session, the engine detects the existing `(srcIp, srcPort, protocol)` tuple, reuses the assigned public port, and resets the TTL to 30 seconds. This avoids table bloat and stabilizes external session bindings.
3. **Firewalling Side-Effect of Traditional NAT:**
   Test scenario T5 verified that unsolicited incoming packets are discarded at the router with `NO_TRANSLATION_MAPPING`. While NAT provides an inherent level of stateful inbound filtering, it cannot substitute for deep packet inspection, stateful TCP flag tracking, or application-layer firewalls.
4. **Pedagogical Impact of Pool Exhaustion:**
   Demonstrating Dynamic NAT failure (T7) when the third private host attempts to communicate reinforces why the Internet transitioned to PAT/Overload rather than basic Dynamic NAT.

---

## CHAPTER VI: CONCLUSION AND FUTURE WORK

### 6.1 Conclusion
The **NAT Address Translation Simulator** was successfully engineered, verified, and benchmarked against standard networking criteria. By integrating React 19, React Flow, and Framer Motion with an authoritative Node.js and Socket.IO backend, the project transforms an invisible routing mechanism into a tangible, observable interactive experience. 

The simulator faithfully demonstrates:
* The operational mechanisms of PAT, Dynamic NAT, and Static NAT;
* Header rewriting for TCP, UDP, and ICMP protocols;
* Authoritative 1-second interval TTL decay and port reclamation;
* Transparent visualization of edge cases including pool exhaustion and firewall drop behavior.

All eight test scenarios (T1–T8) passed with 100% accuracy, establishing the simulator as a robust educational tool for computer networking education.

### 6.2 Future Work
* **Port Forwarding (DNAT) Rules:** Enable users to configure static inbound port forwarding (e.g., mapping public port 8080 to an internal web server).
* **NAT Hairpinning / Loopback:** Simulate the condition where an internal LAN client accesses another internal LAN server using the router's public external address.
* **TCP Handshake State Machine:** Model the full TCP 3-way handshake (`SYN`, `SYN-ACK`, `ACK`) and connection teardown (`FIN`, `RST`) to trigger dynamic entry creation and immediate termination.
* **Carrier-Grade NAT (CGNAT):** Implement double-NAT architectures (`100.64.0.0/10` shared address space) demonstrating ISP-level carrier grade NAT topologies.
* **IPv6 Transition Scenarios (NAT64 / DNS64):** Provide interactive translation between IPv6-only internal clients and legacy IPv4 public servers.

---

## CHAPTER VII: REFERENCES

1. J. Postel, "Internet Protocol," *RFC 791*, Internet Engineering Task Force, Sep. 1981.
2. Y. Rekhter, B. Moskowitz, D. Karrenberg, G. J. de Groot, and E. Lear, "Address Allocation for Private Internets," *RFC 1918*, Feb. 1996.
3. K. Egevang and P. Francis, "The IP Network Address Translator (NAT)," *RFC 1631*, May 1994.
4. P. Srisuresh and K. Egevang, "Traditional IP Network Address Translator (Traditional NAT)," *RFC 3022*, Jan. 2001.
5. F. Audet and C. Jennings, "Network Address Translation (NAT) Behavioral Requirements for Unicast UDP," *RFC 4787*, Jan. 2007.
6. S. Guha, K. Biswas, B. Ford, S. Sivakumar, and P. Srisuresh, "NAT Behavioral Requirements for TCP," *RFC 5382*, Oct. 2008.
7. S. Deering and R. Hinden, "Internet Protocol, Version 6 (IPv6) Specification," *RFC 8200*, Jul. 2017.
8. J. Postel, "Internet Control Message Protocol," *RFC 792*, Sep. 1981.
9. J. F. Kurose and K. W. Ross, *Computer Networking: A Top-Down Approach*, 8th ed. Boston, MA: Pearson, 2021.
10. A. S. Tanenbaum and D. J. Wetherall, *Computer Networks*, 5th ed. Boston, MA: Pearson, 2011.
11. Socket.IO Community, "Socket.IO Documentation: Bidirectional and low-latency communication for every platform," 2024. [Online]. Available: `https://socket.io/docs/`
12. Meta Open Source, "React Documentation: The library for web and native user interfaces," 2024. [Online]. Available: `https://react.dev/`
13. xyflow, "React Flow Documentation: Highly customizable library for building interactive node-based UIs," 2024. [Online]. Available: `https://reactflow.dev/`
14. OpenJS Foundation, "Node.js Documentation," 2024. [Online]. Available: `https://nodejs.org/docs/`
