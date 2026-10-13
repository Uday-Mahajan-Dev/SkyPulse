import React, { useState } from "react";
import {
  Sparkles,
  Search,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { SCHEMA_TABLES } from "../../data/warehouseData";

// Refined spatial coordinates to eliminate card overlap
const STAR_LAYOUT = [
  { id: "Dim_Passenger", x: 190, y: 140 },
  { id: "Dim_Flight_Profile", x: 530, y: 90 },
  { id: "Dim_Date", x: 870, y: 140 },
  { id: "Dim_Route", x: 920, y: 375 },
  { id: "Dim_Aircraft", x: 860, y: 610 },
  { id: "Dim_Weather", x: 530, y: 650 },
  { id: "Dim_Crew", x: 190, y: 600 },
];

const FACT_POS = { x: 530, y: 370 };

export default function StarSchemaVisualizer({ onSelectTable, theme }) {
  const [hoveredTable, setHoveredTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnimatedFlow, setShowAnimatedFlow] = useState(true);

  const isDark = theme === "dark";
  const fact = SCHEMA_TABLES.Fact_Satisfaction;
  const dimensions = STAR_LAYOUT.map((item) => ({
    ...item,
    data: SCHEMA_TABLES[item.id],
  }));

  const isMatch = (table) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const inName = table.name.toLowerCase().includes(q);
    const inCols = table.columns?.some(
      (c) => c.name.toLowerCase().includes(q) || c.desc?.toLowerCase().includes(q)
    );
    return inName || inCols;
  };

  return (
    <div
      className={`relative rounded-2xl border shadow-xl p-4 sm:p-6 overflow-hidden transition-colors ${
        isDark
          ? "bg-slate-900/80 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-800"
      }`}
    >
      {/* Visualizer Top Bar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isDark
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-cyan-50 border-cyan-300 text-cyan-700"
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              Interactive Star Schema Architecture
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isDark
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-cyan-100 text-cyan-800 border border-cyan-200"
                }`}
              >
                Inmon & Kimball Standard
              </span>
            </h3>
            <p
              className={`text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Radial topology of Fact_Satisfaction surrounded by 7 conformed dimension entities.
            </p>
          </div>
        </div>

        {/* Search & Flow Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className={`w-4 h-4 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              />
            </div>
            <input
              type="text"
              placeholder="Search attribute or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600"
              }`}
            />
          </div>

          <button
            onClick={() => setShowAnimatedFlow(!showAnimatedFlow)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
              showAnimatedFlow
                ? isDark
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                  : "bg-cyan-100 border-cyan-300 text-cyan-800"
                : isDark
                ? "bg-slate-950 border-slate-800 text-slate-400"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            {showAnimatedFlow ? "⚡ Join Flow: ON" : "Join Flow: OFF"}
          </button>
        </div>
      </div>

      {/* Main SVG Canvas */}
      <div className="relative w-full overflow-x-auto min-h-[680px] flex items-center justify-center select-none">
        <svg
          viewBox="0 0 1060 740"
          className="w-full max-w-[1060px] h-[740px] pointer-events-auto"
        >
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="fact-radial-dark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#083344" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
            </radialGradient>
            <radialGradient id="fact-radial-light" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="1" />
              <stop offset="100%" stopColor="#f0f9ff" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Connectors (Fact to Dimension) */}
          {dimensions.map((dim) => {
            const isHovered =
              hoveredTable === dim.id || hoveredTable === "Fact_Satisfaction";
            const isHighlight = isMatch(dim.data);
            const fkItem = fact.fks.find((fk) => fk.references.startsWith(dim.id));

            return (
              <g key={dim.id}>
                <line
                  x1={FACT_POS.x}
                  y1={FACT_POS.y}
                  x2={dim.x}
                  y2={dim.y}
                  stroke={
                    isHovered
                      ? isDark
                        ? "#22d3ee"
                        : "#0284c7"
                      : isHighlight
                      ? isDark
                        ? "#334155"
                        : "#94a3b8"
                      : isDark
                      ? "#1e293b"
                      : "#cbd5e1"
                  }
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                  strokeDasharray={isHovered ? "none" : "5 5"}
                  filter={isHovered && isDark ? "url(#neon-glow)" : undefined}
                />

                {/* Animated Particles */}
                {showAnimatedFlow && (
                  <circle
                    r="3.5"
                    fill={isDark ? "#22d3ee" : "#0284c7"}
                    className="opacity-80"
                  >
                    <animateMotion
                      path={`M ${FACT_POS.x} ${FACT_POS.y} L ${dim.x} ${dim.y}`}
                      dur={`${3 + (dim.x % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Foreign Key Badge */}
                <g
                  transform={`translate(${
                    FACT_POS.x * 0.45 + dim.x * 0.55
                  }, ${FACT_POS.y * 0.45 + dim.y * 0.55})`}
                >
                  <rect
                    x="-55"
                    y="-11"
                    width="110"
                    height="22"
                    rx="6"
                    fill={isDark ? "#0f172a" : "#ffffff"}
                    stroke={
                      isHovered
                        ? isDark
                          ? "#06b6d4"
                          : "#0284c7"
                        : isDark
                        ? "#334155"
                        : "#cbd5e1"
                    }
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={
                      isHovered
                        ? isDark
                          ? "#67e8f9"
                          : "#0369a1"
                        : isDark
                        ? "#94a3b8"
                        : "#64748b"
                    }
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    FK: {fkItem?.fk || "ID"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Radial Dimension Cards */}
          {dimensions.map((dim) => {
            const isHovered = hoveredTable === dim.id;
            const matchesQuery = isMatch(dim.data);
            const w = 175;
            const h = 115;
            const left = dim.x - w / 2;
            const top = dim.y - h / 2;

            return (
              <g
                key={dim.id}
                transform={`translate(${left}, ${top})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTable(dim.id)}
                onMouseLeave={() => setHoveredTable(null)}
                onClick={() => onSelectTable(dim.data)}
              >
                {/* Node Box */}
                <rect
                  width={w}
                  height={h}
                  rx="14"
                  fill={isDark ? "#090d16" : "#ffffff"}
                  stroke={
                    isHovered
                      ? isDark
                        ? "#818cf8"
                        : "#4f46e5"
                      : matchesQuery
                      ? isDark
                        ? "#312e81"
                        : "#c7d2fe"
                      : isDark
                      ? "#1e293b"
                      : "#e2e8f0"
                  }
                  strokeWidth={isHovered ? "2" : "1"}
                  filter={isHovered && isDark ? "url(#neon-glow)" : undefined}
                />

                {/* Header Strip */}
                <rect
                  width={w}
                  height="30"
                  rx="14"
                  fill={isDark ? "#1e1b4b" : "#e0e7ff"}
                />
                <rect
                  y="16"
                  width={w}
                  height="14"
                  fill={isDark ? "#1e1b4b" : "#e0e7ff"}
                />

                <text
                  x="12"
                  y="20"
                  fill={isDark ? "#e0e7ff" : "#1e1b4b"}
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {dim.data.name}
                </text>

                <text
                  x="12"
                  y="46"
                  fill={isDark ? "#818cf8" : "#4338ca"}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  PK: {dim.data.pk}
                </text>

                <text
                  x={w - 12}
                  y="46"
                  textAnchor="end"
                  fill={isDark ? "#94a3b8" : "#64748b"}
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {dim.data.rowCount.toLocaleString()} rows
                </text>

                <g transform="translate(12, 60)">
                  {dim.data.columns
                    .filter((c) => c.key !== "PK")
                    .slice(0, 3)
                    .map((col, idx) => (
                      <text
                        key={idx}
                        x="0"
                        y={idx * 14}
                        fill={isDark ? "#94a3b8" : "#475569"}
                        fontSize="9"
                      >
                        • {col.name.length > 20 ? col.name.slice(0, 18) + "…" : col.name}
                      </text>
                    ))}
                </g>

                <rect
                  y={h - 18}
                  width={w}
                  height="18"
                  rx="10"
                  fill={
                    isHovered
                      ? isDark
                        ? "#3730a3"
                        : "#c7d2fe"
                      : isDark
                      ? "#0f172a"
                      : "#f1f5f9"
                  }
                />
                <text
                  x={w / 2}
                  y={h - 6}
                  textAnchor="middle"
                  fill={
                    isHovered
                      ? isDark
                        ? "#e0e7ff"
                        : "#1e1b4b"
                      : isDark
                      ? "#64748b"
                      : "#64748b"
                  }
                  fontSize="8.5"
                  fontWeight="600"
                >
                  Click to inspect schema ➔
                </text>
              </g>
            );
          })}

          {/* Central Fact Node */}
          <g
            transform={`translate(${FACT_POS.x - 130}, ${FACT_POS.y - 120})`}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredTable("Fact_Satisfaction")}
            onMouseLeave={() => setHoveredTable(null)}
            onClick={() => onSelectTable(fact)}
          >
            <rect
              width="260"
              height="240"
              rx="20"
              fill={isDark ? "url(#fact-radial-dark)" : "url(#fact-radial-light)"}
              stroke={
                hoveredTable === "Fact_Satisfaction"
                  ? isDark
                    ? "#22d3ee"
                    : "#0284c7"
                  : isDark
                  ? "#0891b2"
                  : "#38bdf8"
              }
              strokeWidth="2.5"
              filter={isDark ? "url(#neon-glow)" : undefined}
            />

            <rect
              width="260"
              height="44"
              rx="20"
              fill={isDark ? "#083344" : "#bae6fd"}
            />
            <rect
              y="24"
              width="260"
              height="20"
              fill={isDark ? "#083344" : "#bae6fd"}
            />

            <text
              x="18"
              y="28"
              fill={isDark ? "#ecfeff" : "#0369a1"}
              fontSize="14"
              fontWeight="800"
              fontFamily="monospace"
            >
              ★ Fact_Satisfaction
            </text>

            <rect
              x="180"
              y="12"
              width="68"
              height="20"
              rx="6"
              fill={isDark ? "#06b6d4" : "#0284c7"}
              opacity={isDark ? "0.25" : "0.15"}
            />
            <text
              x="214"
              y="26"
              textAnchor="middle"
              fill={isDark ? "#67e8f9" : "#0369a1"}
              fontSize="10"
              fontWeight="700"
              fontFamily="monospace"
            >
              FACT (10k)
            </text>

            <text
              x="18"
              y="60"
              fill={isDark ? "#94a3b8" : "#64748b"}
              fontSize="9.5"
            >
              Grain: 1 record per survey per flight
            </text>

            <text
              x="18"
              y="82"
              fill={isDark ? "#38bdf8" : "#0284c7"}
              fontSize="10.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              MEASURES & METRICS (18):
            </text>

            <g transform="translate(18, 98)">
              <text
                x="0"
                y="0"
                fill={isDark ? "#cbd5e1" : "#334155"}
                fontSize="9.5"
              >
                • Departure & Arrival Delays (min)
              </text>
              <text
                x="0"
                y="15"
                fill={isDark ? "#cbd5e1" : "#334155"}
                fontSize="9.5"
              >
                • Ticket Price ($) & Discount %
              </text>
              <text
                x="0"
                y="30"
                fill={isDark ? "#cbd5e1" : "#334155"}
                fontSize="9.5"
              >
                • Flight Distance (miles)
              </text>
              <text
                x="0"
                y="45"
                fill={isDark ? "#cbd5e1" : "#334155"}
                fontSize="9.5"
              >
                • 14 Cabin Survey Ratings (1-5★)
              </text>
              <text
                x="12"
                y="58"
                fill={isDark ? "#67e8f9" : "#0284c7"}
                fontSize="8.5"
              >
                (Wifi, Boarding, Comfort, Food, etc.)
              </text>
            </g>

            <rect
              x="18"
              y="172"
              width="224"
              height="24"
              rx="6"
              fill={isDark ? "#1e1b4b" : "#e0e7ff"}
              stroke={isDark ? "#6366f1" : "#818cf8"}
              strokeWidth="1"
            />
            <text
              x="130"
              y="188"
              textAnchor="middle"
              fill={isDark ? "#c7d2fe" : "#3730a3"}
              fontSize="9.5"
              fontWeight="600"
              fontFamily="monospace"
            >
              Target: satisfaction (Binary)
            </text>

            <rect
              y="208"
              width="260"
              height="32"
              rx="16"
              fill={isDark ? "#0e7490" : "#0284c7"}
            />
            <text
              x="130"
              y="228"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="700"
            >
              Click to Open Full Fact Table Schema ➔
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
