import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Scissors,
  Box,
  RotateCw,
  RefreshCw,
  Code2,
  Sliders,
  Check,
  AlertCircle,
  Table as TableIcon,
} from "lucide-react";
import { api } from "../../services/api";

const HIERARCHY_LEVELS = [
  { key: "Season", label: "Season (Quarterly Macro)" },
  { key: "Year", label: "Year (Annual Grain)" },
  { key: "Month", label: "Month (1-12 Temporal)" },
  { key: "Day_of_Week", label: "Day of Week (Operational)" },
];

const MEASURES = [
  { key: "is_satisfied", label: "Satisfaction Rate (%)" },
  { key: "Departure_Delay_in_Minutes", label: "Departure Delay (min)" },
  { key: "Arrival_Delay_in_Minutes", label: "Arrival Delay (min)" },
  { key: "Ticket_Price", label: "Ticket Price ($ USD)" },
  { key: "Flight_Distance", label: "Flight Distance (Miles)" },
  { key: "Inflight_wifi_service", label: "Wi-Fi Rating (1-5★)" },
];

const AGG_FUNCS = [
  { key: "mean", label: "Average (Mean)" },
  { key: "sum", label: "Aggregate Total (Sum)" },
  { key: "count", label: "Record Count (Volume)" },
];

const DIMENSIONS = [
  { key: "Class", label: "Travel Class", values: ["Business", "Eco", "Eco Plus"] },
  { key: "Type_of_Travel", label: "Type of Travel", values: ["Business travel", "Personal Travel"] },
  { key: "Customer_Type", label: "Customer Loyalty", values: ["Loyal Customer", "disloyal Customer"] },
  { key: "Flight_Type", label: "Flight Routing", values: ["Domestic", "International"] },
  { key: "Season", label: "Season", values: ["Winter", "Summer", "Spring", "Fall"] },
  { key: "Manufacturer", label: "Manufacturer", values: ["Boeing", "Airbus", "Embraer"] },
  { key: "Model", label: "Aircraft Model", values: ["777-300ER", "787 Dreamliner", "A350", "737-MAX", "A320neo", "737-800"] },
  { key: "Wifi_Type", label: "Connectivity Tier", values: ["High-Speed", "Basic"] },
  { key: "Departure_Conditions", label: "Weather Conditions", values: ["Clear", "Rain", "Snow", "Storm", "Fog"] },
];

