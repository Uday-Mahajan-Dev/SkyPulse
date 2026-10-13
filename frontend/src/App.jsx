import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WarehouseSchemaView from "./components/schema/WarehouseSchemaView";
import OlapStudio from "./components/olap/OlapStudio";
import ModelPerformanceView from "./components/model/ModelPerformanceView";
import InferenceEngineView from "./components/inference/InferenceEngineView";
import { api } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("schema"); // 'schema' | 'olap' | 'model' | 'inference'
  const [schemaData, setSchemaData] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("skypulse_theme") || "dark";
  });
  const [backendStatus, setBackendStatus] = useState({
    isOnline: false,
    isMockMode: false,
    latencyMs: null,
  });

  // Sync theme with document element and localStorage
  useEffect(() => {
    localStorage.setItem("skypulse_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Check health and load warehouse schema on mount
  useEffect(() => {
    const unsubscribe = api.subscribe((status) => {
      setBackendStatus(status);
    });

    async function init() {
      await api.checkHealth();
      const schema = await api.getSchema();
      setSchemaData(schema);
    }
    init();

    const interval = setInterval(() => {
      api.checkHealth();
    }, 12000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleRefreshHealth = async () => {
    await api.checkHealth();
    const schema = await api.getSchema();
    setSchemaData(schema);
  };

  const handleToggleMockMode = () => {
    api.setForceMockMode(!backendStatus.isMockMode);
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans bg-aviation-grid transition-colors ${
        isDark
          ? "bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
          : "bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-cyan-900"
      }`}
    >
      {/* Top Executive Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onRefreshHealth={handleRefreshHealth}
        onToggleMockMode={handleToggleMockMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Tab Content Container: has its own clean margin-top */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 mt-2">
        {activeTab === "schema" && (
          <WarehouseSchemaView schemaData={schemaData} theme={theme} />
        )}

        {activeTab === "olap" && <OlapStudio theme={theme} />}

        {activeTab === "model" && <ModelPerformanceView theme={theme} />}

        {activeTab === "inference" && <InferenceEngineView theme={theme} />}
      </main>

      {/* Executive DWM Platform Footer */}
      <footer
        className={`border-t py-6 text-xs transition-colors ${
          isDark
            ? "border-slate-800/80 bg-slate-950/90 text-slate-400"
            : "border-slate-200 bg-white/95 text-slate-500"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              SkyPulse Airline Data Warehouse
            </span>
            <span>•</span>
            <span>DWM Analytical Platform & Mining Intelligence</span>
          </div>

          <div
            className={`flex items-center gap-4 font-mono text-[11px] ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <span>FastAPI: :8000</span>
            <span>•</span>
            <span>10,000 Fact Records</span>
            <span>•</span>
            <span>Inmon / Kimball Dimensional Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
