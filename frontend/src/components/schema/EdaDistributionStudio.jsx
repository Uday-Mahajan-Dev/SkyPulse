import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Box,
  Flame,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { api } from "../../services/api";

const NUMERICAL_FEATURES = [
  { key: "Online_boarding", label: "Online Boarding Rating (1-5★)" },
  { key: "Inflight_wifi_service", label: "Inflight Wi-Fi Rating (1-5★)" },
  { key: "Seat_comfort", label: "Seat Comfort Rating (1-5★)" },
  { key: "Inflight_entertainment", label: "Inflight Entertainment (1-5★)" },
  { key: "Leg_room_service", label: "Leg Room Service (1-5★)" },
  { key: "Cleanliness", label: "Cleanliness (1-5★)" },
  { key: "Departure_Delay_in_Minutes", label: "Departure Delay (Minutes)" },
  { key: "Arrival_Delay_in_Minutes", label: "Arrival Delay (Minutes)" },
  { key: "Flight_Distance", label: "Flight Distance (Miles)" },
  { key: "Ticket_Price", label: "Ticket Price ($ USD)" },
  { key: "Age", label: "Passenger Age (Years)" },
];

const CATEGORICAL_FEATURES = [
  { key: "satisfaction", label: "Target (satisfaction)" },
  { key: "Class", label: "Travel Class (Business / Eco / Eco Plus)" },
  { key: "Customer_Type", label: "Customer Loyalty Tier" },
  { key: "Type_of_Travel", label: "Travel Purpose (Business / Personal)" },
  { key: "Gender", label: "Gender (Male / Female)" },
  { key: "Season", label: "Season (Winter / Summer / Spring / Fall)" },
  { key: "Flight_Type", label: "Flight Type (Domestic / International)" },
];

