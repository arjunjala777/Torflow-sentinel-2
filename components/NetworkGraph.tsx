import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TraceSession, Node } from '../types';
import * as topojson from 'topojson-client';

interface NetworkGraphProps {
  trace: TraceSession;
  currentStep: number;
  viewMode: 'topology' | 'map';
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ trace, currentStep, viewMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Load world map data once
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(data => {
        setWorldData(topojson.feature(data, data.objects.countries));
      })
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    
    // Reset SVG
    svg.selectAll("*").remove();

    // 1. Define High-Contrast Animations & Styles
    svg.append("style").text(`
      @keyframes dashflow {
        to { stroke-dashoffset: -36; }
      }
      .traffic-line {
        stroke-dasharray: 12 24; /* Long dash, long gap for 'tracer' look */
        stroke-linecap: round;   /* Rounded tips for bullet effect */
        animation: dashflow 0.6s linear infinite; /* Fast speed */
        filter: drop-shadow(0 0 4px currentColor); /* Dynamic glow */
      }
      .static-line {
        stroke-dasharray: 2 6;
        opacity: 0.2;
      }
      .topology-card {
        font-family: 'JetBrains Mono', monospace;
      }
      .map-hover-card {
        transition: opacity 0.15s ease-out;
        pointer-events: none;
      }
      .country-badge {
        font-weight: 700;
        letter-spacing: 1px;
      }
    `);

    // 2. Define Filters
    const defs = svg.append("defs");
    
