import React, { useState } from "react";
import {
  X,
  Database,
  Key,
  Layers,
  Table,
  Code2,
  FileSpreadsheet,
  Check,
  Copy,
  ArrowRight,
} from "lucide-react";

export default function TableDetailsModal({ tableData, onClose, theme }) {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("schema");
  const [copied, setCopied] = useState(false);

  if (!tableData) return null;

  const isFact = tableData.type === "FACT";

  const sqlQuery = isFact
    ? `SELECT \n  f.Passenger_ID,\n  f.Departure_Delay_in_Minutes,\n  f.Inflight_wifi_service,\n  f.Online_boarding,\n  f.Seat_comfort,\n  f.Ticket_Price,\n  f.satisfaction\nFROM Fact_Satisfaction f\nJOIN Dim_Passenger p ON f.Passenger_ID = p.Passenger_ID\nJOIN Dim_Flight_Profile fp ON f.Flight_Profile_ID = fp.Flight_Profile_ID\nLIMIT 10;`
    : `SELECT * \nFROM ${tableData.name}\nWHERE ${tableData.pk} IS NOT NULL\nORDER BY ${tableData.pk} ASC\nLIMIT 10;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-700/80 text-slate-100"
            : "bg-white border-slate-300 text-slate-800"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark
              ? "border-slate-800 bg-slate-950/40"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isFact
                  ? isDark
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-cyan-50 border-cyan-300 text-cyan-700"
                  : isDark
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                  : "bg-indigo-50 border-indigo-300 text-indigo-700"
              }`}
            >
              {isFact ? (
                <Database className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3
                  className={`text-lg font-bold font-mono ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {tableData.name}
                </h3>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isFact
                      ? isDark
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-cyan-100 text-cyan-800 border border-cyan-300"
                      : isDark
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : "bg-indigo-100 text-indigo-800 border border-indigo-300"
                  }`}
                >
                  {tableData.type} TABLE
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tableData.rowCount.toLocaleString()} Rows
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {tableData.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div
          className={`flex items-center gap-2 px-6 border-b ${
            isDark
              ? "border-slate-800 bg-slate-950/20"
              : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <button
            onClick={() => setActiveTab("schema")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "schema"
                ? isDark
                  ? "border-cyan-400 text-cyan-300"
                  : "border-cyan-600 text-cyan-700"
                : isDark
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Table className="w-4 h-4" />
            Attributes & Data Types ({tableData.columns.length})
          </button>

          <button
            onClick={() => setActiveTab("samples")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "samples"
                ? isDark
                  ? "border-cyan-400 text-cyan-300"
                  : "border-cyan-600 text-cyan-700"
                : isDark
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Sample Records Preview ({tableData.sampleRecords?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("sql")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "sql"
                ? isDark
                  ? "border-cyan-400 text-cyan-300"
                  : "border-cyan-600 text-cyan-700"
                : isDark
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code2 className="w-4 h-4" />
            SQL Query Template
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Key Relationships Banner */}
          {isFact ? (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                isDark
                  ? "bg-slate-950/50 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div
                className={`font-semibold mb-2 flex items-center gap-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <Key
                  className={`w-3.5 h-3.5 ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
                Foreign Key Dimensional Linkages (7 Relations):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {tableData.fks?.map((fk, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2 rounded-lg border font-mono text-[11px] ${
                      isDark
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <span
                      className={isDark ? "text-cyan-300" : "text-cyan-700 font-bold"}
                    >
                      {fk.fk}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span
                      className={
                        isDark ? "text-indigo-300" : "text-indigo-700 font-bold"
                      }
                    >
                      {fk.references}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                isDark
                  ? "bg-slate-950/50 border-slate-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Key
                  className={`w-4 h-4 ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                />
                <span
                  className={isDark ? "text-slate-300" : "text-slate-700"}
                >
                  Primary Key:
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded border ${
                    isDark
                      ? "text-indigo-300 bg-indigo-500/10 border-indigo-500/30"
                      : "text-indigo-800 bg-indigo-50 border-indigo-200"
                  }`}
                >
                  {tableData.pk}
                </span>
              </div>
              <div
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Linked in Fact Table via:{" "}
                <span
                  className={`font-mono font-bold ${
                    isDark ? "text-cyan-400" : "text-cyan-700"
                  }`}
                >
                  {tableData.fkInFact}
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: Schema Columns Table */}
          {activeTab === "schema" && (
            <div
              className={`border rounded-xl overflow-hidden ${
                isDark
                  ? "border-slate-800 bg-slate-950/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead
                    className={`sticky top-0 backdrop-blur border-b font-mono uppercase tracking-wider text-[11px] ${
                      isDark
                        ? "bg-slate-900/90 border-slate-800 text-slate-400"
                        : "bg-slate-100/95 border-slate-200 text-slate-600"
                    }`}
                  >
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Column Name</th>
                      <th className="py-2.5 px-4 font-semibold">Data Type</th>
                      <th className="py-2.5 px-4 font-semibold">Key / Role</th>
                      <th className="py-2.5 px-4 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y font-sans ${
                      isDark ? "divide-slate-800/60" : "divide-slate-100"
                    }`}
                  >
                    {tableData.columns.map((col, idx) => {
                      const isPk = col.key === "PK";
                      const isFk = col.key === "FK";
                      const isMeasure = col.key === "Measure";
                      const isTarget = col.key === "Target";

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isDark
                              ? "hover:bg-slate-800/40"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td
                            className={`py-2 px-4 font-mono font-medium ${
                              isDark ? "text-slate-200" : "text-slate-800 font-bold"
                            }`}
                          >
                            {col.name}
                          </td>
                          <td
                            className={`py-2 px-4 font-mono text-[11px] ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {col.type}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                isPk
                                  ? isDark
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                                    : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                                  : isFk
                                  ? isDark
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                    : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                                  : isMeasure
                                  ? isDark
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : isTarget
                                  ? isDark
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                    : "bg-purple-50 text-purple-800 border border-purple-200"
                                  : isDark
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {col.key}
                            </span>
                          </td>
                          <td
                            className={`py-2 px-4 text-[11px] ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {col.desc}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Sample Records */}
          {activeTab === "samples" && (
            <div
              className={`border rounded-xl overflow-hidden ${
                isDark
                  ? "border-slate-800 bg-slate-950/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              {tableData.sampleRecords && tableData.sampleRecords.length > 0 ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead
                      className={`sticky top-0 backdrop-blur border-b font-mono text-[11px] ${
                        isDark
                          ? "bg-slate-900/90 border-slate-800 text-slate-400"
                          : "bg-slate-100/95 border-slate-200 text-slate-600"
                      }`}
                    >
                      <tr>
                        {Object.keys(tableData.sampleRecords[0]).map((key) => (
                          <th
                            key={key}
                            className="py-2.5 px-4 font-semibold whitespace-nowrap"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y font-mono text-[11px] ${
                        isDark ? "divide-slate-800/60" : "divide-slate-100"
                      }`}
                    >
                      {tableData.sampleRecords.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`transition-colors ${
                            isDark
                              ? "hover:bg-slate-800/40"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {Object.values(row).map((val, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-2 px-4 whitespace-nowrap ${
                                val === "satisfied"
                                  ? isDark
                                    ? "text-emerald-400 font-bold"
                                    : "text-emerald-700 font-bold"
                                  : val === "neutral or dissatisfied"
                                  ? isDark
                                    ? "text-amber-400"
                                    : "text-amber-700"
                                  : isDark
                                  ? "text-slate-300"
                                  : "text-slate-700"
                              }`}
                            >
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No sample records available.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SQL Query */}
          {activeTab === "sql" && (
            <div
              className={`relative rounded-xl border p-4 font-mono text-xs ${
                isDark
                  ? "border-slate-800 bg-slate-950 text-cyan-300"
                  : "border-slate-200 bg-slate-900 text-cyan-300"
              }`}
            >
              <button
                onClick={copySql}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy SQL"}
              </button>
              <pre className="whitespace-pre-wrap">{sqlQuery}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-t text-xs ${
            isDark
              ? "border-slate-800 bg-slate-950/60 text-slate-400"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <span>Grain: 1 record per survey per flight segment</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
