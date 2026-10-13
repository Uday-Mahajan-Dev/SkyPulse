// SkyPulse API Service Layer with Dynamic OLAP, EDA, and Resilient Fallback
import { FALLBACK_OLAP_DATA, SCHEMA_TABLES } from "../data/warehouseData";

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class SkyPulseApiService {
  constructor() {
    this.isBackendOnline = false;
    this.forceMockMode = false;
    this.lastLatencyMs = null;
    this.listeners = new Set();
    this.cachedAnalyticsSample = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyStatus() {
    for (const listener of this.listeners) {
      listener({
        isOnline: this.isBackendOnline,
        isMockMode: this.forceMockMode || !this.isBackendOnline,
        latencyMs: this.lastLatencyMs,
      });
    }
  }

  setForceMockMode(val) {
    this.forceMockMode = val;
    this.notifyStatus();
  }

  async checkHealth() {
    if (this.forceMockMode) {
      return { isOnline: false, isMockMode: true, latencyMs: 0 };
    }
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API_BASE}/dw/schema`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.lastLatencyMs = Math.round(performance.now() - start);
        this.isBackendOnline = true;
      } else {
        this.isBackendOnline = false;
      }
    } catch {
      this.isBackendOnline = false;
    }
    this.notifyStatus();
    return {
      isOnline: this.isBackendOnline,
      isMockMode: this.forceMockMode || !this.isBackendOnline,
      latencyMs: this.lastLatencyMs,
    };
  }

  async getSchema() {
    if (this.forceMockMode) return this._mockSchema();
    try {
      const res = await fetch(`${API_BASE}/dw/schema`);
      if (!res.ok) throw new Error("Schema fetch failed");
      const data = await res.json();
      this.isBackendOnline = true;
      this.notifyStatus();
      return data;
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return this._mockSchema();
    }
  }

  _mockSchema() {
    return {
      fact_table: {
        name: SCHEMA_TABLES.Fact_Satisfaction.name,
        grain: SCHEMA_TABLES.Fact_Satisfaction.grain,
        row_count: SCHEMA_TABLES.Fact_Satisfaction.rowCount,
        foreign_keys: SCHEMA_TABLES.Fact_Satisfaction.fks,
        measures: SCHEMA_TABLES.Fact_Satisfaction.columns
          .filter((c) => c.key === "Measure")
          .map((c) => c.name),
        target: SCHEMA_TABLES.Fact_Satisfaction.columns.find((c) => c.key === "Target")?.name,
      },
      dimensions: Object.values(SCHEMA_TABLES)
        .filter((t) => t.type === "DIMENSION")
        .map((d) => ({
          name: d.name,
          pk: d.pk,
          attributes: d.columns.filter((c) => c.key !== "PK").map((c) => c.name),
          cardinality: d.rowCount,
        })),
    };
  }

  // -------------------------------------------------------------------------
  // DYNAMIC OLAP OPERATIONS
  // -------------------------------------------------------------------------
  async getRollup(level = "Season", measure = "is_satisfied", agg = "mean") {
    if (this.forceMockMode) return this._mockDynamicRollup(level, measure, agg);
    try {
      const url = `${API_BASE}/olap/rollup?level=${encodeURIComponent(level)}&measure=${encodeURIComponent(measure)}&agg=${encodeURIComponent(agg)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Rollup failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return data;
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return this._mockDynamicRollup(level, measure, agg);
    }
  }

  _mockDynamicRollup(level, measure, agg) {
    if (level.toLowerCase() === "year") {
      return FALLBACK_OLAP_DATA.rollupYear.map((item) => ({
        ...item,
        label: String(item.Year),
        metric_value: measure === "Ticket_Price" ? item.avg_ticket_price : measure === "Departure_Delay_in_Minutes" ? item.avg_departure_delay : item.satisfaction_rate,
      }));
    }
    return FALLBACK_OLAP_DATA.rollupSeason.map((item) => ({
      ...item,
      label: item.Season,
      metric_value: measure === "Ticket_Price" ? item.avg_ticket_price : measure === "Departure_Delay_in_Minutes" ? item.avg_departure_delay : item.satisfaction_rate,
    }));
  }

  async getDrilldown(primaryDim = "Class", primaryVal = "Business", subDim = "Model", measure = "is_satisfied") {
    if (this.forceMockMode) return this._mockDynamicDrilldown(primaryVal);
    try {
      const url = `${API_BASE}/olap/drilldown?primary_dim=${encodeURIComponent(primaryDim)}&primary_val=${encodeURIComponent(primaryVal)}&sub_dim=${encodeURIComponent(subDim)}&measure=${encodeURIComponent(measure)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Drilldown failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return data;
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return this._mockDynamicDrilldown(primaryVal);
    }
  }

  _mockDynamicDrilldown(travelClass) {
    const list = travelClass?.toLowerCase() === "business"
      ? FALLBACK_OLAP_DATA.drilldownBusiness
      : FALLBACK_OLAP_DATA.drilldownEco;
    return list.map((item) => ({
      ...item,
      sub_dim_val: item.Model,
      metric_value: item.satisfaction_rate,
    }));
  }

  async getSlice(dimension = "Customer_Type", value = "disloyal Customer", crossDim = "Type_of_Travel", measure = "is_satisfied") {
    if (this.forceMockMode) return this._mockDynamicSlice(value);
    try {
      const url = `${API_BASE}/olap/slice?dimension=${encodeURIComponent(dimension)}&value=${encodeURIComponent(value)}&cross_dim=${encodeURIComponent(crossDim)}&measure=${encodeURIComponent(measure)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Slice failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return data;
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return this._mockDynamicSlice(value);
    }
  }

  _mockDynamicSlice(val) {
    return FALLBACK_OLAP_DATA.sliceDisloyal.map((item) => ({
      ...item,
      cross_dim_val: item.Type_of_Travel,
      metric_value: item.satisfaction_rate,
    }));
  }

  async getDice(dim1 = "Class", val1 = "Business", dim2 = "Season", val2 = "Winter", metricCol = "Departure_Delay_in_Minutes", threshold = 15) {
    if (this.forceMockMode) return FALLBACK_OLAP_DATA.diceWinterBusiness;
    try {
      const url = `${API_BASE}/olap/dice?dim1=${encodeURIComponent(dim1)}&val1=${encodeURIComponent(val1)}&dim2=${encodeURIComponent(dim2)}&val2=${encodeURIComponent(val2)}&metric_col=${encodeURIComponent(metricCol)}&min_threshold=${threshold}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Dice failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return data;
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return FALLBACK_OLAP_DATA.diceWinterBusiness;
    }
  }

  async getPivot(row = "Origin_Airport_Code", col = "Class", metric = "is_satisfied", agg = "mean") {
    if (this.forceMockMode) return FALLBACK_OLAP_DATA.pivotMatrix;
    try {
      const url = `${API_BASE}/olap/pivot?row=${encodeURIComponent(row)}&col=${encodeURIComponent(col)}&metric=${encodeURIComponent(metric)}&agg=${encodeURIComponent(agg)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Pivot failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return data;
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return FALLBACK_OLAP_DATA.pivotMatrix;
    }
  }

  // -------------------------------------------------------------------------
  // EDA & ANALYTICS DATASET
  // -------------------------------------------------------------------------
  async getAnalyticsSample(limit = 600) {
    if (this.cachedAnalyticsSample) return this.cachedAnalyticsSample;
    if (this.forceMockMode) {
      return this._mockAnalyticsSample();
    }
    try {
      const res = await fetch(`${API_BASE}/dw/analytics-sample?limit=${limit}`);
      if (!res.ok) throw new Error("Analytics sample fetch failed");
      const data = await res.json();
      this.cachedAnalyticsSample = data;
      return data;
    } catch {
      return this._mockAnalyticsSample();
    }
  }

  _mockAnalyticsSample() {
    // Generate authentic stratified representative dataset
    const rows = [];
    const classes = ["Business", "Eco", "Eco Plus"];
    const seasons = ["Winter", "Summer", "Spring", "Fall"];
    const types = ["Business travel", "Personal Travel"];
    const airframes = ["Boeing 777-300ER", "Airbus A350", "Boeing 787 Dreamliner", "Boeing 737-MAX", "Airbus A320neo", "Boeing 737-800"];
    
    for (let i = 1; i <= 300; i++) {
      const cls = classes[i % 3];
      const isBiz = cls === "Business";
      const wifi = isBiz ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 4) + 1;
      const boarding = isBiz ? Math.min(5, Math.floor(Math.random() * 2) + 4) : Math.floor(Math.random() * 4) + 1;
      const depDelay = Math.random() < 0.7 ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 85);
      const arrDelay = Math.max(0, depDelay + Math.floor(Math.random() * 15) - 5);
      const prob = Math.min(Math.max((boarding * 0.35 + wifi * 0.35 + (isBiz ? 1.5 : 0) - depDelay * 0.02) / 4.8, 0.05), 0.98);
      const isSat = prob >= 0.5;

      rows.push({
        Passenger_ID: 10000 + i,
        Class: cls,
        Season: seasons[i % 4],
        Type_of_Travel: isBiz ? "Business travel" : types[i % 2],
        Customer_Type: Math.random() > 0.2 ? "Loyal Customer" : "disloyal Customer",
        Gender: i % 2 === 0 ? "Female" : "Male",
        Age: Math.floor(Math.random() * 50) + 20,
        Flight_Distance: isBiz ? Math.floor(Math.random() * 1800) + 1000 : Math.floor(Math.random() * 1000) + 300,
        Departure_Delay_in_Minutes: depDelay,
        Arrival_Delay_in_Minutes: arrDelay,
        Ticket_Price: isBiz ? Math.floor(Math.random() * 400) + 350 : Math.floor(Math.random() * 180) + 90,
        Discount_Percent: Math.floor(Math.random() * 25),
        Inflight_wifi_service: wifi,
        Online_boarding: boarding,
        Seat_comfort: isBiz ? 5 : Math.floor(Math.random() * 4) + 1,
        Inflight_entertainment: isBiz ? 5 : Math.floor(Math.random() * 4) + 1,
        Leg_room_service: isBiz ? 5 : Math.floor(Math.random() * 4) + 1,
        Cleanliness: isBiz ? 5 : Math.floor(Math.random() * 3) + 2,
        Food_and_drink: Math.floor(Math.random() * 4) + 1,
        On_board_service: Math.floor(Math.random() * 4) + 2,
        Model: airframes[i % airframes.length],
        Flight_Type: i % 3 === 0 ? "International" : "Domestic",
        satisfaction: isSat ? "satisfied" : "neutral or dissatisfied",
        is_satisfied: isSat ? 1 : 0,
      });
    }
    this.cachedAnalyticsSample = rows;
    return rows;
  }

  async getCorrelations() {
    if (this.forceMockMode) return this._mockCorrelations();
    try {
      const res = await fetch(`${API_BASE}/dw/correlations`);
      if (!res.ok) throw new Error("Correlations fetch failed");
      return await res.json();
    } catch {
      return this._mockCorrelations();
    }
  }

  _mockCorrelations() {
    const cols = ["Wifi", "Boarding", "Comfort", "Entertainment", "Leg Room", "Cleanliness", "Delay", "Ticket Price", "Satisfied"];
    const matrix = [
      [1.00, 0.46, 0.12, 0.21, 0.16, 0.13, -0.02, 0.14, 0.28],
      [0.46, 1.00, 0.42, 0.28, 0.36, 0.33, -0.01, 0.26, 0.50],
      [0.12, 0.42, 1.00, 0.61, 0.11, 0.68, -0.03, 0.18, 0.35],
      [0.21, 0.28, 0.61, 1.00, 0.20, 0.69, -0.03, 0.16, 0.40],
      [0.16, 0.36, 0.11, 0.20, 1.00, 0.10, 0.01, 0.12, 0.31],
      [0.13, 0.33, 0.68, 0.69, 0.10, 1.00, -0.01, 0.15, 0.31],
      [-0.02, -0.01, -0.03, -0.03, 0.01, -0.01, 1.00, 0.02, -0.05],
      [0.14, 0.26, 0.18, 0.16, 0.12, 0.15, 0.02, 1.00, 0.25],
      [0.28, 0.50, 0.35, 0.40, 0.31, 0.31, -0.05, 0.25, 1.00],
    ];
    return { columns: cols, matrix };
  }

  // -------------------------------------------------------------------------
  // INFERENCE PREDICTIONS
  // -------------------------------------------------------------------------
  async predictSingle(passengerData) {
    if (this.forceMockMode) return this._mockPredictSingle(passengerData);
    try {
      const res = await fetch(`${API_BASE}/predict/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passengerData),
      });
      if (!res.ok) throw new Error("Predict failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return { ...data, source: "FastAPI Engine (Voting Ensemble)" };
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return this._mockPredictSingle(passengerData);
    }
  }

  _mockPredictSingle(data) {
    const ob = Number(data.Online_boarding) || 3;
    const wifi = Number(data.Inflight_wifi_service) || 3;
    const seat = Number(data.Seat_comfort) || 3;
    const ent = Number(data.Inflight_entertainment) || 3;
    const leg = Number(data.Leg_room_service) || 3;
    const isBiz = data.Class === "Business" ? 1.4 : data.Class === "Eco Plus" ? 0.4 : -0.6;
    const isLoyal = data.Customer_Type === "Loyal Customer" ? 0.3 : -0.8;
    const delayPenalty = (Number(data.Departure_Delay_in_Minutes) || 0) * 0.008;

    const weightedScore = (ob * 0.3 + wifi * 0.25 + seat * 0.15 + ent * 0.15 + leg * 0.15 + isBiz + isLoyal - delayPenalty) / 5.2;
    const proba = Math.min(Math.max(weightedScore, 0.04), 0.985);
    const prediction = proba >= 0.5 ? "Satisfied" : "Neutral or Dissatisfied";

    return {
      prediction,
      satisfaction_probability: Math.round(proba * 10000) / 10000,
      status: "success",
      source: "Client Fallback Heuristic",
    };
  }

  async predictBatch(file) {
    if (this.forceMockMode) return this._mockPredictBatch(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/predict/batch`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Batch scoring failed");
      const data = await res.json();
      this.isBackendOnline = true;
      return { ...data, source: "FastAPI Engine (Voting Ensemble)" };
    } catch {
      this.isBackendOnline = false;
      this.notifyStatus();
      return this._mockPredictBatch(file);
    }
  }

  async _mockPredictBatch(file) {
    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length <= 1) {
      throw new Error("CSV file contains no data rows");
    }
    const headers = lines[0].split(",").map((h) => h.trim());
    const preview = [];
    let satisfiedCount = 0;
    const failureDrivers = {
      Inflight_wifi_service: 0,
      Online_boarding: 0,
      Seat_comfort: 0,
      Cleanliness: 0,
      Leg_room_service: 0,
    };

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length < headers.length) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx];
      });

      const ob = Number(row["Online_boarding"]) || 3;
      const wifi = Number(row["Inflight_wifi_service"]) || 3;
      const seat = Number(row["Seat_comfort"]) || 3;
      const delay = Number(row["Departure_Delay_in_Minutes"]) || 0;
      const isBiz = row["Class"] === "Business" ? 0.3 : -0.2;
      const prob = Math.min(Math.max((ob * 0.4 + wifi * 0.4 + 1.2 + isBiz - delay * 0.005) / 5.2, 0.08), 0.97);
      const pred = prob >= 0.5 ? "Satisfied" : "Neutral or Dissatisfied";
      if (pred === "Satisfied") satisfiedCount++;

      row["predicted_satisfaction"] = pred;
      row["confidence"] = Math.round(prob * 10000) / 10000;
      
      if (pred === "Neutral or Dissatisfied") {
        if (wifi <= 2) failureDrivers.Inflight_wifi_service++;
        if (ob <= 2) failureDrivers.Online_boarding++;
        if (seat <= 2) failureDrivers.Seat_comfort++;
        row["root_cause_driver"] = delay > 30 ? `Flight Delay (${delay}m)` : wifi <= 2 ? "Inflight Wi-Fi (Poor)" : "Online Boarding (Difficult)";
        row["churn_risk_level"] = prob < 0.25 ? "Critical" : "High";
      } else {
        row["root_cause_driver"] = "Premium Experience (Satisfied)";
        row["churn_risk_level"] = "Low";
      }

      preview.push(row);
    }

    return {
      total_records: preview.length,
      satisfied_count: satisfiedCount,
      dissatisfied_count: preview.length - satisfiedCount,
      satisfaction_rate_pct: Math.round((satisfiedCount / preview.length) * 10000) / 100,
      failure_drivers: failureDrivers,
      sample_preview: preview.slice(0, 50),
      all_records: preview,
      source: "Client Fallback Heuristic",
    };
  }
}

export const api = new SkyPulseApiService();