    // Intense Neon Glow Filter
    const glowFilter = defs.append("filter")
      .attr("id", "neon-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    if (viewMode === 'topology') {
      renderTopology(svg, width, height, trace, currentStep);
    } else {
      renderMap(svg, width, height, trace, currentStep, worldData);
    }

  }, [trace, currentStep, viewMode, worldData]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'source': return '#ffffff'; // White
      case 'guard': return '#00ff00';  // Green
      case 'middle': return '#2a9fff'; // Blue
      case 'exit': return '#ff2a2a';   // Red
      case 'target': return '#ffcc00'; // Yellow
      default: return '#666666';
    }
  };

  const renderTopology = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number,
    trace: TraceSession,
    step: number
  ) => {
    // Layout: Horizontal spread
    const nodes = trace.nodes.map((node, i) => ({
      ...node,
      x: (width / 6) * (i + 1),
      y: height / 2 - 30 // Shift up to allow space for cards below
    }));

    // Quadratic Bezier Curve (Arcing Up)
    const getPath = (s: {x: number, y: number}, t: {x: number, y: number}) => {
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2 - 60; // Higher arc for clearance
      return `M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`;
    };

    // --- Draw Connections ---
    for (let i = 0; i < nodes.length - 1; i++) {
        const isActive = i < step;
        const pathD = getPath(nodes[i], nodes[i+1]);
        const targetColor = getNodeColor(nodes[i+1].type);

        // 1. Base Track (Darker)
        svg.append("path")
            .attr("d", pathD)
            .attr("fill", "none")
            .attr("stroke", "#1a1a1a")
            .attr("stroke-width", 4)
            .attr("stroke-linecap", "round");

        // 2. Traffic Line (Animated)
        if (isActive) {
           svg.append("path")
            .attr("d", pathD)
            .attr("fill", "none")
            .attr("stroke", targetColor)
            .attr("stroke-width", 3)
            .attr("class", "traffic-line")
            .style("color", targetColor); // Passed to currentColor in CSS
        } else {
           // Inactive Dotted
           svg.append("path")
            .attr("d", pathD)
            .attr("fill", "none")
            .attr("stroke", "#444")
            .attr("stroke-width", 1)
            .attr("class", "static-line");
        }
    }

    // --- Draw Nodes & Permanent Cards ---
    const nodeGroups = svg.selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("class", "topology-card");

    // 1. The Node Circle
    nodeGroups.append("circle")
      .attr("r", 12)
      .attr("fill", "#050505")
      .attr("stroke", d => getNodeColor(d.type))
      .attr("stroke-width", 3)
      .attr("filter", "url(#neon-glow)");

    // 2. PERMANENT INFO CARD (Below Node)
    const cardW = 110;
    const cardH = 65;
    const cardGroup = nodeGroups.append("g")
      .attr("transform", `translate(${-cardW / 2}, 25)`);

    // Card Background
    cardGroup.append("rect")
      .attr("width", cardW)
      .attr("height", cardH)
      .attr("rx", 4)
      .attr("fill", "#0a0a0a")
      .attr("stroke", "#222")
      .attr("stroke-width", 1);
    
    // Color Bar Top
    cardGroup.append("rect")
      .attr("width", cardW)
      .attr("height", 3)
      .attr("fill", d => getNodeColor(d.type));

    // Role Title
    cardGroup.append("text")
      .attr("x", cardW / 2)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .text(d => d.type.toUpperCase())
      .attr("fill", d => getNodeColor(d.type))
      .style("font-size", "10px")
      .style("font-weight", "bold");

    // IP Address
    cardGroup.append("text")
      .attr("x", cardW / 2)
      .attr("y", 32)
      .attr("text-anchor", "middle")
      .text(d => d.ip)
      .attr("fill", "#ccc")
      .style("font-size", "10px");

    // Country Box (Badge)
    const badgeW = 30;
    const badgeH = 16;
    cardGroup.append("rect")
      .attr("x", (cardW - badgeW) / 2)
      .attr("y", 40)
      .attr("width", badgeW)
      .attr("height", badgeH)
      .attr("rx", 2)
      .attr("fill", "#222")
      .attr("stroke", "#444")
      .attr("stroke-width", 0.5);

    cardGroup.append("text")
      .attr("x", cardW / 2)
      .attr("y", 51)
      .attr("text-anchor", "middle")
      .text(d => d.country)
      .attr("fill", "#fff")
      .attr("class", "country-badge")
      .style("font-size", "10px");
  };

  const renderMap = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number,
    trace: TraceSession,
    step: number,
    world: any
  ) => {
    // --- 1. ZOOM & MAP SETUP ---
    const mapGroup = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
      });
    
    svg.call(zoom).on("dblclick.zoom", null);

    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Draw World
    if (world) {
      mapGroup.append("g")
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", "#0a0a0a")
        .attr("stroke", "#1f1f1f")
        .attr("stroke-width", 0.5);
    }

    // Node Projections
    const nodes = trace.nodes.map(n => {
      const coords = projection([n.lon, n.lat]);
      return { ...n, x: coords ? coords[0] : 0, y: coords ? coords[1] : 0 };
    });

    // --- 2. DRAW CRISP FLOWING LINES ---
    for (let i = 0; i < nodes.length - 1; i++) {
        const source = nodes[i];
        const target = nodes[i+1];
        const isActive = i < step;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // Arc Logic
        const offsetScale = 0.2; 
        const ctrlX = midX - dy * offsetScale;
        const ctrlY = midY + dx * offsetScale;
        const pathData = `M${source.x},${source.y} Q${ctrlX},${ctrlY} ${target.x},${target.y}`;
        const targetColor = getNodeColor(target.type);

        // Base Track (Dark)
        mapGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", "#111")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");

        // Traffic Line (Animated 'Tracer Bullet')
        if (isActive) {
            mapGroup.append("path")
                .attr("d", pathData)
                .attr("fill", "none")
                .attr("stroke", targetColor)
                .attr("stroke-width", 2.5)
                .attr("class", "traffic-line")
                .style("color", targetColor);
        } else {
            mapGroup.append("path")
                .attr("d", pathData)
                .attr("fill", "none")
                .attr("stroke", "#333")
                .attr("stroke-width", 1)
                .attr("class", "static-line");
        }
    }

    // --- 3. DRAW NODES (Simple Dot) & HOVER LOGIC ---
    const nodeGroups = mapGroup.selectAll("g.mapnode")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "crosshair");

    // Interaction Events
    nodeGroups
      .on("mouseenter", function() {
        // Show Label
        d3.select(this).select(".map-hover-card").style("opacity", 1);
        // Highlight Node
        d3.select(this).select(".main-dot")
          .attr("fill", "#fff")
          .attr("stroke", "#fff")
          .attr("filter", "url(#neon-glow)");
        d3.select(this).raise();
      })
      .on("mouseleave", function(event, d: any) {
        // Hide Label
        d3.select(this).select(".map-hover-card").style("opacity", 0);
        // Reset Node
        d3.select(this).select(".main-dot")
          .attr("fill", getNodeColor(d.type))
          .attr("stroke", "#000")
          .attr("filter", null);
      });

    // The Node Dot (Simple & Clean by default)
    nodeGroups.append("circle")
      .attr("class", "main-dot")
      .attr("r", 5)
      .attr("fill", d => getNodeColor(d.type))
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5);

    // --- HOVER CARD (Strictly Hidden by Default) ---
    const hoverGroup = nodeGroups.append("g")
      .attr("class", "map-hover-card")
      .attr("transform", "translate(12, -20)") // Offset to right
      .style("opacity", 0); // HIDDEN DEFAULT

    // Hover Card Background
    hoverGroup.append("rect")
      .attr("width", 150)
      .attr("height", 44)
      .attr("rx", 3)
      .attr("fill", "rgba(5, 5, 5, 0.95)")
      .attr("stroke", d => getNodeColor(d.type))
      .attr("stroke-width", 1)
      .attr("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.8))");

    // Role
    hoverGroup.append("text")
      .attr("x", 10)
      .attr("y", 15)
      .text(d => d.type.toUpperCase())
      .attr("fill", d => getNodeColor(d.type))
      .style("font-size", "9px")
      .style("font-weight", "bold")
      .style("font-family", "JetBrains Mono")
      .attr("vector-effect", "non-scaling-stroke");

    // IP
    hoverGroup.append("text")
      .attr("x", 10)
      .attr("y", 30)
      .text(d => d.ip)
      .attr("fill", "#fff")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono")
      .attr("vector-effect", "non-scaling-stroke");

    // Country Code (Right Aligned)
    hoverGroup.append("text")
      .attr("x", 140)
      .attr("y", 30)
      .attr("text-anchor", "end")
      .text(d => `[${d.country}]`)
      .attr("fill", "#888")
      .style("font-size", "10px")
      .style("font-family", "JetBrains Mono")
      .attr("vector-effect", "non-scaling-stroke");
      
    // Active Pulse (Subtle ring for active node in map view)
    nodeGroups.each(function(d, i) {
        if (i === Math.floor(step)) {
            d3.select(this).append("circle")
                .attr("r", 6)
                .attr("fill", "none")
                .attr("stroke", getNodeColor(d.type))
                .attr("stroke-width", 1)
                .attr("opacity", 1)
                .style("pointer-events", "none")
                .transition()
                .duration(1500)
                .ease(d3.easeQuadOut)
                .attr("r", 20)
                .attr("opacity", 0)
                .on("end", function repeat() {
                    d3.select(this)
                      .attr("r", 6)
                      .attr("opacity", 1)
                      .transition()
                      .duration(1500)
                      .attr("r", 20)
                      .attr("opacity", 0)
                      .on("end", repeat);
                });
        }
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full cursor-move">
      <svg ref={svgRef} width="100%" height="100%" className="overflow-hidden bg-[#050505]" />
    </div>
  );
};

export default NetworkGraph;
