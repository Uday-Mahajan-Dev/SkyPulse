import React from "react";
import {
  Database,
  Layers,
  BarChart3,
  Sparkles,
  Plane,
  RefreshCw,
  Cpu,
  Sun,
  Moon,
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  backendStatus,
  onRefreshHealth,
  onToggleMockMode,
  theme,
  onToggleTheme,
}) {
  const tabs = [
    {
      id: "schema",
      label: "Data Info & Warehouse Schema",
      sub: "Star Schema, Catalog & EDA Studio",
      icon: Database,
      badge: "Primary",
    },
    {
      id: "olap",
      label: "OLAP Analytics Studio",
      sub: "Dynamic Roll-up, Drill-down, Slice, Dice, Pivot",
      icon: Layers,
      badge: "Cubes",
    },
    {
      id: "model",
      label: "Model Performance & Drivers",
      sub: "Voting Ensemble & Feature Importances",
      icon: BarChart3,
      badge: "94.8% Acc",
    },
    {
      id: "inference",
      label: "Inference Engine",
      sub: "Simulator & Batch CSV Explainability",
      icon: Cpu,
      badge: "Real-time",
    },
  ];

  const isDark = theme === "dark";

  return (
    <header
      className={`w-full flex flex-col gap-6 pb-4 border-b transition-colors ${
        isDark
          ? "bg-slate-950/90 border-slate-800/80 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-5">
        {/* Top Bar: Brand, Status, Theme Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl border shadow-md transition-colors ${
                  isDark
                    ? "bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-sky-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : "bg-gradient-to-br from-cyan-100 via-indigo-50 to-sky-100 border-cyan-300 shadow-sm"
                }`}
              >
                <Plane
                  className={`w-6 h-6 -rotate-45 ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                <div
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 ${
                    isDark ? "border-slate-950" : "border-white"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl font-extrabold tracking-tight ${
                      isDark
                        ? "bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent"
                        : "text-slate-900"
                    }`}
                  >
                    SkyPulse
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide uppercase ${
                      isDark
                        ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                        : "bg-cyan-50 border border-cyan-200 text-cyan-700"
                    }`}
                  >
                    DWM Intelligence
                  </span>
                </div>
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Airline Data Warehouse & Mining Platform
                </p>
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-amber-300"
                    : "bg-slate-100 border-slate-300 text-slate-700"
                }`}
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Backend Status, Controls & Desktop Theme Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end w-full sm:w-auto">
            {/* Connection Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                backendStatus.isOnline && !backendStatus.isMockMode
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : isDark
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-amber-50 border-amber-300 text-amber-800"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.isOnline && !backendStatus.isMockMode
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                <div
                  className={`absolute w-3.5 h-3.5 rounded-full animate-ping opacity-60 ${
                    backendStatus.isOnline && !backendStatus.isMockMode
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
              </div>

              <div className="flex flex-col text-left">
                <span className="font-semibold leading-tight text-[11px]">
                  {backendStatus.isOnline && !backendStatus.isMockMode
                    ? "FastAPI Connected"
                    : "Mock Fallback Active"}
                </span>
                <span
                  className={`text-[9px] ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {backendStatus.isOnline && !backendStatus.isMockMode
                    ? `Live API (${backendStatus.latencyMs}ms)`
                    : "In-Memory Data Engine"}
                </span>
              </div>

              <button
                onClick={onRefreshHealth}
                title="Test FastAPI connection"
                className={`p-1 rounded transition-colors ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                    : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Switch Button */}
            <button
              onClick={onToggleMockMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                backendStatus.isMockMode
                  ? isDark
                    ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/30"
                    : "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                  : isDark
                  ? "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900"
              }`}
            >
              {backendStatus.isMockMode ? "Switch to Live API" : "Force Mock Mode"}
            </button>

            {/* Desktop Theme Toggle Switch */}
            <button
              onClick={onToggleTheme}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-850 border-slate-700 text-amber-300 hover:border-amber-400/50 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm"
              }`}
              title="Toggle Light / Dark mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-200">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-800">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar: standalone container with clean vertical separation */}
        <nav
          className={`w-full flex items-center justify-start border-b pb-3 overflow-x-auto ${
            isDark ? "border-slate-700/60" : "border-slate-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 p-1 rounded-xl border ${
              isDark
                ? "bg-slate-900/80 border-slate-800"
                : "bg-slate-100/80 border-slate-200"
            }`}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? isDark
                        ? "bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                        : "bg-cyan-50 text-cyan-800 border border-cyan-300 font-bold shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? isDark
                          ? "text-cyan-400"
                          : "text-cyan-600"
                        : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? isDark
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-cyan-200/60 text-cyan-900 font-bold"
                          : isDark
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>

                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${
                        isDark
                          ? "bg-gradient-to-r from-cyan-400 to-indigo-400"
                          : "bg-cyan-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