export default function OlapStudio({ theme }) {
  const isDark = theme === "dark";
  const [activeOp, setActiveOp] = useState("rollup");
  const [loading, setLoading] = useState(false);

  // 1. Dynamic Roll-Up State
  const [rollupLevel, setRollupLevel] = useState("Season");
  const [rollupMeasure, setRollupMeasure] = useState("is_satisfied");
  const [rollupAgg, setRollupAgg] = useState("mean");
  const [rollupData, setRollupData] = useState([]);

  // 2. Dynamic Drill-Down State
  const [drillPrimaryDim, setDrillPrimaryDim] = useState("Class");
  const [drillPrimaryVal, setDrillPrimaryVal] = useState("Business");
  const [drillSubDim, setDrillSubDim] = useState("Model");
  const [drillMeasure, setDrillMeasure] = useState("is_satisfied");
  const [drillData, setDrillData] = useState([]);

  // 3. Dynamic Slice State
  const [sliceDim, setSliceDim] = useState("Customer_Type");
  const [sliceVal, setSliceVal] = useState("disloyal Customer");
  const [sliceCrossDim, setSliceCrossDim] = useState("Type_of_Travel");
  const [sliceMeasure, setSliceMeasure] = useState("is_satisfied");
  const [sliceData, setSliceData] = useState([]);

  // 4. Dynamic Dice State
  const [diceDim1, setDiceDim1] = useState("Class");
  const [diceVal1, setDiceVal1] = useState("Business");
  const [diceDim2, setDiceDim2] = useState("Season");
  const [diceVal2, setDiceVal2] = useState("Winter");
  const [diceMetricCol, setDiceMetricCol] = useState("Departure_Delay_in_Minutes");
  const [diceThreshold, setDiceThreshold] = useState(15);
  const [diceData, setDiceData] = useState(null);

  // 5. Dynamic Pivot State
  const [pivotRow, setPivotRow] = useState("Origin_Airport_Code");
  const [pivotCol, setPivotCol] = useState("Class");
  const [pivotMetric, setPivotMetric] = useState("is_satisfied");
  const [pivotAgg, setPivotAgg] = useState("mean");
  const [pivotData, setPivotData] = useState(null);

  // Recharts styling
  const chartColors = useMemo(() => {
    return {
      grid: isDark ? "#1e293b" : "#e2e8f0",
      text: isDark ? "#94a3b8" : "#475569",
      tooltipBg: isDark ? "#0f172a" : "#ffffff",
      tooltipBorder: isDark ? "#334155" : "#cbd5e1",
      primary: isDark ? "#06b6d4" : "#0284c7",
      secondary: isDark ? "#6366f1" : "#4f46e5",
    };
  }, [isDark]);

  // Operations metadata
  const operations = [
    {
      id: "rollup",
      name: "Dynamic Roll-Up",
      icon: ArrowUpRight,
      desc: "Aggregate up hierarchies (Month ➔ Season ➔ Year) across arbitrary measures.",
    },
    {
      id: "drilldown",
      name: "Dynamic Drill-Down",
      icon: ArrowDownRight,
      desc: "Filter on a primary entity & expand into arbitrary sub-dimensions.",
    },
    {
      id: "slice",
      name: "Dynamic Slice",
      icon: Scissors,
      desc: "Cut a 2D plane on any dimension value across a chosen X-axis dimension.",
    },
    {
      id: "dice",
      name: "Dynamic Dice",
      icon: Box,
      desc: "Extract a sub-cube by constraining 2 dimensions + 1 numeric threshold simultaneously.",
    },
    {
      id: "pivot",
      name: "Dynamic Pivot Matrix",
      icon: RotateCw,
      desc: "Interactive 2-way cross-tabulation grid with configurable metrics and heatmaps.",
    },
  ];

  // Fetch data dynamically on control change
  useEffect(() => {
    let isMounted = true;
    async function executeOlap() {
      setLoading(true);
      try {
        if (activeOp === "rollup") {
          const res = await api.getRollup(rollupLevel, rollupMeasure, rollupAgg);
          if (isMounted) setRollupData(res);
        } else if (activeOp === "drilldown") {
          const res = await api.getDrilldown(drillPrimaryDim, drillPrimaryVal, drillSubDim, drillMeasure);
          if (isMounted) setDrillData(res);
        } else if (activeOp === "slice") {
          const res = await api.getSlice(sliceDim, sliceVal, sliceCrossDim, sliceMeasure);
          if (isMounted) setSliceData(res);
        } else if (activeOp === "dice") {
          const res = await api.getDice(diceDim1, diceVal1, diceDim2, diceVal2, diceMetricCol, diceThreshold);
          if (isMounted) setDiceData(res);
        } else if (activeOp === "pivot") {
          const res = await api.getPivot(pivotRow, pivotCol, pivotMetric, pivotAgg);
          if (isMounted) setPivotData(res);
        }
      } catch (err) {
        console.error("OLAP Fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    executeOlap();
    return () => {
      isMounted = false;
    };
  }, [
    activeOp,
    rollupLevel,
    rollupMeasure,
    rollupAgg,
    drillPrimaryDim,
    drillPrimaryVal,
    drillSubDim,
    drillMeasure,
    sliceDim,
    sliceVal,
    sliceCrossDim,
    sliceMeasure,
    diceDim1,
    diceVal1,
    diceDim2,
    diceVal2,
    diceMetricCol,
    diceThreshold,
    pivotRow,
    pivotCol,
    pivotMetric,
    pivotAgg,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header & Operation Selector */}
      <div
        className={`rounded-2xl border p-6 shadow-xl transition-colors ${
          isDark
            ? "bg-slate-900/80 border-slate-800 text-slate-100"
            : "bg-white/95 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-lg border ${
                  isDark
                    ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
              >
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">
                User-Driven OLAP Multi-Dimensional Analytics Studio
              </h2>
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Interactive data warehousing studio allowing arbitrary combinations of dimensions, measures, and aggregations.
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-mono ${
              isDark
                ? "bg-slate-950 border-slate-800 text-cyan-300"
                : "bg-slate-100 border-slate-200 text-cyan-800 font-bold"
            }`}
          >
            <span>Live Cube Engine Active</span>
          </div>
        </div>

        {/* Operation Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {operations.map((op) => {
            const Icon = op.icon;
            const isActive = activeOp === op.id;
            return (
              <button
                key={op.id}
                onClick={() => setActiveOp(op.id)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? isDark
                      ? "bg-slate-800/95 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                      : "bg-cyan-50 border-cyan-300 shadow-sm ring-1 ring-cyan-400"
                    : isDark
                    ? "bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 text-slate-400"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? isDark
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-cyan-100 text-cyan-700"
                        : isDark
                        ? "bg-slate-900 text-slate-400"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? isDark
                          ? "bg-cyan-500/20 text-cyan-300 font-bold"
                          : "bg-cyan-200 text-cyan-800 font-bold"
                        : isDark
                        ? "bg-slate-900 text-slate-500"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    OLAP
                  </span>
                </div>
                <span
                  className={`text-sm font-bold tracking-tight ${
                    isActive
                      ? isDark
                        ? "text-white"
                        : "text-slate-900"
                      : isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  {op.name}
                </span>
                <span
                  className={`text-[11px] line-clamp-2 mt-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {op.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Working Panel */}
      <div
        className={`rounded-2xl border p-6 shadow-xl transition-colors ${
          isDark
            ? "bg-slate-900/60 border-slate-800 text-slate-100"
            : "bg-white/95 border-slate-200 text-slate-800"
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. DYNAMIC ROLL-UP */}
        {/* ========================================================================= */}
        {activeOp === "rollup" && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  Dynamic Roll-Up Controls
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Choose any hierarchy level, measure, and aggregation method to summarize.
                </p>
              </div>

              {/* Dynamic Controls Grid */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {/* Level */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Level:</span>
                  <select
                    value={rollupLevel}
                    onChange={(e) => setRollupLevel(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-cyan-300" : "bg-white border-slate-300 text-cyan-700"
                    }`}
                  >
                    {HIERARCHY_LEVELS.map((h) => (
                      <option key={h.key} value={h.key}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Measure */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Measure:</span>
                  <select
                    value={rollupMeasure}
                    onChange={(e) => setRollupMeasure(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-indigo-300" : "bg-white border-slate-300 text-indigo-700"
                    }`}
                  >
                    {MEASURES.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aggregation */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Agg:</span>
                  <select
                    value={rollupAgg}
                    onChange={(e) => setRollupAgg(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-emerald-300" : "bg-white border-slate-300 text-emerald-700"
                    }`}
                  >
                    {AGG_FUNCS.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recharts Bar/Line Chart */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold">
                Aggregated Distribution ({rollupLevel} ➔ {rollupMeasure})
              </span>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rollupData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="label" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        borderColor: chartColors.tooltipBorder,
                        color: isDark ? "#fff" : "#000",
                        fontSize: 12,
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="metric_value" name={rollupMeasure} fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Aggregated Data Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className={`border-b text-[11px] ${isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                  <tr>
                    <th className="py-2.5 px-4 font-bold">{rollupLevel}</th>
                    <th className="py-2.5 px-4 font-bold">Volume (Flights)</th>
                    <th className="py-2.5 px-4 font-bold">{rollupMeasure} ({rollupAgg})</th>
                    <th className="py-2.5 px-4 font-bold">Satisfaction Rate</th>
                    <th className="py-2.5 px-4 font-bold">Avg Dep Delay</th>
                    <th className="py-2.5 px-4 font-bold">Avg Ticket Price</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
                  {rollupData.map((row, idx) => (
                    <tr key={idx} className={isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}>
                      <td className="py-2.5 px-4 font-bold">{row.label}</td>
                      <td className="py-2.5 px-4 text-slate-400">{row.record_count?.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-cyan-400 font-bold">{row.metric_value}</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{row.satisfaction_rate}%</td>
                      <td className="py-2.5 px-4 text-amber-400">{row.avg_departure_delay} m</td>
                      <td className="py-2.5 px-4 text-emerald-400">${row.avg_ticket_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. DYNAMIC DRILL-DOWN */}
        {/* ========================================================================= */}
        {activeOp === "drilldown" && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-indigo-400" />
                  Dynamic Drill-Down Controls
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Select a primary dimension filter, and choose which sub-dimension to de-aggregate into.
                </p>
              </div>

              {/* Dynamic Controls */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {/* Primary Dimension */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Primary Dim:</span>
                  <select
                    value={drillPrimaryDim}
                    onChange={(e) => {
                      setDrillPrimaryDim(e.target.value);
                      const dObj = DIMENSIONS.find((d) => d.key === e.target.value);
                      if (dObj) setDrillPrimaryVal(dObj.values[0]);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    {DIMENSIONS.slice(0, 4).map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Value */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Value:</span>
                  <select
                    value={drillPrimaryVal}
                    onChange={(e) => setDrillPrimaryVal(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-cyan-300" : "bg-white border-slate-300 text-cyan-700"
                    }`}
                  >
                    {DIMENSIONS.find((d) => d.key === drillPrimaryDim)?.values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Dimension */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Expand Sub-Dim:</span>
                  <select
                    value={drillSubDim}
                    onChange={(e) => setDrillSubDim(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-indigo-300" : "bg-white border-slate-300 text-indigo-700"
                    }`}
                  >
                    {DIMENSIONS.slice(4).map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Drilldown Comparison Chart */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold">
                Granular Breakdown ({drillPrimaryVal} ➔ {drillSubDim})
              </span>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={drillData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="sub_dim_val" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        borderColor: chartColors.tooltipBorder,
                        color: isDark ? "#fff" : "#000",
                        fontSize: 12,
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="satisfaction_rate" name="Satisfaction Rate (%)" fill={chartColors.secondary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Granular Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {drillData.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-xs font-bold font-mono text-cyan-400 block mb-1">
                    {item.sub_dim_val}
                  </span>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xl font-bold font-mono">{item.satisfaction_rate}%</span>
                    <span className="text-[10px] text-slate-400">{item.passengers} pax</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-800/60">
                    <span>Wifi: {item.avg_wifi_rating}★</span>
                    <span>Ent: {item.avg_entertainment}★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DYNAMIC SLICE */}
        {/* ========================================================================= */}
        {activeOp === "slice" && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  Dynamic Slice: 2D Plane Cut
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Fix a single dimension to an exact value, then slice across any target X-axis dimension.
                </p>
              </div>

              {/* Dynamic Controls */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {/* Slice Dim */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Slice Dimension:</span>
                  <select
                    value={sliceDim}
                    onChange={(e) => {
                      setSliceDim(e.target.value);
                      const dObj = DIMENSIONS.find((d) => d.key === e.target.value);
                      if (dObj) setSliceVal(dObj.values[0]);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    {DIMENSIONS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slice Value */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Fix Value:</span>
                  <select
                    value={sliceVal}
                    onChange={(e) => setSliceVal(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-emerald-300 font-bold" : "bg-white border-slate-300 text-emerald-700 font-bold"
                    }`}
                  >
                    {DIMENSIONS.find((d) => d.key === sliceDim)?.values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target X Dimension */}
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>View Against (X):</span>
                  <select
                    value={sliceCrossDim}
                    onChange={(e) => setSliceCrossDim(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-cyan-300" : "bg-white border-slate-300 text-cyan-700"
                    }`}
                  >
                    {DIMENSIONS.filter((d) => d.key !== sliceDim).map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sliced Chart */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold">
                2D Sliced Plane: [{sliceDim} == "{sliceVal}"] ➔ Grouped by {sliceCrossDim}
              </span>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sliceData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="cross_dim_val" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        borderColor: chartColors.tooltipBorder,
                        color: isDark ? "#fff" : "#000",
                        fontSize: 12,
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="satisfaction_rate" name="Satisfaction Rate (%)" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DYNAMIC DICE */}
        {/* ========================================================================= */}
        {activeOp === "dice" && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <h4 className="text-sm font-bold flex items-center gap-2 mb-1">
                <Box className="w-4 h-4 text-purple-400" />
                Dynamic Dice: Multi-Dimensional Sub-Cube Filter Panel
              </h4>
              <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Configure 3 simultaneous dimension filters to extract an isolated sub-cube.
              </p>

              {/* 3 Simultaneous Filter Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                {/* Filter 1 */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-mono">
                    Filter 1: Class
                  </label>
                  <select
                    value={diceVal1}
                    onChange={(e) => setDiceVal1(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Business">Business</option>
                    <option value="Eco">Eco</option>
                    <option value="Eco Plus">Eco Plus</option>
                  </select>
                </div>

                {/* Filter 2 */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-mono">
                    Filter 2: Season
                  </label>
                  <select
                    value={diceVal2}
                    onChange={(e) => setDiceVal2(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Winter">Winter</option>
                    <option value="Summer">Summer</option>
                    <option value="Spring">Spring</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>

                {/* Filter 3: Metric Threshold Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Filter 3: Min Delay</span>
                    <span className="text-cyan-400 font-bold">≥ {diceThreshold} min</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={diceThreshold}
                    onChange={(e) => setDiceThreshold(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Diced Sub-Cube Scorecards */}
            {diceData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Sub-Cube Volume</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {diceData.passengers_matched?.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">Matched Records</span>
                </div>

                <div className={`p-5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Sub-Cube Satisfaction</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {diceData.satisfaction_rate_pct}%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">Satisfaction Rate</span>
                </div>

                <div className={`p-5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Avg Departure Delay</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {diceData.avg_departure_delay_min} m
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">Runway Wait Time</span>
                </div>

                <div className={`p-5 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Avg Airfare Paid</span>
                  <span className="text-2xl font-bold font-mono text-purple-400">
                    ${diceData.avg_ticket_price}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">Net Ticket Price</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. DYNAMIC PIVOT MATRIX */}
        {/* ========================================================================= */}
        {activeOp === "pivot" && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-amber-400" />
                  Dynamic Pivot Matrix & Cross-Tabulation
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Select any row dimension, column dimension, and metric to project heatmapped 2-way intersections.
                </p>
              </div>

              {/* Dynamic Pivot Controls */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Row:</span>
                  <select
                    value={pivotRow}
                    onChange={(e) => setPivotRow(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Origin_Airport_Code">Origin Airport</option>
                    <option value="Dest_Airport_Code">Dest Airport</option>
                    <option value="Season">Season</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Lead_Attendant_Seniority">Attendant Seniority</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Col:</span>
                  <select
                    value={pivotCol}
                    onChange={(e) => setPivotCol(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Class">Class</option>
                    <option value="Type_of_Travel">Type of Travel</option>
                    <option value="Customer_Type">Customer Loyalty</option>
                    <option value="Season">Season</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Metric:</span>
                  <select
                    value={pivotMetric}
                    onChange={(e) => setPivotMetric(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-bold text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-cyan-300" : "bg-white border-slate-300 text-cyan-700"
                    }`}
                  >
                    <option value="is_satisfied">Satisfaction Rate (%)</option>
                    <option value="Departure_Delay_in_Minutes">Avg Dep Delay (min)</option>
                    <option value="Ticket_Price">Avg Ticket Price ($)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Agg:</span>
                  <select
                    value={pivotAgg}
                    onChange={(e) => setPivotAgg(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border font-sans font-medium text-xs focus:outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-emerald-300" : "bg-white border-slate-300 text-emerald-700"
                    }`}
                  >
                    <option value="mean">Average</option>
                    <option value="sum">Sum</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix Heatmap Table */}
            {pivotData && (
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-center text-xs border-collapse">
                  <thead
                    className={`border-b font-mono text-[11px] ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <tr>
                      <th className="py-3 px-4 text-left font-bold text-cyan-400">
                        {pivotData.row_dimension} \ {pivotData.col_dimension}
                      </th>
                      {pivotData.columns.map((c) => (
                        <th key={c} className="py-3 px-4 font-bold uppercase">
                          {c}
                        </th>
                      ))}
                      <th className="py-3 px-4 font-bold text-slate-400">
                        Row Avg
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {pivotData.rows.map((rowName, rIdx) => {
                      const rowVals = pivotData.matrix[rIdx] || [];
                      const rowAvg =
                        rowVals.length > 0
                          ? Math.round(
                              (rowVals.reduce((a, b) => a + b, 0) / rowVals.length) * 10
                            ) / 10
                          : 0;

                      return (
                        <tr key={rowName} className={isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}>
                          <td className="py-3 px-4 text-left font-bold">{rowName}</td>
                          {rowVals.map((val, cIdx) => {
                            let cellBg = "bg-transparent";
                            let textColor = isDark ? "text-slate-200" : "text-slate-800";

                            if (pivotMetric === "is_satisfied") {
                              if (val >= 80) {
                                cellBg = isDark ? "bg-emerald-500/25" : "bg-emerald-100";
                                textColor = isDark ? "text-emerald-300 font-bold" : "text-emerald-800 font-bold";
                              } else if (val >= 50) {
                                cellBg = isDark ? "bg-cyan-500/20" : "bg-cyan-100";
                                textColor = isDark ? "text-cyan-300 font-semibold" : "text-cyan-800 font-semibold";
                              } else if (val >= 25) {
                                cellBg = isDark ? "bg-amber-500/15" : "bg-amber-100";
                                textColor = isDark ? "text-amber-300" : "text-amber-800";
                              } else {
                                cellBg = isDark ? "bg-rose-500/20" : "bg-rose-100";
                                textColor = isDark ? "text-rose-300" : "text-rose-800";
                              }
                            }

                            return (
                              <td key={cIdx} className={`py-3 px-4 transition-colors ${cellBg} ${textColor}`}>
                                {val}
                                {pivotMetric === "is_satisfied" && "%"}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 font-bold text-slate-400">
                            {rowAvg}
                            {pivotMetric === "is_satisfied" && "%"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
