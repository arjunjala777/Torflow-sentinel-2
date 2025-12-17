// src/components/DrishtiPanel.tsx
import React, { useEffect, useRef } from 'react';
import {
  DRISHTI_CORRIDORS,
  DRISHTI_NODE_ROLE_COLORS,
  DRISHTI_SCATTER_NODES,
  type Corridor,
  type CorridorNode,
} from '/components/drishtiData';
import * as topojson from 'topojson-client';
import * as d3geo from 'd3-geo';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
};

const MAP_WIDTH = 800;
const MAP_HEIGHT = 400;

// Shared Mercator projection used by both base map and nodes
const projection = d3geo
  .geoMercator()
  .scale(MAP_WIDTH / 6.5)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 1.5]);

const DrishtiPanel: React.FC = () => {
  if (!DRISHTI_CORRIDORS || DRISHTI_CORRIDORS.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-xs text-red-400 font-mono">
        Drishti data not loaded: check ../data/drishtiData.ts exports.
      </div>
    );
  }

  const [selectedCorridor, setSelectedCorridor] = React.useState<Corridor>(
    DRISHTI_CORRIDORS[0]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let intervalId: number;
    let cancelled = false;

    const init = async () => {
      if (!worldRef.current) {
        const res = await fetch(
          'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
        ); // [web:147]
        const topo = await res.json();
        worldRef.current = topojson.feature(
          topo,
          (topo as any).objects.countries
        ) as GeoJSON.FeatureCollection; // [web:145]
      }
      if (cancelled) return;
      runSimulation(ctx);
    };

    const runSimulation = (ctx: CanvasRenderingContext2D) => {
      const particles: Particle[] = [];
      const emitters: { x: number; y: number; color: string }[] = [];

      const world = worldRef.current!;

      const corridorNodes = selectedCorridor.nodes.map((n) => {
        const [x, y] = snapToLand(n.lon, n.lat, world);
        return { ...n, projected: [x, y] as [number, number] };
      });
      corridorNodes.forEach((n) => {
        emitters.push({
          x: n.projected[0],
          y: n.projected[1],
          color: DRISHTI_NODE_ROLE_COLORS[n.role],
        });
      });

      DRISHTI_SCATTER_NODES.forEach((n) => {
        const [x, y] = snapToLand(n.lon, n.lat, world);
        emitters.push({
          x,
          y,
          color: 'rgba(59,130,246,0.35)',
        });
      });

      const edges: { from: number; to: number; dist: number }[] = [];
      for (let i = 0; i < emitters.length; i++) {
        for (let j = i + 1; j < emitters.length; j++) {
          const a = emitters[i];
          const b = emitters[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 20 || d > 260) continue;
          edges.push({ from: i, to: j, dist: d });
        }
      }

      if (!edges.length || !worldRef.current) {
        ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
        if (worldRef.current) {
          drawBaseMap(ctx, worldRef.current);
        }
        return;
      }

      const spawnParticles = () => {
        edges.forEach((edge) => {
          const from = emitters[edge.from];
          const to = emitters[edge.to];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = edge.dist || 1;
          const steps = Math.max(1, Math.floor(len / 4));
          const stepT = 1 / steps;

          for (let s = 0; s < steps; s++) {
            const t = s * stepT;
            const px = from.x + dx * t;
            const py = from.y + dy * t;

            const speed = 0.08 + Math.random() * 0.06;
            const vx = (dx / len) * speed;
            const vy = (dy / len) * speed;

            particles.push({
              x: px,
              y: py,
              vx,
              vy,
              life: Math.random() * 1.5,
              maxLife: 1.5 + Math.random() * 1.0,
              color: 'rgba(56,189,248,0.45)',
            });
          }
        });
      };

      spawnParticles();

      const render = (time: number) => {
        void time;

        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        if (worldRef.current) {
          drawBaseMap(ctx, worldRef.current);
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        particles.forEach((p) => {
          p.life += 0.016;
          p.x += p.vx;
          p.y += p.vy;
          const alpha = 1 - p.life / p.maxLife;
          if (alpha <= 0) {
            p.life = 0;
            const edge = edges[Math.floor(Math.random() * edges.length)];
            const from = emitters[edge.from];
            const to = emitters[edge.to];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = edge.dist || 1;
            const t = Math.random();
            p.x = from.x + dx * t;
            p.y = from.y + dy * t;
            const speed = 0.08 + Math.random() * 0.06;
            p.vx = (dx / len) * speed;
            p.vy = (dy / len) * speed;
            p.maxLife = 1.5 + Math.random() * 1.0;
          }
          ctx.fillStyle = p.color.replace(
            '0.45',
            (0.15 + alpha * 0.35).toFixed(2)
          );
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // highlighted nodes
        emitters.forEach((e) => {
          ctx.beginPath();
          ctx.arc(e.x, e.y, 3.0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(e.x, e.y, 2.0, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(e.x, e.y, 1.0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fill();
        });

        frameId = requestAnimationFrame(render);
      };

      frameId = requestAnimationFrame(render);

      intervalId = window.setInterval(() => {
        particles.length = 0;
        spawnParticles();
      }, 5000);
    };

    init();

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [selectedCorridor]);

  return (
    <div className="w-full h-full bg-tor-panel border border-tor-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tor-border pb-2">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tor-green inline-block" />
            Drishti TorFlow
          </h2>
          <p className="text-[10px] text-gray-500 font-mono mt-1">
            Particle view of Tor corridors and global relay density.
          </p>
        </div>
        <span className="text-[10px] font-mono text-gray-500">
          {DRISHTI_CORRIDORS.length} canonical corridors ·{' '}
          {DRISHTI_SCATTER_NODES.length} scatter relays
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="col-span-4 flex flex-col gap-2 overflow-y-auto pr-1">
          {DRISHTI_CORRIDORS.map((corridor) => (
            <button
              key={corridor.id}
              onClick={() => setSelectedCorridor(corridor)}
              className={`text-left px-3 py-2 rounded-md border text-xs mb-1 transition-colors ${
                corridor.id === selectedCorridor.id
                  ? 'border-tor-green bg-black/60 text-white'
                  : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{corridor.label}</span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: corridor.color }}
                />
              </div>
              <p className="text-[10px] text-gray-500">{corridor.scenario}</p>
            </button>
          ))}
        </div>

        <div className="col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
              TorFlow Particle Map
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
              <LegendDot
                color={DRISHTI_NODE_ROLE_COLORS.SOURCE}
                label="Source"
              />
              <LegendDot color={DRISHTI_NODE_ROLE_COLORS.GUARD} label="Guard" />
              <LegendDot
                color={DRISHTI_NODE_ROLE_COLORS.MIDDLE}
                label="Middle"
              />
              <LegendDot color={DRISHTI_NODE_ROLE_COLORS.EXIT} label="Exit" />
              <LegendDot
                color={DRISHTI_NODE_ROLE_COLORS.TARGET}
                label="Target"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 rounded-md bg-black/80 border border-gray-900 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="w-full h-full block"
            />
          </div>

          <div className="mt-3 text-[10px] text-gray-400 font-mono flex justify-between">
            <span>
              Corridor:{' '}
              <span className="text-gray-200">{selectedCorridor.id}</span>
            </span>
            <span>
              Nodes:{' '}
              <span className="text-gray-200">
                {selectedCorridor.nodes.length}
              </span>{' '}
              · Hops:{' '}
              <span className="text-gray-200">
                {selectedCorridor.hops.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-tor-border text-[10px] text-gray-600 font-mono">
        Visual spacing of particles is approximate; tune MAP_WIDTH / spacing to
        match your display’s physical DPI.
      </div>
    </div>
  );
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function projectNode(node: CorridorNode): [number, number] {
  return projectLatLon(node.lat, node.lon);
}

function projectLatLon(lat: number, lon: number): [number, number] {
  const p = projection([lon, lat]);
  if (!p) return [0, 0];
  return [p[0], p[1]];
}
// Simple land hit-test: returns a projected point guaranteed to be on land.
// If the original point is already on land, it is returned unchanged.
function snapToLand(
  lon: number,
  lat: number,
  world: GeoJSON.FeatureCollection
): [number, number] {
  const p = projection([lon, lat]);
  if (!p) return [0, 0];

  const [x0, y0] = p;

  // Build a canvas path for land and test the point.
  const offscreen = document.createElement('canvas');
  offscreen.width = MAP_WIDTH;
  offscreen.height = MAP_HEIGHT;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return [x0, y0];

  const path = d3geo
    .geoPath()
    .projection(projection)
    .context(ctx as any);
  ctx.beginPath();
  world.features.forEach((feat) => {
    path(feat as any);
  });

  // If already on land, keep it.
  if (ctx.isPointInPath(x0, y0)) {
    return [x0, y0];
  }

  // Otherwise, walk outward in small steps until hitting land.
  const maxSteps = 40;
  const step = 3; // pixels
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

  for (let r = step; r <= maxSteps * step; r += step) {
    for (const a of angles) {
      const xx = x0 + r * Math.cos(a);
      const yy = y0 + r * Math.sin(a);
      if (ctx.isPointInPath(xx, yy)) {
        return [xx, yy];
      }
    }
  }

  // Fallback: original
  return [x0, y0];
}

function drawBaseMap(
  ctx: CanvasRenderingContext2D,
  world: GeoJSON.FeatureCollection
) {
  ctx.save();

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  const path = d3geo
    .geoPath()
    .projection(projection)
    .context(ctx as any); // [web:140]

  ctx.fillStyle = 'rgba(30,64,175,0.85)'; // dark indigo/blue land
  ctx.strokeStyle = 'rgba(15,23,42,0.9)';
  ctx.lineWidth = 0.5;

  world.features.forEach((feat) => {
    ctx.beginPath();
    path(feat as any);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

export default DrishtiPanel;

