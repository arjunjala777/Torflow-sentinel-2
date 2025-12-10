import { TraceSession, Node, Packet } from '../types';

// --- Real-World Node Database (Simulated GeoIP) ---
// These are actual coordinates for major data centers and internet exchange points
// where Tor nodes are commonly hosted.
const REAL_NODES = [
  // North America (US)
  { country: 'US', city: 'Ashburn, VA', lat: 39.0438, lon: -77.4874, ipPrefix: '104.16' },
  { country: 'US', city: 'San Francisco, CA', lat: 37.7749, lon: -122.4194, ipPrefix: '192.168' },
  { country: 'US', city: 'New York, NY', lat: 40.7128, lon: -74.0060, ipPrefix: '159.203' },
  { country: 'US', city: 'Dallas, TX', lat: 32.7767, lon: -96.7970, ipPrefix: '45.33' },
  { country: 'US', city: 'Chicago, IL', lat: 41.8781, lon: -87.6298, ipPrefix: '208.66' },
  { country: 'US', city: 'Seattle, WA', lat: 47.6062, lon: -122.3321, ipPrefix: '67.205' },
  // North America (Canada)
  { country: 'CA', city: 'Toronto', lat: 43.6532, lon: -79.3832, ipPrefix: '159.203' },
  { country: 'CA', city: 'Montreal', lat: 45.5017, lon: -73.5673, ipPrefix: '192.99' },
  { country: 'CA', city: 'Vancouver', lat: 49.2827, lon: -123.1207, ipPrefix: '209.121' },
  
  // Europe (Germany - High Tor Density)
  { country: 'DE', city: 'Frankfurt', lat: 50.1109, lon: 8.6821, ipPrefix: '185.22' },
  { country: 'DE', city: 'Berlin', lat: 52.5200, lon: 13.4050, ipPrefix: '88.198' },
  { country: 'DE', city: 'Nuremberg', lat: 49.4521, lon: 11.0767, ipPrefix: '138.201' },
  { country: 'DE', city: 'Munich', lat: 48.1351, lon: 11.5820, ipPrefix: '78.46' },

  // Europe (Netherlands - High Tor Density)
  { country: 'NL', city: 'Amsterdam', lat: 52.3676, lon: 4.9041, ipPrefix: '185.22' },
  { country: 'NL', city: 'Rotterdam', lat: 51.9244, lon: 4.4777, ipPrefix: '5.101' },

  // Europe (France)
  { country: 'FR', city: 'Paris', lat: 48.8566, lon: 2.3522, ipPrefix: '51.15' },
  { country: 'FR', city: 'Marseille', lat: 43.2965, lon: 5.3698, ipPrefix: '212.129' },
  { country: 'FR', city: 'Strasbourg', lat: 48.5734, lon: 7.7521, ipPrefix: '163.172' },

  // Europe (Others)
  { country: 'GB', city: 'London', lat: 51.5074, lon: -0.1278, ipPrefix: '212.71' },
  { country: 'GB', city: 'Manchester', lat: 53.4808, lon: -2.2426, ipPrefix: '89.234' },
  { country: 'CH', city: 'Zurich', lat: 47.3769, lon: 8.5417, ipPrefix: '179.43' },
  { country: 'CH', city: 'Geneva', lat: 46.2044, lon: 6.1432, ipPrefix: '185.70' },
  { country: 'SE', city: 'Stockholm', lat: 59.3293, lon: 18.0686, ipPrefix: '193.11' },
  { country: 'RO', city: 'Bucharest', lat: 44.4268, lon: 26.1025, ipPrefix: '89.12' },
  { country: 'RU', city: 'Moscow', lat: 55.7558, lon: 37.6173, ipPrefix: '95.213' },
  { country: 'UA', city: 'Kyiv', lat: 50.4501, lon: 30.5234, ipPrefix: '185.25' },
  { country: 'PL', city: 'Warsaw', lat: 52.2297, lon: 21.0122, ipPrefix: '5.185' },
  { country: 'IT', city: 'Milan', lat: 45.4642, lon: 9.1900, ipPrefix: '217.16' },

  // Asia
  { country: 'JP', city: 'Tokyo', lat: 35.6762, lon: 139.6503, ipPrefix: '150.95' },
  { country: 'JP', city: 'Osaka', lat: 34.6937, lon: 135.5023, ipPrefix: '133.242' },
  { country: 'SG', city: 'Singapore', lat: 1.3521, lon: 103.8198, ipPrefix: '139.162' },
  { country: 'HK', city: 'Hong Kong', lat: 22.3193, lon: 114.1694, ipPrefix: '43.254' },
  { country: 'IN', city: 'Mumbai', lat: 19.0760, lon: 72.8777, ipPrefix: '103.21' },
  
  // South America
  { country: 'BR', city: 'Sao Paulo', lat: -23.5505, lon: -46.6333, ipPrefix: '177.54' },
  { country: 'BR', city: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, ipPrefix: '179.108' },
  
  // Oceania
  { country: 'AU', city: 'Sydney', lat: -33.8688, lon: 151.2093, ipPrefix: '45.114' },
  { country: 'AU', city: 'Melbourne', lat: -37.8136, lon: 144.9631, ipPrefix: '103.4' }
];

