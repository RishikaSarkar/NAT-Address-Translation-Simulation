import { NatEngine } from './NatEngine.js';
import { NatTable } from './NatTable.js';
import { PortManager } from './PortManager.js';
import { Packet, DropReason, NatMapping } from '../../shared/types.js';

async function runTests() {
  console.log('=== Starting NAT Address Translation Simulator Verification Suite (T1-T8) ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details || ''}`);
      failed++;
    }
  }

  // Set up NAT components
  const portManager = new PortManager();
  let tableState: NatMapping[] = [];
  const natTable = new NatTable(portManager, (table) => {
    tableState = table;
  });

  const eventsLog: { event: string; packet: Packet; reason?: DropReason }[] = [];

  const natEngine = new NatEngine(portManager, natTable, {
    onPacketCreated: (packet) => eventsLog.push({ event: 'created', packet }),
    onPacketProcessing: (packet) => eventsLog.push({ event: 'processing', packet }),
    onPacketTranslated: (packet) => eventsLog.push({ event: 'translated', packet }),
    onPacketDelivered: (packet) => eventsLog.push({ event: 'delivered', packet }),
    onPacketDropped: (packet, reason) => eventsLog.push({ event: 'dropped', packet, reason }),
    onTableUpdated: (table) => {
      tableState = table;
    },
  });

  // --- TEST T1: PAT TCP Outbound ---
  console.log('\n--- Running T1: PAT TCP Outbound ---');
  natEngine.setMode('PAT');
  await natEngine.handleOutboundPacket('pc-1', 'web-1', 'TCP', 5000, 1, 80, false);

  const t1Translated = eventsLog.find(
    (e) => e.event === 'translated' && e.packet.srcDeviceId === 'pc-1'
  );
  assert(
    t1Translated !== undefined &&
      t1Translated.packet.translatedHeader?.srcIp === '203.0.113.5' &&
      t1Translated.packet.translatedHeader?.srcPort >= 40000 &&
      t1Translated.packet.translatedHeader?.srcPort <= 50000,
    'T1: PAT TCP Outbound - Source rewritten to 203.0.113.5 with port in 40000-50000',
    `srcIp=${t1Translated?.packet.translatedHeader?.srcIp}, srcPort=${t1Translated?.packet.translatedHeader?.srcPort}`
  );

  const t1Entry = tableState.find((e) => e.insideLocalIp === '192.168.1.10');
  assert(
    t1Entry !== undefined &&
      t1Entry.ttl >= 28 &&
      t1Entry.ttl <= 30 &&
      t1Entry.insideGlobalPort === 40000,
    'T1: PAT Table Entry Created with TTL ~30 and Inside Global Port 40000'
  );

  // --- TEST T2: PAT Multi-Host Port Overload ---
  console.log('\n--- Running T2: PAT Multi-Host Port Overload ---');
  // PC-02 sends using same port 5000
  await natEngine.handleOutboundPacket('pc-2', 'web-1', 'TCP', 5000, 1, 80, false);
  const t2Entry = tableState.find((e) => e.insideLocalIp === '192.168.1.11');
  assert(
    t2Entry !== undefined &&
      t2Entry.insideGlobalPort !== t1Entry?.insideGlobalPort &&
      t2Entry.insideGlobalPort === 40001 &&
      t2Entry.insideGlobalIp === '203.0.113.5',
    'T2: PAT Multi-Host - PC-01 and PC-02 both use port 5000 and get unique public ports (40000 vs 40001)',
    `PC-01 port: ${t1Entry?.insideGlobalPort}, PC-02 port: ${t2Entry?.insideGlobalPort}`
  );

  // --- TEST T3: Inbound Reply Round-Trip ---
  console.log('\n--- Running T3: Inbound Reply Round-Trip ---');
  // Simulate inbound reply from web-1 to PC-01's public port 40000
  await natEngine.handleInboundPacket('web-1', '203.0.113.5', 40000, 80, 'TCP');
  const t3Delivered = eventsLog.find(
    (e) =>
      e.event === 'delivered' &&
      e.packet.direction === 'inbound' &&
      e.packet.dstDeviceId === 'pc-1'
  );
  assert(
    t3Delivered !== undefined &&
      t3Delivered.packet.translatedHeader?.dstIp === '192.168.1.10' &&
      t3Delivered.packet.translatedHeader?.dstPort === 5000,
    'T3: Inbound Reply - Destination restored to 192.168.1.10:5000 and delivered to PC-01',
    `dstIp=${t3Delivered?.packet.translatedHeader?.dstIp}, dstPort=${t3Delivered?.packet.translatedHeader?.dstPort}`
  );

  // --- TEST T4: ICMP Ping ---
  console.log('\n--- Running T4: ICMP Ping ---');
  await natEngine.handleOutboundPacket('pc-1', 'web-1', 'ICMP', 5000, 1, 0, false);
  const icmpEntry = tableState.find((e) => e.protocol === 'ICMP');
  assert(
    icmpEntry !== undefined &&
      icmpEntry.insideLocalPort === 1 &&
      icmpEntry.insideGlobalPort === 40002,
    'T4: ICMP Ping - Echo ID (1) mapped to PAT identifier (40002)',
    `insideLocalPort=${icmpEntry?.insideLocalPort}, insideGlobalPort=${icmpEntry?.insideGlobalPort}`
  );

  // --- TEST T5: Unsolicited Inbound Packet Drop ---
  console.log('\n--- Running T5: Unsolicited Inbound Packet Drop ---');
  eventsLog.length = 0; // Clear events for clean check
  await natEngine.handleInboundPacket('web-1', '203.0.113.5', 9999, 80, 'TCP');
  const t5Dropped = eventsLog.find((e) => e.event === 'dropped');
  assert(
    t5Dropped !== undefined && t5Dropped.reason === 'NO_TRANSLATION_MAPPING',
    'T5: Unsolicited Inbound Packet - Dropped with reason NO_TRANSLATION_MAPPING',
    `reason=${t5Dropped?.reason}`
  );

  // --- TEST T6: TTL Expiry and Port Release ---
  console.log('\n--- Running T6: TTL Expiry and Port Release ---');
  const portToTrack = 40000;
  assert(portManager.isPortAllocated(portToTrack), 'T6 Precondition: Port 40000 is allocated');

  // Fast-forward 30 ticks
  for (let i = 0; i < 30; i++) {
    natTable.tick();
  }

  assert(
    !portManager.isPortAllocated(portToTrack),
    'T6: TTL Expiry - After 30 seconds of inactivity, port 40000 is released',
    `isAllocated=${portManager.isPortAllocated(portToTrack)}`
  );

  // --- TEST T7: Dynamic Pool Exhaustion ---
  console.log('\n--- Running T7: Dynamic Pool Exhaustion ---');
  natEngine.setMode('DYNAMIC');
  eventsLog.length = 0;

  // PC-1 sends -> takes 203.0.113.20
  await natEngine.handleOutboundPacket('pc-1', 'web-1', 'TCP', 5000, 1, 80, false);
  const dyn1 = tableState.find((e) => e.insideLocalIp === '192.168.1.10');
  assert(
    dyn1 !== undefined && dyn1.insideGlobalIp === '203.0.113.20',
    'T7: PC-01 leases first pool IP 203.0.113.20'
  );

  // PC-2 sends -> takes 203.0.113.21
  await natEngine.handleOutboundPacket('pc-2', 'web-1', 'TCP', 5000, 1, 80, false);
  const dyn2 = tableState.find((e) => e.insideLocalIp === '192.168.1.11');
  assert(
    dyn2 !== undefined && dyn2.insideGlobalIp === '203.0.113.21',
    'T7: PC-02 leases second pool IP 203.0.113.21'
  );

  // PC-3 sends -> Pool is full (size 2)! Must drop with NAT_POOL_EXHAUSTED
  await natEngine.handleOutboundPacket('pc-3', 'web-1', 'TCP', 5000, 1, 80, false);
  const t7Dropped = eventsLog.find(
    (e) => e.event === 'dropped' && e.packet.srcDeviceId === 'pc-3'
  );
  assert(
    t7Dropped !== undefined && t7Dropped.reason === 'NAT_POOL_EXHAUSTED',
    'T7: Pool Exhaustion - PC-03 packet dropped with reason NAT_POOL_EXHAUSTED',
    `reason=${t7Dropped?.reason}`
  );

  // --- TEST T8: Static NAT ---
  console.log('\n--- Running T8: Static NAT ---');
  natEngine.setMode('STATIC');
  eventsLog.length = 0;

  // PC-01 sends -> should use fixed 203.0.113.10
  await natEngine.handleOutboundPacket('pc-1', 'web-1', 'TCP', 5000, 1, 80, false);
  const t8Translated = eventsLog.find(
    (e) => e.event === 'translated' && e.packet.srcDeviceId === 'pc-1'
  );
  assert(
    t8Translated !== undefined &&
      t8Translated.packet.translatedHeader?.srcIp === '203.0.113.10',
    'T8: Static NAT - PC-01 mapped to fixed public IP 203.0.113.10',
    `srcIp=${t8Translated?.packet.translatedHeader?.srcIp}`
  );

  // PC-03 sends (unmapped) -> should drop with NO_TRANSLATION_MAPPING
  await natEngine.handleOutboundPacket('pc-3', 'web-1', 'TCP', 5000, 1, 80, false);
  const t8Dropped = eventsLog.find(
    (e) => e.event === 'dropped' && e.packet.srcDeviceId === 'pc-3'
  );
  assert(
    t8Dropped !== undefined && t8Dropped.reason === 'NO_TRANSLATION_MAPPING',
    'T8: Static NAT - Unmapped PC-03 dropped with reason NO_TRANSLATION_MAPPING',
    `reason=${t8Dropped?.reason}`
  );

  // Static entry is permanent (ttl: -1 or isStatic: true)
  const staticEntry = tableState.find((e) => e.insideLocalIp === '192.168.1.10');
  assert(
    staticEntry !== undefined && staticEntry.isStatic === true,
    'T8: Static NAT - Mapping is marked isStatic and does not expire'
  );

  console.log(`\n========================================`);
  console.log(`Suite Results: Passed: ${passed}, Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
