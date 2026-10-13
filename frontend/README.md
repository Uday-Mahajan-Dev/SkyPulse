# SkyPulse Airline Data Warehouse & Mining Intelligence Platform

A modern, executive Data Analyst & DWM (Data Warehousing & Mining) web platform designed for **SkyPulse Airline Data Warehouse**.

---

## 🚀 Key Features & Refinements

### 1. 🌓 Global Theme Toggle (Dark Mode & Light Mode)
- **Top Navigation Switch:** One-click toggle between **Dark Aviation Mode** (Slate-950/Zinc-900 with neon Cyan/Indigo accents) and **Executive Light Mode** (Slate-50/White with crisp borders and navy/slate text).
- **Persistent State:** Saves theme preference to `localStorage` and binds dynamically to Tailwind's `.dark` / `.light` root classes.
- **Dynamic Chart Adaptation:** All Recharts charts dynamically adjust grid lines, tooltip styles, axes, and color fills based on the active theme.

---

### 2. 📊 Tab 1: Warehouse Architecture & ML Exploratory Data Analysis (EDA) Studio
- **Interactive Star Schema Visualizer:**
  - Non-overlapping spatial coordinates on an expanded 1060×740 SVG canvas.
  - Central `Fact_Satisfaction` node (10,000 records) linked radially to 7 conformed dimensions.
  - Foreign key join links with animated particle flows and join condition badges.
- **Enterprise Data Catalog & Inspector Drawer:**
  - Searchable inventory of all 8 entities with attribute data types, keys, and authentic CSV records.
- **NEW: Exploratory Data Analysis (EDA) & Distribution Studio:**
  - Interactive feature selector (Primary Feature & Secondary Stratifier).
  - 6 distinct interactive visualization plots powered by Recharts:
    1. 📊 **Histogram / KDE Distribution:** Bin frequency spread stratified by satisfaction.
    2. 🟣 **2D Scatter Plot:** Bivariate relationships (e.g. Departure Delay vs Arrival Delay, or Distance vs Ticket Price) colored by target.
    3. 📦 **Box Plot / Quartile Distribution:** Tukey 5-number summary (Min, Q1, Median, Q3, Max, IQR) across passenger cohorts.
    4. 📶 **Categorical Mean Measure Analysis:** Bar chart showing average ratings across classes or flight types.
    5. 🥧 **Composition Donut Share:** Sector percentage share breakdown for categorical dimensions.
    6. 🔥 **Pearson Correlation Heatmap Matrix:** Correlation between 10 quantitative cabin survey ratings and flight delays to diagnose multicollinearity.

---

### 3. 🔄 Tab 2: Dynamic User-Driven OLAP Operations Studio
100% user-configurable multi-dimensional analytical operations:
- **Dynamic Roll-Up:** Select Hierarchy Level (`Season`, `Year`, `Month`, `Day_of_Week`), Measure (`is_satisfied`, `Departure Delay`, `Arrival Delay`, `Ticket Price`, `Flight Distance`), and Aggregation (`Mean`, `Sum`, `Count`). Includes dynamic bar chart and data table.
- **Dynamic Drill-Down:** Choose a Primary Dimension (`Class`, `Customer_Type`, `Flight_Type`, `Type_of_Travel`), filter on an exact value, and expand into an arbitrary Sub-Dimension (`Model`, `Wifi_Type`, `Departure_Conditions`, etc.).
- **Dynamic Slice:** Select any single dimension, fix its value, and project the 2D plane cut across a chosen X-axis dimension.
- **Dynamic Dice:** Multi-criteria filtering panel with 3 simultaneous dimensions + metric threshold slider with real-time KPI scorecards.
- **Dynamic Pivot Matrix:** Interactive heatmapped cross-tabulation grid with configurable rows, columns, metrics, and aggregation functions.

---

### 4. 🎯 Tab 3: Model Performance & Drivers
- **Voting Ensemble Classifier (94.8% Accuracy, 0.9811 ROC-AUC, 94.0% Precision, 90.0% Recall, 92.0% F1-Score).**
- **2x2 Confusion Matrix:** 1,090 TN, 775 TP, 48 FP, 87 FN with count/percentage toggle.
- **Top 15 Feature Importances:** Interactive horizontal bar chart with category filtering and drill-down explanations.

---

### 5. ⚡ Tab 4: Inference Engine & Batch Explainability Studio
- **Single Passenger Simulator:**
  - Sliders for 14 cabin Likert ratings (1-5★).
  - Presets: *"Happy Executive"*, *"Frustrated Budget Flyer"*, *"Long-Haul Vacationer"*.
  - Radial satisfaction probability gauge & SHAP waterfall driver analysis.
- **Batch CSV Scoring & Explainability EDA:**
  - Drag-and-drop CSV upload + **"⚡ Generate & Score Instant Sample Batch"** button.
  - **Batch EDA Studio:**
    - Ratio Donut Chart (Satisfied vs Dissatisfied).
    - Confidence Quartiles Box Plot.
    - Root-Cause Failure Drivers Bar Chart (identifies ratings $\le 2$ stars in dissatisfied segment).
    - Departure Delay vs Confidence Scatter Plot.
  - **Export Scored CSV with Explanation Flags:** Downloads enriched predictions with `predicted_satisfaction`, `confidence`, `root_cause_driver`, and `churn_risk_level`.

---

## 🏃 Running the Servers
- **FastAPI Backend (port 8000):**
  ```bash
  cd backend
  .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
  ```
- **Vite Frontend (port 5173):**
  ```bash
  cd frontend
  npm run dev
  ```
- Open `http://localhost:5173` in your browser.
