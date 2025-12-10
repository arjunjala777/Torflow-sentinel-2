export interface Packet {
  hopId: number;
  sizeBytes: number;
  protocol: string;
  flags: string[];
  timestamp?: number;
}

export interface Node {
  id: string;
  ip: string;
  type: 'source' | 'guard' | 'middle' | 'exit' | 'target';
  country: string;
  lat: number;
  lon: number;
  name?: string;
}

export interface TraceSession {
  id: string;
  targetQuery: string;
  nodes: Node[];
  packets: Packet[];
  features: string[];
  anomalies: string[];
  timestamp: number;
}

export interface ApiSession {
  session_id: string;
  target_ip?: string;
  suspect_ip?: string;
  packet_size?: number;
  confidence_score?: number;
  total_packets_matched?: number;
}