// --- Known Hidden Services Targets ---
// These define the FINAL destination for specific queries.
// The path TO them will be randomized every time.
const KNOWN_TARGETS: Record<string, { targetIp: string, targetLoc: typeof REAL_NODES[0] }> = {
  'duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion': {
    targetIp: '52.142.124.215',
    targetLoc: { country: 'US', city: 'Ashburn, VA', lat: 39.0437, lon: -77.4875, ipPrefix: '52.142' }
  },
  'facebookwkhpilnemxj7asaniu7vnjjbiltxjqhye3mhbshg7kx5tfyd.onion': {
    targetIp: '157.240.22.35',
    targetLoc: { country: 'US', city: 'Prineville, OR', lat: 44.2998, lon: -120.8345, ipPrefix: '157.240' }
  },
  'protonmailrmez3lotcc5y737ncbx4yjsc7t52jcnk352jcnk352jcn.onion': {
    targetIp: '185.70.42.42',
    targetLoc: { country: 'CH', city: 'Zurich', lat: 47.3769, lon: 8.5417, ipPrefix: '185.70' }
  }
};

function getRandomNode(excludeCountries: string[] = []): typeof REAL_NODES[0] {
  // Try to find a node in a country we haven't used recently to simulate diverse routing
  const candidates = REAL_NODES.filter(n => !excludeCountries.includes(n.country));
  
  // If we filtered out everything, fall back to full list
  const pool = candidates.length > 0 ? candidates : REAL_NODES;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateRandomIp(prefix: string) {
  return `${prefix}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generatePackets(): Packet[] {
  const packets: Packet[] = [];
  const packetCount = 20 + Math.floor(Math.random() * 30);
  
  for (let i = 0; i < packetCount; i++) {
    const isControl = Math.random() > 0.8;
    packets.push({
      hopId: Math.floor(Math.random() * 5),
      sizeBytes: isControl ? 512 : 1024 + Math.floor(Math.random() * 500),
      protocol: 'TCP',
      flags: isControl ? ['SYN', 'ACK'] : ['PSH', 'ACK'],
      timestamp: Date.now() - (packetCount - i) * 100
    });
  }
  return packets;
}

export function generateRandomTrace(query: string): TraceSession {
  // 1. Determine Target
  let targetNodeData = KNOWN_TARGETS[query.trim()]?.targetLoc;
  let targetIp = KNOWN_TARGETS[query.trim()]?.targetIp;
  let isKnown = !!targetNodeData;
  let features = isKnown ? ['DatabaseMatch', 'VerifiedService'] : ['Encrypted', 'OnionV3'];

  if (!targetNodeData) {
    // Random target if unknown
    targetNodeData = getRandomNode();
    targetIp = generateRandomIp(targetNodeData.ipPrefix);
  }

  // 2. Generate Circuit Path (Source -> Guard -> Middle -> Exit)
  // We maintain a list of used countries to ensure variety in the path
  const usedCountries: string[] = [];

  // Source (The User) - Can be anywhere
  const sourceData = getRandomNode(); 
  usedCountries.push(sourceData.country);

  // Guard Node - Should be stable, reliable (often DE, NL, US)
  // We exclude the source country to simulate cross-border routing
  const guardData = getRandomNode(usedCountries);
  usedCountries.push(guardData.country);

  // Middle Relay - Can be anywhere
  const middleData = getRandomNode(usedCountries);
  usedCountries.push(middleData.country);

  // Exit Node - Should be different from target country if possible for privacy, 
  // but for .onion services, the "Exit" is actually the rendezvous point.
  // We'll just generate a node.
  const exitData = getRandomNode(usedCountries);
  
  // 3. Construct Nodes Array
  const nodes: Node[] = [
    {
      id: 'node-source',
      ip: generateRandomIp(sourceData.ipPrefix),
      type: 'source',
      country: sourceData.country,
      lat: sourceData.lat,
      lon: sourceData.lon,
      name: 'CLIENT_ORIGIN'
    },
    {
      id: 'node-guard',
      ip: generateRandomIp(guardData.ipPrefix),
      type: 'guard',
      country: guardData.country,
      lat: guardData.lat,
      lon: guardData.lon,
      name: `${guardData.country}_GUARD_RELAY`
    },
    {
      id: 'node-middle',
      ip: generateRandomIp(middleData.ipPrefix),
      type: 'middle',
      country: middleData.country,
      lat: middleData.lat,
      lon: middleData.lon,
      name: `${middleData.country}_MIDDLE_RELAY`
    },
    {
      id: 'node-exit',
      ip: generateRandomIp(exitData.ipPrefix),
      type: 'exit',
      country: exitData.country,
      lat: exitData.lat,
      lon: exitData.lon,
      name: `${exitData.country}_EXIT_NODE`
    },
    {
      id: 'node-target',
      ip: targetIp,
      type: 'target',
      country: targetNodeData.country,
      lat: targetNodeData.lat,
      lon: targetNodeData.lon,
      name: 'TARGET_SERVER'
    }
  ];

  const anomalies = [];
  if (Math.random() > 0.85) anomalies.push('Timing Analysis Detected');
  if (Math.random() > 0.9) anomalies.push('Packet Size Correlation');

  return {
    id: isKnown ? `db-${Date.now().toString().slice(-6)}` : Math.random().toString(36).substring(7),
    targetQuery: query,
    nodes,
    packets: generatePackets(),
    features,
    anomalies,
    timestamp: Date.now()
  };
}