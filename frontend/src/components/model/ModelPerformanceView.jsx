import React, { useState } from "react";
import {
  BarChart3,
  Target,
  Sparkles,
  Info,
} from "lucide-react";
import { MODEL_EVALUATION } from "../../data/warehouseData";

export default function ModelPerformanceView({ theme }) {
  const isDark = theme === "dark";
  const [selectedFeature, setSelectedFeature] = useState(
    MODEL_EVALUATION.topFeatures[0]
  );
  const [featureCategory, setFeatureCategory] = useState("ALL");
  const [matrixViewMode, setMatrixViewMode] = useState("counts");

  const cm = MODEL_EVALUATION.confusionMatrix;
  const total = cm.tn + cm.tp + cm.fp + cm.fn;

  const filteredFeatures =
    featureCategory === "ALL"
      ? MODEL_EVALUATION.topFeatures
      : MODEL_EVALUATION.topFeatures.filter(
          (f) => f.category === featureCategory
        );

  const categories = [
    "ALL",
    "Digital UX",
    "Cabin Connectivity",
    "Cabin Hardware",
    "Travel Context",
    "Financial/Commercial",
    "Airport Operations",
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Ensemble Overview */}
      <div
        className={`rounded-2xl border p-6 shadow-xl transition-colors ${
          isDark
            ? "bg-slate-900/80 border-slate-800 text-slate-100"
            : "bg-white/95 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-lg border ${
                  isDark
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                    : "bg-cyan-50 text-cyan-700 border-cyan-200"
                }`}
              >
                <Target className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">
                DWM Model Performance & Feature Drivers
              </h2>
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Supervised Data Mining Evaluation — Soft-Voting Ensemble (XGBoost, LightGBM, CatBoost & Logistic Regression).
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
              isDark
                ? "bg-slate-950 border-slate-800 text-cyan-300"
                : "bg-slate-100 border-slate-200 text-cyan-800 font-bold"
            }`}
          >
            <span>Holdout Test Set: 2,000 Verified Records</span>
          </div>
        </div>

        {/* Metric Chips / KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Accuracy */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden group ${
              isDark
                ? "bg-slate-950/60 border-cyan-500/30 text-white"
                : "bg-slate-50 border-cyan-200 text-slate-900"
            }`}
          >
            <span
              className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Ensemble Accuracy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-cyan-500">
                {MODEL_EVALUATION.accuracyPct}%
              </span>
            </div>
            <span
              className={`text-[11px] mt-1 block ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              1,865 / 2,000 Correct Classifications
            </span>
          </div>

          {/* ROC-AUC */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden group ${
              isDark
                ? "bg-slate-950/60 border-indigo-500/30 text-white"
                : "bg-slate-50 border-indigo-200 text-slate-900"
            }`}
          >
            <span
              className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              ROC-AUC Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-indigo-500">
                {MODEL_EVALUATION.rocAuc}
              </span>
            </div>
            <span
              className={`text-[11px] mt-1 block ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Area Under Receiver Operator Curve
            </span>
          </div>

          {/* Precision */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden group ${
              isDark
                ? "bg-slate-950/60 border-emerald-500/30 text-white"
                : "bg-slate-50 border-emerald-200 text-slate-900"
            }`}
          >
            <span
              className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Macro Precision
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-500">
                {MODEL_EVALUATION.precisionPct}%
              </span>
            </div>
            <span
              className={`text-[11px] mt-1 block ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Minimizes Type I (False Alarm) Errors
            </span>
          </div>

          {/* Recall */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden group ${
              isDark
                ? "bg-slate-950/60 border-purple-500/30 text-white"
                : "bg-slate-50 border-purple-200 text-slate-900"
            }`}
          >
            <span
              className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Macro Recall
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-purple-500">
                {MODEL_EVALUATION.recallPct}%
              </span>
            </div>
            <span
              className={`text-[11px] mt-1 block ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              F1-Score: {MODEL_EVALUATION.f1ScorePct}% Harmonic Mean
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Confusion Matrix + Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CONFUSION MATRIX */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-slate-900/60 border-slate-800 text-slate-100"
              : "bg-white/95 border-slate-200 text-slate-800"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Confusion Matrix
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Actual Ground Truth vs Model Predictions
                </p>
              </div>

              {/* View Toggle */}
              <div
                className={`flex p-1 rounded-lg border text-[11px] font-mono ${
                  isDark
                    ? "bg-slate-950 border-slate-800"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                <button
                  onClick={() => setMatrixViewMode("counts")}
                  className={`px-2 py-0.5 rounded ${
                    matrixViewMode === "counts"
                      ? isDark
                        ? "bg-cyan-500/20 text-cyan-300 font-bold"
                        : "bg-white text-cyan-800 font-bold shadow-xs"
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Raw Count
                </button>
                <button
                  onClick={() => setMatrixViewMode("percentages")}
                  className={`px-2 py-0.5 rounded ${
                    matrixViewMode === "percentages"
                      ? isDark
                        ? "bg-cyan-500/20 text-cyan-300 font-bold"
                        : "bg-white text-cyan-800 font-bold shadow-xs"
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Pct %
                </button>
              </div>
            </div>

            {/* Matrix 2x2 Grid */}
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-3 mb-2 text-center text-xs font-mono">
                <div
                  className={`font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Pred: Dissatisfied
                </div>
                <div
                  className={`font-semibold ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  Pred: Satisfied
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div
                  className={`p-4 rounded-xl border text-center ${
                    isDark
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                >
                  <span className="text-[10px] font-mono block uppercase font-bold">
                    True Negative (TN)
                  </span>
                  <span className="text-2xl font-extrabold font-mono block my-1">
                    {matrixViewMode === "counts"
                      ? cm.tn.toLocaleString()
                      : `${Math.round((cm.tn / total) * 1000) / 10}%`}
                  </span>
                  <span className="text-[10px]">Correctly Dissatisfied</span>
                </div>

                <div
                  className={`p-4 rounded-xl border text-center ${
                    isDark
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <span className="text-[10px] font-mono block uppercase font-bold">
                    False Positive (FP)
                  </span>
                  <span className="text-2xl font-extrabold font-mono block my-1">
                    {matrixViewMode === "counts"
                      ? cm.fp.toLocaleString()
                      : `${Math.round((cm.fp / total) * 1000) / 10}%`}
                  </span>
                  <span className="text-[10px]">Type I Error (False Alarm)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-xl border text-center ${
                    isDark
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <span className="text-[10px] font-mono block uppercase font-bold">
                    False Negative (FN)
                  </span>
                  <span className="text-2xl font-extrabold font-mono block my-1">
                    {matrixViewMode === "counts"
                      ? cm.fn.toLocaleString()
                      : `${Math.round((cm.fn / total) * 1000) / 10}%`}
                  </span>
                  <span className="text-[10px]">Type II Error (Missed Churn)</span>
                </div>

                <div
                  className={`p-4 rounded-xl border text-center ${
                    isDark
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                      : "bg-cyan-50 border-cyan-200 text-cyan-800"
                  }`}
                >
                  <span className="text-[10px] font-mono block uppercase font-bold">
                    True Positive (TP)
                  </span>
                  <span className="text-2xl font-extrabold font-mono block my-1">
                    {matrixViewMode === "counts"
                      ? cm.tp.toLocaleString()
                      : `${Math.round((cm.tp / total) * 1000) / 10}%`}
                  </span>
                  <span className="text-[10px]">Correctly Satisfied</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 p-3.5 rounded-xl border text-xs space-y-2 ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold font-mono">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Evaluation Matrix Analysis:
            </div>
            <p>
              With only <strong>48 False Positives</strong> out of 2,000 evaluations (2.4%), the model provides high confidence for retention offers without false-alarm waste.
            </p>
          </div>
        </div>

        {/* TOP 15 FEATURE DRIVERS */}
        <div
          className={`lg:col-span-7 rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-slate-900/60 border-slate-800 text-slate-100"
              : "bg-white/95 border-slate-200 text-slate-800"
          }`}
        >
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Top 15 Feature Importances & Drivers
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Tree estimator Gini weights & SHAP contribution rankings.
                </p>
              </div>

              <div>
                <select
                  value={featureCategory}
                  onChange={(e) => setFeatureCategory(e.target.value)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-slate-300"
                      : "bg-slate-50 border-slate-300 text-slate-800"
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "ALL" ? "All Categories (Top 15)" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-2">
              {filteredFeatures.map((item) => {
                const isSelected = selectedFeature?.feature === item.feature;
                const widthPct = (item.importance / 0.115) * 100;

                return (
                  <div
                    key={item.feature}
                    onClick={() => setSelectedFeature(item)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "bg-slate-800/90 border-cyan-500/60 shadow-sm ring-1 ring-cyan-500/40"
                          : "bg-cyan-50 border-cyan-300 shadow-sm ring-1 ring-cyan-400"
                        : isDark
                        ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isDark
                              ? "bg-slate-800 text-slate-400"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          #{item.rank}
                        </span>
                        <span className="font-mono font-bold">{item.feature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="font-mono font-extrabold text-cyan-500 text-xs">
                          {item.importance.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${
                        isDark ? "bg-slate-800/80" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedFeature && (
            <div
              className={`mt-4 p-4 rounded-xl border text-xs ${
                isDark
                  ? "bg-slate-950/90 border-cyan-500/30 text-slate-300"
                  : "bg-cyan-50/70 border-cyan-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-cyan-500 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4" />
                  #{selectedFeature.rank} — {selectedFeature.feature}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-bold">
                  Weight: {selectedFeature.importance}
                </span>
              </div>
              <p className="leading-relaxed">{selectedFeature.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
