import React from "react";
import {
  Database,
  Layers,
  Columns,
  Workflow,
} from "lucide-react";
import { WAREHOUSE_METADATA } from "../../data/warehouseData";

export default function WarehouseMetadataCards({ schemaData, theme }) {
  const isDark = theme === "dark";
  const factRowCount =
    schemaData?.fact_table?.row_count || WAREHOUSE_METADATA.totalRecords;
  const dimCount =
    schemaData?.dimensions?.length || WAREHOUSE_METADATA.dimensionTablesCount;

  const cards = [
    {
      title: "Total Warehouse Records",
      value: factRowCount.toLocaleString(),
      sub: "Fact_Satisfaction Survey Grain",
      icon: Database,
      accent: "from-cyan-500 to-blue-500",
      border: isDark ? "border-cyan-500/30" : "border-cyan-200",
      textAccent: isDark ? "text-cyan-400" : "text-cyan-600",
      badge: "Grain: 1 Record / Survey",
    },
    {
      title: "Dimension Tables",
      value: dimCount,
      sub: "Conformed & Role-Playing Dimensions",
      icon: Layers,
      accent: "from-indigo-500 to-purple-500",
      border: isDark ? "border-indigo-500/30" : "border-indigo-200",
      textAccent: isDark ? "text-indigo-400" : "text-indigo-600",
      badge: "7 Domain Entities",
    },
    {
      title: "Denormalized Width",
      value: "48 Cols Raw",
      sub: "39 Machine Learning Features Pruned",
      icon: Columns,
      accent: "from-sky-500 to-teal-500",
      border: isDark ? "border-sky-500/30" : "border-sky-200",
      textAccent: isDark ? "text-sky-400" : "text-sky-600",
      badge: "14 Likert Cabin Scales",
    },
    {
      title: "Schema Style",
      value: "Star Schema",
      sub: "Kimball / Inmon Dimensional Modeling",
      icon: Workflow,
      accent: "from-emerald-500 to-teal-500",
      border: isDark ? "border-emerald-500/30" : "border-emerald-200",
      textAccent: isDark ? "text-emerald-400" : "text-emerald-600",
      badge: "OLAP Cube Ready",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:scale-[1.02] group ${
              isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-100"
                : "bg-white/95 border-slate-200 text-slate-800 shadow-sm"
            } ${card.border}`}
          >
            <div
              className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${card.accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
            />

            <div className="flex items-start justify-between mb-3">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {card.title}
              </span>
              <div
                className={`p-2 rounded-xl border ${card.textAccent} ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700/60"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1.5">
              <span
                className={`text-2xl font-extrabold tracking-tight font-mono ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {card.value}
              </span>
            </div>

            <p
              className={`text-xs mb-3 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {card.sub}
            </p>

            <div
              className={`pt-2.5 border-t flex items-center justify-between ${
                isDark ? "border-slate-800/80" : "border-slate-100"
              }`}
            >
              <span
                className={`text-[11px] font-mono ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {card.badge}
              </span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
