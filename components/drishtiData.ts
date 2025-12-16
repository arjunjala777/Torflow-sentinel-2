// src/data/drishtiData.ts

export type CorridorNode = {
  id: string;
  name: string;
  country: string;
  city: string;
  lat: number;
  lon: number;
  role: "SOURCE" | "GUARD" | "MIDDLE" | "EXIT" | "TARGET";
};

export type CorridorHop = {
  id: string;
  from: string;
  to: string;
  millis: number;
};

export type Corridor = {
  id: string;
  label: string;
  scenario: string;
  color: string;
  nodes: CorridorNode[];
  hops: CorridorHop[];
};

// -----------------------------------------------------------------------------
// Sample corridor – you can add more later (duckduckgo-eu, facebook-na, etc.)
// -----------------------------------------------------------------------------
export const DRISHTI_CORRIDORS: Corridor[] = [
  {
    id: "corridor-sample-eu",
    label: "Sample EU Circuit",
    scenario: "User in Europe reaching a generic target over Tor.",
    color: "#22c55e",
    nodes: [
      {
        id: "node-source",
        name: "Client Origin",
        country: "DE",
        city: "Berlin",
        lat: 52.52,
        lon: 13.405,
        role: "SOURCE",
      },
      {
        id: "node-guard",
        name: "DE Guard Relay",
        country: "DE",
        city: "Frankfurt",
        lat: 50.1109,
        lon: 8.6821,
        role: "GUARD",
      },
      {
        id: "node-middle",
        name: "NL Middle Relay",
        country: "NL",
        city: "Amsterdam",
        lat: 52.3676,
        lon: 4.9041,
        role: "MIDDLE",
      },
      {
        id: "node-exit",
        name: "FR Exit Node",
        country: "FR",
        city: "Paris",
        lat: 48.8566,
        lon: 2.3522,
        role: "EXIT",
      },
      {
        id: "node-target",
        name: "Target Service",
        country: "GB",
        city: "London",
        lat: 51.5074,
        lon: -0.1278,
        role: "TARGET",
      },
    ],
    hops: [
      { id: "hop-1", from: "node-source", to: "node-guard", millis: 45 },
      { id: "hop-2", from: "node-guard", to: "node-middle", millis: 60 },
      { id: "hop-3", from: "node-middle", to: "node-exit", millis: 80 },
      { id: "hop-4", from: "node-exit", to: "node-target", millis: 70 },
    ],
  },
];

// -----------------------------------------------------------------------------
// Role colors
// -----------------------------------------------------------------------------
export const DRISHTI_NODE_ROLE_COLORS: Record<CorridorNode["role"], string> = {
  SOURCE: "#ffffff",
  GUARD: "#22c55e",
  MIDDLE: "#38bdf8",
  EXIT: "#ef4444",
  TARGET: "#eab308",
};

// -----------------------------------------------------------------------------
// Scatter nodes for TorFlow-style background
// -----------------------------------------------------------------------------
export type ScatterNode = {
  id: string;
  lat: number;
  lon: number;
};

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Lightweight Poisson-ish sampling in projected space to keep nodes separated.
 * Extremely low density + very large minScreenDistance so particles are sparse
 * and clearly separated (~0.5 cm or more on a typical 800×400 map).
 */
export function generateScatterNodes(
  count = 14,              // ~60% fewer than 35
  minScreenDistancePx = 45 // strong separation between particles
): ScatterNode[] {
  const nodes: ScatterNode[] = [];

  // equirectangular projection into [0, 1]²
  const project = (lat: number, lon: number): [number, number] => {
    const x = (lon + 180) / 360;
    const y = (90 - lat) / 180;
    return [x, y];
  };

  while (nodes.length < count) {
    const lat = randomRange(-70, 75); // avoid poles
    const lon = randomRange(-180, 180);

    const [x, y] = project(lat, lon);
    const ok = nodes.every((n) => {
      const [nx, ny] = project(n.lat, n.lon);
      const dx = (nx - x) * 800; // approximate map width in px
      const dy = (ny - y) * 400; // approximate map height in px
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist >= minScreenDistancePx;
    });

    if (!ok) continue;

    nodes.push({
      id: `scatter-${nodes.length}`,
      lat,
      lon,
    });
  }

  return nodes;
}

// Single frozen scatter set for the session
export const DRISHTI_SCATTER_NODES: ScatterNode[] = generateScatterNodes();

/**
 * Suggested visual intensity for scatter particles (alpha to use in RGBA).
 * Example: rgba(56, 189, 248, DRISHTI_SCATTER_ALPHA)
 */
export const DRISHTI_SCATTER_ALPHA = 0.06;