const palette = ["#06b6d4", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6"];

// Dynamic grouping based on state: selectedFeature (e.g. 'Online_boarding') and selectedStratifier (e.g. 'Class')
const generateChartData = (records, featureKey, stratifierKey) => {
  if (!records || records.length === 0) return { data: [], seriesKeys: [] };

  // 1. Get unique stratifier groups dynamically
  const uniqueGroups = Array.from(
    new Set(records.map((r) => r[stratifierKey]).filter(Boolean))
  );

  // Maintain canonical categorical order when available
  const orderMap = {
    satisfaction: ["satisfied", "neutral or dissatisfied"],
    Class: ["Business", "Eco", "Eco Plus"],
    Customer_Type: ["Loyal Customer", "disloyal Customer"],
    Type_of_Travel: ["Business travel", "Personal Travel"],
    Gender: ["Male", "Female"],
    Season: ["Winter", "Spring", "Summer", "Fall"],
    Flight_Type: ["Domestic", "International"],
  };
  if (orderMap[stratifierKey]) {
    uniqueGroups.sort((a, b) => {
      const idxA = orderMap[stratifierKey].indexOf(a);
      const idxB = orderMap[stratifierKey].indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return String(a).localeCompare(String(b));
    });
  }

  // 2. Identify if feature is discrete (e.g. ratings 1 to 5) or continuous
  const isLikert = [
    "Inflight_wifi_service",
    "Online_boarding",
    "Seat_comfort",
    "Inflight_entertainment",
    "Food_and_drink",
    "Cleanliness",
    "Leg_room_service",
    "On-board_service",
    "On_board_service",
    "Baggage_handling",
    "Checkin_service",
    "Inflight_service",
    "Gate_location",
    "Ease_of_Online_booking",
    "Departure_Arrival_time_convenient",
  ].includes(featureKey);

  if (isLikert) {
    const bins = [1, 2, 3, 4, 5];
    const data = bins.map((binVal) => {
      const row = { bin: `${binVal}★` };
      uniqueGroups.forEach((group) => {
        row[group] = records.filter(
          (r) =>
            Number(r[featureKey]) === binVal &&
            String(r[stratifierKey]) === String(group)
        ).length;
      });
      return row;
    });
    return { data, seriesKeys: uniqueGroups };
  } else {
    // Continuous binning (e.g., Ticket_Price, Delays, Flight_Distance, Age)
    const numVals = records
      .map((r) => Number(r[featureKey]))
      .filter((v) => !isNaN(v) && v !== null);

    if (numVals.length === 0) {
      return { data: [], seriesKeys: uniqueGroups };
    }

    const min = Math.min(...numVals);
    const max = Math.max(...numVals);
    const binCount = 5;
    const step = (max - min) / binCount || 1;

    const data = [];
    for (let i = 0; i < binCount; i++) {
      const bMin = Math.round(min + i * step);
      const bMax = Math.round(min + (i + 1) * step);
      const label = `${bMin}-${bMax}`;
      const lower = min + i * step;
      const upper = i === binCount - 1 ? max + 0.0001 : min + (i + 1) * step;

      const row = { bin: label };
      uniqueGroups.forEach((group) => {
        row[group] = records.filter((r) => {
          const val = Number(r[featureKey]);
          const inBin = val >= lower && val < upper;
          return inBin && String(r[stratifierKey]) === String(group);
        }).length;
      });
      data.push(row);
    }
    return { data, seriesKeys: uniqueGroups };
  }
};

export default function EdaDistributionStudio({ theme }) {
  const isDark = theme === "dark";

  const [activePlotTab, setActivePlotTab] = useState("histogram"); // 'histogram' | 'scatter' | 'boxplot' | 'bar' | 'pie' | 'heatmap'
  const [primaryFeature, setPrimaryFeature] = useState("Online_boarding");
  const [secondaryFeature, setSecondaryFeature] = useState("satisfaction");
  const [dataset, setDataset] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load analytics sample data & correlations
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [sampleRows, corrData] = await Promise.all([
          api.getAnalyticsSample(500),
          api.getCorrelations(),
        ]);
        if (isMounted) {
          setDataset(sampleRows || []);
          setCorrelations(corrData || null);
        }
      } catch (err) {
        console.error("EDA Data load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Theme-aware palette colors
  const chartColors = useMemo(() => {
    return {
      grid: isDark ? "#1e293b" : "#e2e8f0",
      text: isDark ? "#94a3b8" : "#475569",
      tooltipBg: isDark ? "#0f172a" : "#ffffff",
      tooltipBorder: isDark ? "#334155" : "#cbd5e1",
      satisfied: isDark ? "#06b6d4" : "#0284c7",
      dissatisfied: isDark ? "#f43f5e" : "#e11d48",
      accent1: isDark ? "#6366f1" : "#4f46e5",
      accent2: isDark ? "#10b981" : "#059669",
      accent3: isDark ? "#f59e0b" : "#d97706",
      piePalette: isDark
        ? ["#06b6d4", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]
        : ["#0284c7", "#4f46e5", "#059669", "#d97706", "#db2777", "#7c3aed"],
    };
  }, [isDark]);

  // Selected stratifier display label
  const selectedStratifierLabel = useMemo(() => {
    const found = CATEGORICAL_FEATURES.find((c) => c.key === secondaryFeature);
    return found ? found.label : secondaryFeature;
  }, [secondaryFeature]);

  // 1. Dynamic Chart Data computation (Bins numerical feature stratified by selected stratifier)
  const chartResult = useMemo(() => {
    return generateChartData(dataset, primaryFeature, secondaryFeature);
  }, [dataset, primaryFeature, secondaryFeature]);

  // 2. Scatter Plot Data (2 numerical features stratified and colored by selected stratifier)
  const scatterData = useMemo(() => {
    if (!dataset.length) return { series: {}, seriesKeys: [], yKey: "" };
    const xKey = primaryFeature;
    const yKey =
      primaryFeature === "Departure_Delay_in_Minutes"
        ? "Arrival_Delay_in_Minutes"
        : primaryFeature === "Flight_Distance"
        ? "Ticket_Price"
        : "Ticket_Price";

    const uniqueGroups = Array.from(
      new Set(dataset.map((r) => r[secondaryFeature]).filter(Boolean))
    );

    const series = {};
    uniqueGroups.forEach((g) => {
      series[g] = [];
    });

    dataset.slice(0, 150).forEach((d) => {
      const g = d[secondaryFeature];
      if (g && series[g]) {
        series[g].push({
          x: Number(d[xKey]) || 0,
          y: Number(d[yKey]) || 0,
          label: d.Passenger_ID || "Passenger",
          group: g,
        });
      }
    });

    return { series, seriesKeys: uniqueGroups, yKey };
  }, [dataset, primaryFeature, secondaryFeature]);

  // 3. Box Plot / Quartiles Data (Stratified dynamically by selected stratifier)
  const boxPlotData = useMemo(() => {
    if (!dataset.length) return [];
    const groupKey = secondaryFeature;
    const groups = {};

    dataset.forEach((d) => {
      const g = d[groupKey] || "Other";
      if (!groups[g]) groups[g] = [];
      const val = Number(d[primaryFeature]);
      if (!isNaN(val)) groups[g].push(val);
    });

    return Object.keys(groups).map((g, idx) => {
      const sorted = groups[g].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)] || 0;
      const median = sorted[Math.floor(sorted.length * 0.5)] || 0;
      const q3 = sorted[Math.floor(sorted.length * 0.75)] || 0;
      const min = sorted[0] || 0;
      const max = sorted[sorted.length - 1] || 0;
      return {
        category: g,
        min,
        q1,
        median,
        q3,
        max,
        iqr: Math.round((q3 - q1) * 10) / 10,
        count: sorted.length,
        color: palette[idx % palette.length],
      };
    });
  }, [dataset, primaryFeature, secondaryFeature]);

  // 4. Bar Plot / Mean Measure Analysis (Stratified dynamically by selected stratifier)
  const barMeansData = useMemo(() => {
    if (!dataset.length) return [];
    const groupKey = secondaryFeature;
    const sums = {};
    const counts = {};

    dataset.forEach((d) => {
      const g = String(d[groupKey] || "Unknown");
      const val = Number(d[primaryFeature]);
      if (!isNaN(val)) {
        sums[g] = (sums[g] || 0) + val;
        counts[g] = (counts[g] || 0) + 1;
      }
    });

    return Object.keys(sums).map((g, idx) => ({
      category: g,
      meanValue: Math.round((sums[g] / (counts[g] || 1)) * 100) / 100,
      count: counts[g],
      fillColor: palette[idx % palette.length],
    }));
  }, [dataset, primaryFeature, secondaryFeature]);

  // 5. Pie / Donut Chart Data (Composition by selected stratifier)
  const pieData = useMemo(() => {
    if (!dataset.length) return [];
    const groupKey = secondaryFeature;
    const counts = {};

    dataset.forEach((d) => {
      const g = String(d[groupKey] || "Other");
      counts[g] = (counts[g] || 0) + 1;
    });

    return Object.keys(counts).map((g) => ({
      name: g,
      value: counts[g],
      percentage: Math.round((counts[g] / dataset.length) * 1000) / 10,
    }));
  }, [dataset, secondaryFeature]);

  const plots = [
    { id: "histogram", label: "Histogram & KDE Distribution", icon: BarChart3 },
    { id: "scatter", label: "2D Feature Scatter Plot", icon: ScatterIcon },
    { id: "boxplot", label: "Quartile Box-Plot (IQR)", icon: Box },
    { id: "bar", label: "Categorical Mean Analysis", icon: TrendingUp },
    { id: "pie", label: "Composition Donut Share", icon: PieIcon },
    { id: "heatmap", label: "Multicollinearity Heatmap", icon: Flame },
  ];

  return (
    <div
      className={`rounded-2xl border shadow-xl p-5 sm:p-6 transition-colors mt-6 ${
        isDark
          ? "bg-slate-900/80 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-800"
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg border ${
                isDark
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold">
              Exploratory Data Analysis (EDA) & Distribution Studio
            </h3>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Interactively explore skewness, variance, bivariate correlations, and target stratification across 10k warehouse survey records.
          </p>
        </div>

        {/* Feature Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Primary Feature */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              Feature:
            </span>
            <select
              value={primaryFeature}
              onChange={(e) => setPrimaryFeature(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl border font-sans font-medium text-xs focus:outline-none ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-cyan-300"
                  : "bg-slate-50 border-slate-300 text-cyan-700"
              }`}
            >
              {NUMERICAL_FEATURES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Stratifier */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              Stratifier:
            </span>
            <select
              value={secondaryFeature}
              onChange={(e) => setSecondaryFeature(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl border font-sans font-medium text-xs focus:outline-none ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-indigo-300"
                  : "bg-slate-50 border-slate-300 text-indigo-700"
              }`}
            >
              {CATEGORICAL_FEATURES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plot View Tabs */}
      <div className="flex space-x-1.5 py-3 border-b border-slate-800/60 overflow-x-auto">
        {plots.map((plot) => {
          const Icon = plot.icon;
          const isActive = activePlotTab === plot.id;
          return (
            <button
              key={plot.id}
              onClick={() => setActivePlotTab(plot.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? isDark
                    ? "bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {plot.label}
            </button>
          );
        })}
      </div>

      {/* Active Plot Rendering Area */}
      <div className="pt-6 min-h-[380px]">
        {/* ========================================================================= */}
        {/* 1. HISTOGRAM / KDE DISTRIBUTION */}
        {/* ========================================================================= */}
        {activePlotTab === "histogram" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-mono font-semibold">
                Binned Frequency Spread:{" "}
                <span className="text-cyan-400">{primaryFeature}</span> (Stratified by{" "}
                <span className="text-indigo-400">{selectedStratifierLabel}</span>)
              </span>
              <div className="flex items-center gap-3 font-mono flex-wrap">
                {chartResult.seriesKeys.map((groupKey, idx) => (
                  <span key={groupKey} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-sm inline-block"
                      style={{ backgroundColor: palette[idx % palette.length] }}
                    />
                    {groupKey}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartResult.data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis dataKey="bin" stroke={chartColors.text} tick={{ fontSize: 11 }} />
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
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {chartResult.seriesKeys.map((groupKey, index) => (
                    <Bar
                      key={groupKey}
                      dataKey={groupKey}
                      fill={palette[index % palette.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SCATTER PLOT */}
        {/* ========================================================================= */}
        {activePlotTab === "scatter" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-mono font-semibold">
                Bivariate Relationship: <span className="text-cyan-400">{primaryFeature}</span> (X) vs{" "}
                <span className="text-indigo-400">{scatterData.yKey}</span> (Y) (Stratified by{" "}
                <span className="text-indigo-400">{selectedStratifierLabel}</span>)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Sampled Flights</span>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={primaryFeature}
                    stroke={chartColors.text}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={scatterData.yKey}
                    stroke={chartColors.text}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorder,
                      color: isDark ? "#fff" : "#000",
                      fontSize: 12,
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {scatterData.seriesKeys.map((groupKey, index) => {
                    const shapes = ["circle", "triangle", "square", "diamond", "cross", "star"];
                    return (
                      <Scatter
                        key={groupKey}
                        name={String(groupKey)}
                        data={scatterData.series[groupKey]}
                        fill={palette[index % palette.length]}
                        shape={shapes[index % shapes.length]}
                      />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. BOX PLOT / QUARTILE DISTRIBUTION */}
        {/* ========================================================================= */}
        {activePlotTab === "boxplot" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <span className="font-semibold">
                Interquartile Dispersion (Min, Q1, Median, Q3, Max) of{" "}
                <span className="text-cyan-400">{primaryFeature}</span> across{" "}
                <span className="text-indigo-400">{selectedStratifierLabel}</span>
              </span>
              <span className="text-slate-400 text-[11px]">Tukey Quartile Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {boxPlotData.map((box, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                  style={{ borderLeftColor: box.color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-bold text-sm font-mono"
                      style={{ color: box.color }}
                    >
                      {box.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      N = {box.count}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maximum:</span>
                      <span className="font-bold">{box.max}</span>
                    </div>
                    <div className="flex justify-between text-indigo-400">
                      <span>75th Percentile (Q3):</span>
                      <span className="font-bold">{box.q3}</span>
                    </div>
                    <div className="flex justify-between font-bold text-cyan-300 py-1 border-y border-slate-800">
                      <span>Median (Q2):</span>
                      <span>{box.median}</span>
                    </div>
                    <div className="flex justify-between text-purple-400">
                      <span>25th Percentile (Q1):</span>
                      <span className="font-bold">{box.q1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Minimum:</span>
                      <span className="font-bold">{box.min}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>IQR Spread:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {box.iqr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CATEGORICAL MEAN ANALYSIS */}
        {/* ========================================================================= */}
        {activePlotTab === "bar" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold">
                Mean Value of <span className="text-cyan-400">{primaryFeature}</span> Stratified by{" "}
                <span className="text-indigo-400">{selectedStratifierLabel}</span>
              </span>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barMeansData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
                  <XAxis dataKey="category" stroke={chartColors.text} tick={{ fontSize: 11 }} />
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
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="meanValue" name="Mean Score" radius={[6, 6, 0, 0]}>
                    {barMeansData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. COMPOSITION DONUT SHARE */}
        {/* ========================================================================= */}
        {activePlotTab === "pie" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold">
                Percentage Distribution of{" "}
                <span className="text-indigo-400">{selectedStratifierLabel}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors.piePalette[index % chartColors.piePalette.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        borderColor: chartColors.tooltipBorder,
                        color: isDark ? "#fff" : "#000",
                        fontSize: 12,
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="md:col-span-5 space-y-2">
                {pieData.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono ${
                      isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors.piePalette[idx % chartColors.piePalette.length],
                        }}
                      />
                      <span className="font-semibold">{entry.name}</span>
                    </div>
                    <span className="font-bold text-cyan-400">
                      {entry.percentage}% ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. CORRELATION HEATMAP MATRIX */}
        {/* ========================================================================= */}
        {activePlotTab === "heatmap" && correlations && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold">
                Pearson Multicollinearity Correlation Matrix (r ∈ [-1.0, 1.0])
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                10 Quantitative Warehouse Features
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr
                    className={`border-b text-[10px] font-mono ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <th className="p-2 text-left font-bold">Feature</th>
                    {correlations.columns.map((c) => (
                      <th key={c} className="p-2 font-bold whitespace-nowrap">
                        {c.replace("Inflight_", "").replace("_in_Minutes", "").slice(0, 8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {correlations.columns.map((rName, rIdx) => (
                    <tr key={rName}>
                      <td
                        className={`p-2 text-left font-bold whitespace-nowrap ${
                          isDark ? "bg-slate-950/80 text-slate-300" : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        {rName.replace("Inflight_", "").replace("_in_Minutes", "")}
                      </td>
                      {correlations.matrix[rIdx].map((val, cIdx) => {
                        // Cell color intensity
                        let cellBg = isDark ? "bg-slate-900" : "bg-white";
                        let textColor = isDark ? "text-slate-400" : "text-slate-600";

                        if (val >= 0.6) {
                          cellBg = isDark ? "bg-cyan-500/30 font-bold" : "bg-cyan-100 font-bold";
                          textColor = isDark ? "text-cyan-200" : "text-cyan-800";
                        } else if (val >= 0.3) {
                          cellBg = isDark ? "bg-indigo-500/20" : "bg-indigo-50";
                          textColor = isDark ? "text-indigo-300" : "text-indigo-700";
                        } else if (val < -0.05) {
                          cellBg = isDark ? "bg-rose-500/20" : "bg-rose-50";
                          textColor = isDark ? "text-rose-400" : "text-rose-700";
                        }

                        return (
                          <td key={cIdx} className={`p-2 ${cellBg} ${textColor}`}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
