
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LocationData, NearbyResponder } from '../types';

interface SafetyMapProps {
  location: LocationData | null;
  responders?: NearbyResponder[];
}

export const SafetyMap: React.FC<SafetyMapProps> = ({ location, responders = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 300;
    const height = 300;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll("*").remove();

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Radar circles
    [50, 100, 140].forEach(radius => {
      g.append('circle')
        .attr('r', radius)
        .attr('fill', 'none')
        .attr('stroke', '#334155')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');
    });

    // Radar crosshairs
    for (let i = 0; i < 360; i += 45) {
      const angle = (i * Math.PI) / 180;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 140 * Math.cos(angle))
        .attr('y2', 140 * Math.sin(angle))
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 1);
    }

    // Scanning sweep
    const sweep = g.append('path')
      .attr('fill', 'url(#sweepGradient)')
      .attr('d', d3.arc()({
        innerRadius: 0,
        outerRadius: 140,
        startAngle: 0,
        endAngle: Math.PI / 4
      } as any));

    sweep.append('animateTransform')
      .attr('attributeName', 'transform')
      .attr('type', 'rotate')
      .attr('from', '0 0 0')
      .attr('to', '360 0 0')
      .attr('dur', '4s')
      .attr('repeatCount', 'indefinite');

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'sweepGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(56, 189, 248, 0.4)');
    grad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(56, 189, 248, 0)');

    // Accuracy Circle (shows the GPS confidence level)
    if (location && location.accuracy) {
      // Scale accuracy value to pixels (rough estimation for visual context)
      const accuracyRadius = Math.min(60, location.accuracy / 2);
      g.append('circle')
        .attr('r', accuracyRadius)
        .attr('fill', 'rgba(56, 189, 248, 0.1)')
        .attr('stroke', 'rgba(56, 189, 248, 0.3)')
        .attr('stroke-width', 1);
    }

    // Render Nearby Responders
    responders.forEach(r => {
      const angle = (r.bearing - 90) * (Math.PI / 180);
      const radius = Math.min(130, 40 + (r.distance / 10));
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      const color = r.type === 'police' ? '#3b82f6' : r.type === 'ambulance' ? '#ef4444' : '#10b981';
      
      const responderGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`);

      responderGroup.append('circle')
        .attr('r', 5)
        .attr('fill', color)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '4;7;4')
        .attr('dur', '1.5s')
        .attr('repeatCount', 'indefinite');

      responderGroup.append('text')
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .text(r.type.toUpperCase());
    });

    // User Position (Center)
    if (location) {
      g.append('circle')
        .attr('r', 8)
        .attr('fill', '#ef4444')
        .attr('class', 'pulse-animation')
        .style('filter', 'drop-shadow(0 0 5px #ef4444)');
      
      g.append('text')
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f8fafc')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('YOU');
    }

  }, [location, responders]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative glass-morphism rounded-full p-2 border-2 border-slate-700">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 font-mono">
          {location ? `LAT: ${location.lat.toFixed(4)} | LNG: ${location.lng.toFixed(4)}` : 'ACQUIRING GPS...'}
        </p>
        <div className="flex justify-center gap-3 mt-1">
           {location && (
             <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${location.accuracy < 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
               ACCURACY: {location.accuracy.toFixed(1)}m
             </span>
           )}
           {responders.length > 0 && (
            <span className="text-[9px] text-sky-400 font-bold uppercase animate-pulse">
              {responders.length} RESPONDERS
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
