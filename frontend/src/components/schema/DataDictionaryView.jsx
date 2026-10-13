import React, { useState } from "react";
import {
  Table,
  Search,
  ExternalLink,
  Key,
  Database,
  Layers,
} from "lucide-react";
import { SCHEMA_TABLES } from "../../data/warehouseData";

export default function DataDictionaryView({ onSelectTable, theme }) {
  const isDark = theme === "dark";
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  const tables = Object.values(SCHEMA_TABLES);

  const filteredTables = tables.filter((t) => {
    const matchesType = filterType === "ALL" || t.type === filterType;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.columns.some((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div
      className={`rounded-2xl border shadow-xl overflow-hidden mt-6 transition-colors ${
        isDark
          ? "bg-slate-900/80 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-800"
      }`}
    >
      <div
        className={`p-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Table
              className={`w-4 h-4 ${
                isDark ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
            Enterprise Data Dictionary & Warehouse Catalog
          </h3>
          <p
            className={`text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Comprehensive relational inventory with row cardinalities and dimensional attributes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Type Filter Buttons */}
          <div
            className={`flex p-1 rounded-xl border text-xs ${
              isDark
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            {["ALL", "FACT", "DIMENSION"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? isDark
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "bg-white text-cyan-800 font-bold shadow-xs"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className={`w-4 h-4 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              />
            </div>
            <input
              type="text"
              placeholder="Filter dictionary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead
            className={`border-b font-mono text-[11px] uppercase tracking-wider ${
              isDark
                ? "bg-slate-950/60 border-slate-800 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <tr>
              <th className="py-3 px-5 font-semibold">Table Name</th>
              <th className="py-3 px-4 font-semibold">Classification</th>
              <th className="py-3 px-4 font-semibold">Primary Key</th>
              <th className="py-3 px-4 font-semibold">Total Rows</th>
              <th className="py-3 px-4 font-semibold">Columns</th>
              <th className="py-3 px-5 font-semibold">Dimensional Purpose</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y font-sans ${
              isDark ? "divide-slate-800/60" : "divide-slate-100"
            }`}
          >
            {filteredTables.map((table) => {
              const isFact = table.type === "FACT";
              return (
                <tr
                  key={table.name}
                  onClick={() => onSelectTable(table)}
                  className={`cursor-pointer transition-colors group ${
                    isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isFact
                            ? isDark
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                              : "bg-cyan-50 border-cyan-200 text-cyan-700"
                            : isDark
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-indigo-50 border-indigo-200 text-indigo-700"
                        }`}
                      >
                        {isFact ? (
                          <Database className="w-3.5 h-3.5" />
                        ) : (
                          <Layers className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span
                        className={`font-mono font-bold transition-colors ${
                          isDark
                            ? "text-slate-100 group-hover:text-cyan-300"
                            : "text-slate-900 group-hover:text-cyan-600"
                        }`}
                      >
                        {table.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        isFact
                          ? isDark
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                          : isDark
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                      }`}
                    >
                      {table.type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    {table.pk ? (
                      <span
                        className={`flex items-center gap-1 ${
                          isDark ? "text-indigo-300" : "text-indigo-600"
                        }`}
                      >
                        <Key className="w-3 h-3 text-indigo-400" />
                        {table.pk}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None (Composite)</span>
                    )}
                  </td>

                  <td
                    className={`py-3 px-4 font-mono ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {table.rowCount.toLocaleString()}
                  </td>

                  <td
                    className={`py-3 px-4 font-mono ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {table.columns.length} cols
                  </td>

                  <td
                    className={`py-3 px-5 max-w-xs truncate ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {table.description}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTable(table);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-cyan-300"
                          : "bg-slate-100 hover:bg-slate-200 text-cyan-700"
                      }`}
                    >
                      Inspect
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
