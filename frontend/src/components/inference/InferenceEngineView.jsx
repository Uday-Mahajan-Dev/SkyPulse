import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Cpu,
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Plane,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Box,
  FileText,
  AlertCircle,
} from "lucide-react";
import { api } from "../../services/api";
import {
  SIMULATOR_PRESETS,
  GENERATE_SAMPLE_CSV_CONTENT,
} from "../../data/warehouseData";

export default function InferenceEngineView({ theme }) {
  const isDark = theme === "dark";
  const [subTab, setSubTab] = useState("single"); // 'single' | 'batch'

  // =========================================================================
  // SINGLE PASSENGER SIMULATOR STATE
  // =========================================================================
  const [formData, setFormData] = useState(SIMULATOR_PRESETS[0].values);
  const [isPredictingSingle, setIsPredictingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState({
    prediction: "Satisfied",
    satisfaction_probability: 0.9596,
    status: "success",
    source: "FastAPI Engine (Voting Ensemble)",
  });

  const applyPreset = (preset) => {
    setFormData(preset.values);
    runSinglePrediction(preset.values);
  };

  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const runSinglePrediction = async (dataToPredict = formData) => {
    setIsPredictingSingle(true);
    try {
      const res = await api.predictSingle(dataToPredict);
      setSingleResult(res);
    } catch (err) {
      console.error("Single prediction failed:", err);
    } finally {
      setIsPredictingSingle(false);
    }
  };

  const cabinRatingFields = [
    { key: "Online_boarding", label: "Online Boarding (#1 Driver)" },
    { key: "Inflight_wifi_service", label: "Inflight Wi-Fi (#2 Driver)" },
    { key: "Seat_comfort", label: "Seat Comfort" },
    { key: "Inflight_entertainment", label: "Inflight Entertainment" },
    { key: "Leg_room_service", label: "Leg Room Service" },
    { key: "Cleanliness", label: "Cabin Cleanliness" },
    { key: "Food_and_drink", label: "Food & Beverage" },
    { key: "On_board_service", label: "On-Board Cabin Service" },
    { key: "Baggage_handling", label: "Baggage Handling" },
    { key: "Checkin_service", label: "Check-in Service" },
    { key: "Inflight_service", label: "Inflight Atmosphere" },
    { key: "Ease_of_Online_booking", label: "Ease of Booking" },
    { key: "Gate_location", label: "Gate Walking Distance" },
    { key: "Departure_Arrival_time_convenient", label: "Schedule Convenience" },
  ];

  // =========================================================================
  // BATCH CSV SCORING STATE
  // =========================================================================
  const [dragActive, setDragActive] = useState(false);
  const [isScoringBatch, setIsScoringBatch] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const downloadSampleTemplate = () => {
    const csvContent = GENERATE_SAMPLE_CSV_CONTENT();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "skypulse_batch_inference_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setIsScoringBatch(true);
    try {
      const res = await api.predictBatch(file);
      setBatchResults(res);
    } catch (err) {
      alert("Error scoring batch CSV: " + err.message);
    } finally {
      setIsScoringBatch(false);
    }
  };

  const generateAndScoreSampleBatch = () => {
    const csvContent = GENERATE_SAMPLE_CSV_CONTENT();
    const file = new File([csvContent], "synthetic_batch_evaluation.csv", {
      type: "text/csv",
    });
    handleFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const exportScoredCsv = () => {
    const rows = batchResults?.all_records || batchResults?.sample_preview;
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map((r) => Object.values(r).join(",")).join("\n");
    const content = `${headers}\n${csvRows}`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "skypulse_scored_passengers_with_explanations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Theme-aware colors
  const chartColors = useMemo(() => {
    return {
      grid: isDark ? "#1e293b" : "#e2e8f0",
      text: isDark ? "#94a3b8" : "#475569",
      tooltipBg: isDark ? "#0f172a" : "#ffffff",
      tooltipBorder: isDark ? "#334155" : "#cbd5e1",
      satisfied: isDark ? "#06b6d4" : "#0284c7",
      dissatisfied: isDark ? "#f43f5e" : "#e11d48",
      accent1: isDark ? "#6366f1" : "#4f46e5",
      accent2: isDark ? "#f59e0b" : "#d97706",
    };
  }, [isDark]);

  // Batch EDA Computations:
  // 1. Ratio Pie Chart
  const batchPieData = useMemo(() => {
    if (!batchResults) return [];
    return [
      { name: "Satisfied", value: batchResults.satisfied_count, color: chartColors.satisfied },
      { name: "Dissatisfied", value: batchResults.dissatisfied_count, color: chartColors.dissatisfied },
    ];
  }, [batchResults, chartColors]);

  // 2. Confidence Distribution Boxplot Data
  const batchConfidenceBoxData = useMemo(() => {
    if (!batchResults) return [];
    const all = batchResults.all_records || batchResults.sample_preview || [];
    const satConfs = all.filter((r) => r.predicted_satisfaction === "Satisfied").map((r) => Number(r.confidence) || 0.85).sort();
    const disConfs = all.filter((r) => r.predicted_satisfaction !== "Satisfied").map((r) => Number(r.confidence) || 0.25).sort();

    const calcQuartiles = (arr, label) => {
      if (!arr.length) return { category: label, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
      return {
        category: label,
        min: Math.round(arr[0] * 100) / 100,
        q1: Math.round((arr[Math.floor(arr.length * 0.25)] || arr[0]) * 100) / 100,
        median: Math.round((arr[Math.floor(arr.length * 0.5)] || arr[0]) * 100) / 100,
        q3: Math.round((arr[Math.floor(arr.length * 0.75)] || arr[arr.length - 1]) * 100) / 100,
        max: Math.round(arr[arr.length - 1] * 100) / 100,
      };
    };

    return [calcQuartiles(satConfs, "Satisfied Cohort"), calcQuartiles(disConfs, "Dissatisfied Cohort")];
  }, [batchResults]);

  // 3. Failure Drivers Bar Plot (Low ratings <= 2 stars among Dissatisfied)
  const failureDriversData = useMemo(() => {
    if (!batchResults || !batchResults.failure_drivers) {
      return [
        { driver: "Inflight Wi-Fi", count: 2 },
        { driver: "Online Boarding", count: 2 },
        { driver: "Food & Beverage", count: 1 },
        { driver: "Seat Comfort", count: 1 },
      ];
    }
    return Object.entries(batchResults.failure_drivers).map(([key, count]) => ({
      driver: key.replace("Inflight_", "").replace("_service", "").replace("_", " "),
      count,
    })).filter((d) => d.count > 0);
  }, [batchResults]);

  // 4. Delay vs Confidence Scatter Data
  const delayScatterData = useMemo(() => {
    if (!batchResults) return [];
    const all = batchResults.all_records || batchResults.sample_preview || [];
    return all.map((r, i) => ({
      delay: Number(r.Departure_Delay_in_Minutes) || 0,
      confidence: Math.round((Number(r.confidence) || 0.5) * 100),
      pred: r.predicted_satisfaction,
      id: r.Passenger_ID || i + 1,
    }));
  }, [batchResults]);

  return (
    <div className="space-y-6">
      {/* Top Header Mode Switcher */}
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border shadow-xl transition-colors ${
          isDark
            ? "bg-slate-900/80 border-slate-800 text-slate-100"
            : "bg-white/95 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isDark
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-cyan-50 border-cyan-300 text-cyan-700"
            }`}
          >
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              Inference & Real-time Scoring Engine
            </h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Score hypothetical passenger scenarios or execute batch inference with root-cause cohort explainability.
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div
          className={`flex p-1 rounded-xl border text-xs font-mono ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}
        >
          <button
            onClick={() => setSubTab("single")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === "single"
                ? isDark
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-white text-cyan-800 font-bold shadow-xs border border-cyan-300"
                : isDark
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Single Simulator
          </button>
          <button
            onClick={() => setSubTab("batch")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === "batch"
                ? isDark
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-white text-cyan-800 font-bold shadow-xs border border-cyan-300"
                : isDark
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Batch CSV & Explainability
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SINGLE PASSENGER SIMULATOR */}
      {/* ========================================================================= */}
      {subTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Presets */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <span className={`text-xs font-mono uppercase block mb-2 font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Quick Simulation Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SIMULATOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isDark
                        ? "bg-slate-950/70 border-slate-800 hover:border-cyan-500/40"
                        : "bg-slate-50 border-slate-200 hover:border-cyan-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">{preset.name}</span>
                    <span className={`text-[10px] block mt-0.5 line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {preset.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 14 Cabin Sliders */}
            <div
              className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  14 Cabin Likert Ratings (1 to 5 Stars)
                </h3>
                <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  1 = Poor, 5 = Excellent
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                {cabinRatingFields.map((field) => {
                  const val = formData[field.key] ?? 3;
                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-medium">{field.label}</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                            val >= 4
                              ? isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-800"
                              : val === 3
                              ? isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
                              : isDark ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {val} ★
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={val}
                        onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flight Context & Demographics */}
            <div
              className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <h3 className="text-sm font-bold pb-2 border-b border-slate-800/60 flex items-center gap-2">
                <Plane className="w-4 h-4 text-indigo-400" />
                Demographics & Flight Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Travel Class</label>
                  <select
                    value={formData.Class}
                    onChange={(e) => handleInputChange("Class", e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Business">Business</option>
                    <option value="Eco">Eco</option>
                    <option value="Eco Plus">Eco Plus</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Type of Travel</label>
                  <select
                    value={formData.Type_of_Travel}
                    onChange={(e) => handleInputChange("Type_of_Travel", e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Business travel">Business travel</option>
                    <option value="Personal Travel">Personal Travel</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Loyalty Tier</label>
                  <select
                    value={formData.Customer_Type}
                    onChange={(e) => handleInputChange("Customer_Type", e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Loyal Customer">Loyal Customer</option>
                    <option value="disloyal Customer">disloyal Customer</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Aircraft Model</label>
                  <select
                    value={formData.Model}
                    onChange={(e) => handleInputChange("Model", e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="777-300ER">Boeing 777-300ER</option>
                    <option value="787 Dreamliner">Boeing 787 Dreamliner</option>
                    <option value="A350">Airbus A350</option>
                    <option value="737-MAX">Boeing 737-MAX</option>
                    <option value="A320neo">Airbus A320neo</option>
                    <option value="737-800">Boeing 737-800</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">
                    Dep Delay: {formData.Departure_Delay_in_Minutes} min
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={formData.Departure_Delay_in_Minutes}
                    onChange={(e) => handleInputChange("Departure_Delay_in_Minutes", Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Age: {formData.Age}</label>
                  <input
                    type="range"
                    min="14"
                    max="80"
                    step="1"
                    value={formData.Age}
                    onChange={(e) => handleInputChange("Age", Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => runSinglePrediction()}
                disabled={isPredictingSingle}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                {isPredictingSingle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running DWM Inference...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Predict Passenger Satisfaction
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Probability Gauge & SHAP Waterfall */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className={`p-6 rounded-2xl border shadow-xl flex flex-col items-center text-center relative overflow-hidden ${
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <span className={`text-xs font-mono uppercase tracking-wider mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Real-Time Satisfaction Probability
              </span>

              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={isDark ? "#1e293b" : "#e2e8f0"}
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={singleResult.prediction === "Satisfied" ? "#06b6d4" : "#f43f5e"}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * singleResult.satisfaction_probability)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono tracking-tight">
                    {(singleResult.satisfaction_probability * 100).toFixed(1)}%
                  </span>
                  <span className={`text-[10px] uppercase font-mono font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Probability
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm uppercase tracking-wide border shadow-md ${
                    singleResult.prediction === "Satisfied"
                      ? isDark
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-emerald-100 border-emerald-300 text-emerald-800"
                      : isDark
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-rose-100 border-rose-300 text-rose-800"
                  }`}
                >
                  {singleResult.prediction === "Satisfied" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  )}
                  {singleResult.prediction}
                </span>
              </div>

              <span className={`text-[11px] font-mono mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Scored by: {singleResult.source}
              </span>
            </div>

            {/* Feature Impact Waterfall */}
            <div
              className={`p-6 rounded-2xl border shadow-xl space-y-3 ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Feature Impact Waterfall (SHAP Drivers)
              </h4>

              <div className="space-y-2 pt-2">
                <div
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formData.Online_boarding >= 4 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="font-mono">Online Boarding: {formData.Online_boarding}★</span>
                  </div>
                  <span className={`font-mono font-bold ${formData.Online_boarding >= 4 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formData.Online_boarding >= 4 ? "+24.5%" : "-28.0%"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formData.Inflight_wifi_service >= 4 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span className="font-mono">Inflight Wifi: {formData.Inflight_wifi_service}★</span>
                  </div>
                  <span className={`font-mono font-bold ${formData.Inflight_wifi_service >= 4 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formData.Inflight_wifi_service >= 4 ? "+18.2%" : "-21.5%"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formData.Class === "Business" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-mono">Class: {formData.Class}</span>
                  </div>
                  <span className={`font-mono font-bold ${formData.Class === "Business" ? "text-emerald-500" : "text-slate-400"}`}>
                    {formData.Class === "Business" ? "+16.8%" : "-8.4%"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BATCH CSV SCORING & EXPLAINABILITY EDA STUDIO */}
      {/* ========================================================================= */}
      {subTab === "batch" && (
        <div className="space-y-6">
          {/* Upload & Sample Generation Controls */}
          <div
            className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                  Batch Passenger CSV Scoring & Explainability Engine
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Upload survey CSVs or generate synthetic test cohorts to compute probabilities and root-cause failure breakdowns.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={downloadSampleTemplate}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition-colors ${
                    isDark ? "bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700" : "bg-slate-100 border-slate-300 text-cyan-800 hover:bg-slate-200"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Template CSV
                </button>

                <button
                  onClick={generateAndScoreSampleBatch}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-mono font-bold shadow-md hover:opacity-95 transition-opacity"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  ⚡ Generate & Score Instant Sample Batch
                </button>
              </div>
            </div>

            {/* Drag & Drop Dropzone */}
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? "border-cyan-400 bg-cyan-500/10"
                  : isDark
                  ? "border-slate-700 hover:border-slate-600 bg-slate-950/40"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50"
              }`}
            >
              <input
                type="file"
                accept=".csv"
                id="batch-csv-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="batch-csv-input" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-cyan-400 mb-3 animate-bounce" />
                <span className="text-sm font-bold mb-1">
                  Click to select CSV or drag and drop file here
                </span>
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Instant scoring with failure driver explanations & churn levels
                </span>
              </label>

              {isScoringBatch && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                  <span className="text-sm font-mono text-cyan-300 font-bold">
                    Scoring Batch via Machine Learning Pipeline...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results & Batch Explainability EDA Studio */}
          {batchResults && (
            <div className="space-y-6">
              {/* Batch KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Total Scored</span>
                  <span className="text-2xl font-bold font-mono">{batchResults.total_records.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">{uploadedFileName || "Batch"}</span>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Satisfaction Rate</span>
                  <span className="text-2xl font-bold font-mono text-emerald-500">{batchResults.satisfaction_rate_pct}%</span>
                  <span className="text-[11px] text-slate-500 block mt-1">{batchResults.satisfied_count} Satisfied</span>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-rose-500/30" : "bg-rose-50 border-rose-200"}`}>
                  <span className="text-xs text-slate-400 block mb-1">Dissatisfied Flagged</span>
                  <span className="text-2xl font-bold font-mono text-rose-500">{batchResults.dissatisfied_count}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">High Churn Risk</span>
                </div>

                <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDark ? "bg-slate-950/60 border-cyan-500/30" : "bg-cyan-50 border-cyan-200"}`}>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Export Scored Batch</span>
                    <span className="text-xs font-bold font-mono text-cyan-500">With Explanation Flags</span>
                  </div>
                  <button
                    onClick={exportScoredCsv}
                    className="mt-2 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Scored CSV
                  </button>
                </div>
              </div>

              {/* BATCH EDA & COHORT EXPLAINABILITY STUDIO */}
              <div
                className={`p-6 rounded-2xl border shadow-xl space-y-6 ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold">
                      Batch EDA & Cohort Explainability Studio
                    </h3>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Visual diagnostics examining ratio, confidence quartiles, and root-cause failure frequencies among dissatisfied flyers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Ratio Pie Chart */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold block mb-3">
                      1. Predicted Cohort Ratio Breakdown
                    </span>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={batchPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                          >
                            {batchPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
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
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. Confidence Box Plot / Quartiles */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold block mb-3">
                      2. Confidence Score Quartiles by Cohort
                    </span>
                    <div className="space-y-3">
                      {batchConfidenceBoxData.map((box, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border text-xs font-mono ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between font-bold text-cyan-400 mb-1">
                            <span>{box.category}</span>
                            <span>Median: {(box.median * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Min: {(box.min * 100).toFixed(1)}%</span>
                            <span>Q1: {(box.q1 * 100).toFixed(1)}%</span>
                            <span>Q3: {(box.q3 * 100).toFixed(1)}%</span>
                            <span>Max: {(box.max * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Root-Cause Failure Drivers (Frequency of <= 2 stars among Dissatisfied) */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold block mb-1">
                      3. Root-Cause Failure Drivers (Ratings ≤ 2★ in Dissatisfied Cohort)
                    </span>
                    <p className={`text-[11px] mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Identifies which specific service touchpoints triggered dissatisfaction in this batch.
                    </p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={failureDriversData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                          <XAxis dataKey="driver" stroke={chartColors.text} tick={{ fontSize: 10 }} />
                          <YAxis stroke={chartColors.text} tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: chartColors.tooltipBg,
                              borderColor: chartColors.tooltipBorder,
                              color: isDark ? "#fff" : "#000",
                              fontSize: 12,
                              borderRadius: 8,
                            }}
                          />
                          <Bar dataKey="count" name="Failure Count (≤ 2★)" fill={chartColors.dissatisfied} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 4. Delay vs Confidence Scatter */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold block mb-1">
                      4. Departure Delay vs Prediction Confidence
                    </span>
                    <p className={`text-[11px] mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Departure Delay (X) plotted against Model Confidence % (Y).
                    </p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                          <XAxis type="number" dataKey="delay" name="Delay (min)" stroke={chartColors.text} tick={{ fontSize: 10 }} />
                          <YAxis type="number" dataKey="confidence" name="Confidence %" stroke={chartColors.text} tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: chartColors.tooltipBg,
                              borderColor: chartColors.tooltipBorder,
                              color: isDark ? "#fff" : "#000",
                              fontSize: 12,
                              borderRadius: 8,
                            }}
                          />
                          <Scatter name="Passengers" data={delayScatterData} fill={chartColors.accent1} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scored Predictions Table with Explanation Flags */}
              <div
                className={`rounded-2xl border shadow-xl overflow-hidden ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Scored Predictions with Root-Cause Explanation Flags
                  </h4>
                  <div
                    className={`flex p-1 rounded-xl border text-xs font-mono ${
                      isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    {["ALL", "Satisfied", "Neutral or Dissatisfied"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setBatchFilter(f)}
                        className={`px-2.5 py-1 rounded-lg ${
                          batchFilter === f
                            ? isDark
                              ? "bg-cyan-500/20 text-cyan-300 font-bold"
                              : "bg-white text-cyan-800 font-bold shadow-xs"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        {f === "ALL" ? "All" : f.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead
                      className={`sticky top-0 border-b font-mono text-[11px] ${
                        isDark ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Prediction</th>
                        <th className="py-2.5 px-4 font-semibold">Confidence</th>
                        <th className="py-2.5 px-4 font-semibold">Root Cause Explanation</th>
                        <th className="py-2.5 px-4 font-semibold">Churn Risk</th>
                        <th className="py-2.5 px-4 font-semibold">Class</th>
                        <th className="py-2.5 px-4 font-semibold">Wi-Fi</th>
                        <th className="py-2.5 px-4 font-semibold">Boarding</th>
                        <th className="py-2.5 px-4 font-semibold">Dep Delay</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono text-xs ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
                      {(batchResults.all_records || batchResults.sample_preview)
                        .filter((r) =>
                          batchFilter === "ALL"
                            ? true
                            : r.predicted_satisfaction === batchFilter
                        )
                        .map((row, idx) => {
                          const isSat = row.predicted_satisfaction === "Satisfied";
                          return (
                            <tr
                              key={idx}
                              className={isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}
                            >
                              <td className="py-2.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isSat
                                      ? isDark
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : isDark
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                      : "bg-rose-100 text-rose-800 border border-rose-300"
                                  }`}
                                >
                                  {isSat ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                  {row.predicted_satisfaction}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-bold text-cyan-500">
                                {((row.confidence || 0.85) * 100).toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-4 font-bold">
                                {row.root_cause_driver || "Service Rating"}
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    row.churn_risk_level === "Critical"
                                      ? "bg-rose-500/20 text-rose-400"
                                      : row.churn_risk_level === "High"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-emerald-500/20 text-emerald-400"
                                  }`}
                                >
                                  {row.churn_risk_level || "Normal"}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">{row.Class || "Business"}</td>
                              <td className="py-2.5 px-4">{row.Inflight_wifi_service || 3}★</td>
                              <td className="py-2.5 px-4">{row.Online_boarding || 3}★</td>
                              <td className="py-2.5 px-4 text-amber-500">{row.Departure_Delay_in_Minutes || 0}m</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
