// SkyPulse Airline Data Warehouse & Mining Intelligence Dataset & Metadata

export const WAREHOUSE_METADATA = {
  totalRecords: 10000,
  dimensionTablesCount: 7,
  factTablesCount: 1,
  rawColumnsCount: 48,
  prunedFeaturesCount: 39,
  modelingParadigm: "Star Schema (Kimball & Inmon Dimensional Architecture)",
  normalizationLevel: "Dimension Tables 3NF / Fact Grain 1NF",
  grain: "1 Record Per Passenger Survey Response Per Flight Segment",
  lastETLRefresh: "Daily Micro-Batch (Delta Lake / Parquet)",
  storageFootprintMB: 4.8,
  targetVariable: "satisfaction (Binary: Satisfied vs Neutral/Dissatisfied)"
};

export const SCHEMA_TABLES = {
  Fact_Satisfaction: {
    name: "Fact_Satisfaction",
    type: "FACT",
    color: "cyan",
    rowCount: 10000,
    grain: "1 record per passenger survey response per flight",
    pk: null,
    fks: [
      { fk: "Passenger_ID", references: "Dim_Passenger.Passenger_ID", cardinality: "10,000 : 1" },
      { fk: "Flight_Profile_ID", references: "Dim_Flight_Profile.Flight_Profile_ID", cardinality: "6 : 1" },
      { fk: "Date_ID", references: "Dim_Date.Date_ID", cardinality: "1,313 : 1" },
      { fk: "Route_ID", references: "Dim_Route.Route_ID", cardinality: "10 : 1" },
      { fk: "Aircraft_ID", references: "Dim_Aircraft.Aircraft_ID", cardinality: "8 : 1" },
      { fk: "Weather_ID", references: "Dim_Weather.Weather_ID", cardinality: "5 : 1" },
      { fk: "Crew_ID", references: "Dim_Crew.Crew_ID", cardinality: "9 : 1" }
    ],
    description: "Central transaction fact table containing quantitative measures and 14 Likert-scale cabin ratings collected via post-flight surveys.",
    columns: [
      { name: "Passenger_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Passenger" },
      { name: "Flight_Profile_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Flight_Profile" },
      { name: "Date_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Date" },
      { name: "Route_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Route" },
      { name: "Aircraft_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Aircraft" },
      { name: "Weather_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Weather" },
      { name: "Crew_ID", type: "INTEGER", key: "FK", desc: "FK referencing Dim_Crew" },
      { name: "Flight_Distance", type: "INTEGER", key: "Measure", desc: "Flight route length in nautical miles" },
      { name: "Departure_Delay_in_Minutes", type: "INTEGER", key: "Measure", desc: "Delay at takeoff (min)" },
      { name: "Arrival_Delay_in_Minutes", type: "INTEGER", key: "Measure", desc: "Delay at landing (min)" },
      { name: "Ticket_Price", type: "DECIMAL(8,2)", key: "Measure", desc: "Net airfare paid ($ USD)" },
      { name: "Discount_Percent", type: "DECIMAL(5,2)", key: "Measure", desc: "Promotional discount applied" },
      { name: "Inflight_wifi_service", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Inflight Wi-Fi reliability" },
      { name: "Departure_Arrival_time_convenient", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Flight schedule suitability" },
      { name: "Ease_of_Online_booking", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Web/App booking flow" },
      { name: "Gate_location", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Terminal walking distance" },
      { name: "Food_and_drink", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Catering & beverage quality" },
      { name: "Online_boarding", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Digital check-in & boarding pass" },
      { name: "Seat_comfort", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Seat ergonomics & cushion" },
      { name: "Inflight_entertainment", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Screen selection & audio" },
      { name: "On-board_service", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Attendant service & courtesy" },
      { name: "Leg_room_service", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Seat pitch & space" },
      { name: "Baggage_handling", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Luggage transit & safety" },
      { name: "Checkin_service", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Airport counter staff efficiency" },
      { name: "Inflight_service", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Overall cabin atmosphere" },
      { name: "Cleanliness", type: "TINYINT (1-5)", key: "Measure", desc: "Rating: Cabin & lavatory sanitization" },
      { name: "satisfaction", type: "VARCHAR(25)", key: "Target", desc: "Survey target: satisfied / neutral or dissatisfied" }
    ],
    sampleRecords: [
      { Passenger_ID: 70172, Flight_Distance: 460, Departure_Delay_in_Minutes: 25, Arrival_Delay_in_Minutes: 18, Inflight_wifi_service: 3, Online_boarding: 3, Seat_comfort: 5, Ticket_Price: 153.08, satisfaction: "neutral or dissatisfied" },
      { Passenger_ID: 5047, Flight_Distance: 235, Departure_Delay_in_Minutes: 1, Arrival_Delay_in_Minutes: 6, Inflight_wifi_service: 3, Online_boarding: 3, Seat_comfort: 1, Ticket_Price: 172.60, satisfaction: "neutral or dissatisfied" },
      { Passenger_ID: 110028, Flight_Distance: 1620, Departure_Delay_in_Minutes: 0, Arrival_Delay_in_Minutes: 0, Inflight_wifi_service: 5, Online_boarding: 5, Seat_comfort: 5, Ticket_Price: 489.20, satisfaction: "satisfied" },
      { Passenger_ID: 24026, Flight_Distance: 1142, Departure_Delay_in_Minutes: 35, Arrival_Delay_in_Minutes: 40, Inflight_wifi_service: 2, Online_boarding: 2, Seat_comfort: 2, Ticket_Price: 198.50, satisfaction: "neutral or dissatisfied" },
      { Passenger_ID: 119299, Flight_Distance: 2140, Departure_Delay_in_Minutes: 4, Arrival_Delay_in_Minutes: 0, Inflight_wifi_service: 4, Online_boarding: 5, Seat_comfort: 4, Ticket_Price: 382.40, satisfaction: "satisfied" }
    ]
  },

  Dim_Passenger: {
    name: "Dim_Passenger",
    type: "DIMENSION",
    color: "indigo",
    rowCount: 10000,
    pk: "Passenger_ID",
    fkInFact: "Passenger_ID",
    description: "Captures core passenger demographics and loyalty tier status.",
    columns: [
      { name: "Passenger_ID", type: "INTEGER", key: "PK", desc: "Surrogate unique passenger identifier" },
      { name: "Gender", type: "VARCHAR(10)", key: "Attribute", desc: "Male / Female" },
      { name: "Age", type: "INTEGER", key: "Attribute", desc: "Age of passenger in years (Range: 7 - 85)" },
      { name: "Customer_Type", type: "VARCHAR(20)", key: "Attribute", desc: "Loyal Customer / disloyal Customer" }
    ],
    sampleRecords: [
      { Passenger_ID: 70172, Gender: "Male", Age: 13, Customer_Type: "Loyal Customer" },
      { Passenger_ID: 5047, Gender: "Male", Age: 25, Customer_Type: "disloyal Customer" },
      { Passenger_ID: 110028, Gender: "Female", Age: 26, Customer_Type: "Loyal Customer" },
      { Passenger_ID: 24026, Gender: "Female", Age: 25, Customer_Type: "Loyal Customer" },
      { Passenger_ID: 119299, Gender: "Male", Age: 61, Customer_Type: "Loyal Customer" }
    ]
  },

  Dim_Flight_Profile: {
    name: "Dim_Flight_Profile",
    type: "DIMENSION",
    color: "purple",
    rowCount: 6,
    pk: "Flight_Profile_ID",
    fkInFact: "Flight_Profile_ID",
    description: "Defines cabin class and travel reason matrix (6 discrete combinations).",
    columns: [
      { name: "Flight_Profile_ID", type: "INTEGER", key: "PK", desc: "Profile surrogate identifier" },
      { name: "Class", type: "VARCHAR(15)", key: "Attribute", desc: "Cabin tier: Business, Eco, Eco Plus" },
      { name: "Type_of_Travel", type: "VARCHAR(20)", key: "Attribute", desc: "Business travel, Personal Travel" }
    ],
    sampleRecords: [
      { Flight_Profile_ID: 1, Class: "Eco Plus", Type_of_Travel: "Personal Travel" },
      { Flight_Profile_ID: 2, Class: "Business", Type_of_Travel: "Business travel" },
      { Flight_Profile_ID: 3, Class: "Eco", Type_of_Travel: "Personal Travel" },
      { Flight_Profile_ID: 4, Class: "Eco", Type_of_Travel: "Business travel" },
      { Flight_Profile_ID: 5, Class: "Eco Plus", Type_of_Travel: "Business travel" },
      { Flight_Profile_ID: 6, Class: "Business", Type_of_Travel: "Personal Travel" }
    ]
  },

  Dim_Date: {
    name: "Dim_Date",
    type: "DIMENSION",
    color: "emerald",
    rowCount: 1313,
    pk: "Date_ID",
    fkInFact: "Date_ID",
    description: "Temporal dimension table enabling hierarchical roll-ups from day to month, season, and year.",
    columns: [
      { name: "Date_ID", type: "INTEGER", key: "PK", desc: "Date dimension surrogate key" },
      { name: "Date", type: "DATE", key: "Attribute", desc: "Full calendar date (YYYY-MM-DD)" },
      { name: "Year", type: "SMALLINT", key: "Hierarchy (Top)", desc: "Calendar year (2022 - 2024)" },
      { name: "Month", type: "TINYINT", key: "Hierarchy (Mid)", desc: "Calendar month (1 - 12)" },
      { name: "Day_of_Week", type: "VARCHAR(12)", key: "Attribute", desc: "Monday through Sunday" },
      { name: "Season", type: "VARCHAR(10)", key: "Hierarchy (Mid)", desc: "Winter, Spring, Summer, Fall" },
      { name: "Holiday_Rush_Flag", type: "BOOLEAN (0/1)", key: "Attribute", desc: "Peak holiday season indicator" }
    ],
    sampleRecords: [
      { Date_ID: 1127, Date: "2023-11-14", Year: 2023, Month: 11, Day_of_Week: "Tuesday", Season: "Fall", Holiday_Rush_Flag: 0 },
      { Date_ID: 861, Date: "2023-02-21", Year: 2023, Month: 2, Day_of_Week: "Tuesday", Season: "Winter", Holiday_Rush_Flag: 0 },
      { Date_ID: 1045, Date: "2023-08-24", Year: 2023, Month: 8, Day_of_Week: "Thursday", Season: "Summer", Holiday_Rush_Flag: 1 },
      { Date_ID: 412, Date: "2022-04-18", Year: 2022, Month: 4, Day_of_Week: "Monday", Season: "Spring", Holiday_Rush_Flag: 0 },
      { Date_ID: 1300, Date: "2024-05-06", Year: 2024, Month: 5, Day_of_Week: "Monday", Season: "Spring", Holiday_Rush_Flag: 0 }
    ]
  },

  Dim_Route: {
    name: "Dim_Route",
    type: "DIMENSION",
    color: "amber",
    rowCount: 10,
    pk: "Route_ID",
    fkInFact: "Route_ID",
    description: "Airport origin-destination pairs and domestic vs international classification.",
    columns: [
      { name: "Route_ID", type: "INTEGER", key: "PK", desc: "Route identifier" },
      { name: "Origin_Airport_Code", type: "VARCHAR(5)", key: "Attribute", desc: "IATA 3-letter origin code (DEL, BOM, JFK, DXB)" },
      { name: "Dest_Airport_Code", type: "VARCHAR(5)", key: "Attribute", desc: "IATA 3-letter destination code (BOM, BLR, LHR)" },
      { name: "Flight_Type", type: "VARCHAR(15)", key: "Attribute", desc: "Domestic vs International flight" }
    ],
    sampleRecords: [
      { Route_ID: 1, Origin_Airport_Code: "DEL", Dest_Airport_Code: "BOM", Flight_Type: "Domestic" },
      { Route_ID: 2, Origin_Airport_Code: "BOM", Dest_Airport_Code: "BLR", Flight_Type: "Domestic" },
      { Route_ID: 3, Origin_Airport_Code: "JFK", Dest_Airport_Code: "LHR", Flight_Type: "International" },
      { Route_ID: 4, Origin_Airport_Code: "DXB", Dest_Airport_Code: "LHR", Flight_Type: "International" },
      { Route_ID: 5, Origin_Airport_Code: "SIN", Dest_Airport_Code: "HND", Flight_Type: "International" }
    ]
  },

  Dim_Aircraft: {
    name: "Dim_Aircraft",
    type: "DIMENSION",
    color: "sky",
    rowCount: 8,
    pk: "Aircraft_ID",
    fkInFact: "Aircraft_ID",
    description: "Fleet hardware specifications, airframe vintage, and onboard satellite connectivity tier.",
    columns: [
      { name: "Aircraft_ID", type: "INTEGER", key: "PK", desc: "Aircraft surrogate key" },
      { name: "Manufacturer", type: "VARCHAR(20)", key: "Attribute", desc: "Boeing, Airbus, Embraer" },
      { name: "Model", type: "VARCHAR(25)", key: "Attribute", desc: "777-300ER, 737-MAX, A350, A320neo, A380" },
      { name: "Aircraft_Age_Years", type: "INTEGER", key: "Attribute", desc: "Airframe age in years" },
      { name: "Wifi_Type", type: "VARCHAR(15)", key: "Attribute", desc: "High-Speed (Ka/Ku-band) vs Basic" }
    ],
    sampleRecords: [
      { Aircraft_ID: 1, Manufacturer: "Boeing", Model: "777-300ER", Aircraft_Age_Years: 8, Wifi_Type: "High-Speed" },
      { Aircraft_ID: 2, Manufacturer: "Boeing", Model: "737-MAX", Aircraft_Age_Years: 2, Wifi_Type: "High-Speed" },
      { Aircraft_ID: 3, Manufacturer: "Airbus", Model: "A320neo", Aircraft_Age_Years: 3, Wifi_Type: "High-Speed" },
      { Aircraft_ID: 4, Manufacturer: "Airbus", Model: "A380", Aircraft_Age_Years: 12, Wifi_Type: "Basic" },
      { Aircraft_ID: 5, Manufacturer: "Airbus", Model: "A350", Aircraft_Age_Years: 4, Wifi_Type: "High-Speed" }
    ]
  },

  Dim_Weather: {
    name: "Dim_Weather",
    type: "DIMENSION",
    color: "blue",
    rowCount: 5,
    pk: "Weather_ID",
    fkInFact: "Weather_ID",
    description: "Runway meteorological conditions at the time of pushback.",
    columns: [
      { name: "Weather_ID", type: "INTEGER", key: "PK", desc: "Weather key" },
      { name: "Departure_Conditions", type: "VARCHAR(20)", key: "Attribute", desc: "Clear, Rain, Snow, Storm, Fog" }
    ],
    sampleRecords: [
      { Weather_ID: 1, Departure_Conditions: "Clear" },
      { Weather_ID: 2, Departure_Conditions: "Rain" },
      { Weather_ID: 3, Departure_Conditions: "Snow" },
      { Weather_ID: 4, Departure_Conditions: "Storm" },
      { Weather_ID: 5, Departure_Conditions: "Fog" }
    ]
  },

  Dim_Crew: {
    name: "Dim_Crew",
    type: "DIMENSION",
    color: "rose",
    rowCount: 9,
    pk: "Crew_ID",
    fkInFact: "Crew_ID",
    description: "Inflight service team staffing complement and purser experience level.",
    columns: [
      { name: "Crew_ID", type: "INTEGER", key: "PK", desc: "Flight attendant team identifier" },
      { name: "Lead_Attendant_Seniority", type: "VARCHAR(15)", key: "Attribute", desc: "Senior (10+ yrs), Mid-Level (5-10 yrs), Junior (<5 yrs)" },
      { name: "Crew_Size", type: "INTEGER", key: "Attribute", desc: "Active crew headcount on the flight" }
    ],
    sampleRecords: [
      { Crew_ID: 1, Lead_Attendant_Seniority: "Senior", Crew_Size: 12 },
      { Crew_ID: 2, Lead_Attendant_Seniority: "Mid-Level", Crew_Size: 8 },
      { Crew_ID: 3, Lead_Attendant_Seniority: "Junior", Crew_Size: 6 },
      { Crew_ID: 4, Lead_Attendant_Seniority: "Senior", Crew_Size: 10 },
      { Crew_ID: 5, Lead_Attendant_Seniority: "Mid-Level", Crew_Size: 10 }
    ]
  }
};

// Radial layout positioning for interactive SVG Star Schema diagram (canvas coordinate system 1000 x 680)
export const STAR_SCHEMA_LAYOUT = [
  { id: "Dim_Passenger", x: 170, y: 110, angle: -140 },
  { id: "Dim_Flight_Profile", x: 500, y: 70, angle: -90 },
  { id: "Dim_Date", x: 830, y: 110, angle: -40 },
  { id: "Dim_Route", x: 880, y: 350, angle: 10 },
  { id: "Dim_Aircraft", x: 790, y: 570, angle: 55 },
  { id: "Dim_Weather", x: 450, y: 610, angle: 95 },
  { id: "Dim_Crew", x: 170, y: 550, angle: 145 },
];

export const FACT_NODE_LAYOUT = { x: 500, y: 340 };

// Fallback OLAP responses if FastAPI is offline
export const FALLBACK_OLAP_DATA = {
  rollupSeason: [
    { Season: "Fall", record_count: 2470, satisfaction_rate: 42.15, avg_departure_delay: 15.34, avg_ticket_price: 243.60 },
    { Season: "Spring", record_count: 2515, satisfaction_rate: 44.20, avg_departure_delay: 13.90, avg_ticket_price: 246.12 },
    { Season: "Summer", record_count: 2608, satisfaction_rate: 46.85, avg_departure_delay: 17.20, avg_ticket_price: 258.90 },
    { Season: "Winter", record_count: 2407, satisfaction_rate: 39.40, avg_departure_delay: 19.85, avg_ticket_price: 239.50 }
  ],
  rollupYear: [
    { Year: 2022, record_count: 3290, satisfaction_rate: 41.50, avg_departure_delay: 17.80, avg_ticket_price: 238.10 },
    { Year: 2023, record_count: 3420, satisfaction_rate: 43.85, avg_departure_delay: 16.10, avg_ticket_price: 247.90 },
    { Year: 2024, record_count: 3290, satisfaction_rate: 45.20, avg_departure_delay: 15.40, avg_ticket_price: 254.20 }
  ],
  drilldownBusiness: [
    { Model: "777-300ER", Wifi_Type: "High-Speed", passengers: 1240, satisfaction_rate: 88.5, avg_wifi_rating: 4.62, avg_entertainment: 4.51 },
    { Model: "787 Dreamliner", Wifi_Type: "High-Speed", passengers: 1110, satisfaction_rate: 89.2, avg_wifi_rating: 4.68, avg_entertainment: 4.58 },
    { Model: "A350", Wifi_Type: "High-Speed", passengers: 950, satisfaction_rate: 87.9, avg_wifi_rating: 4.55, avg_entertainment: 4.49 },
    { Model: "A380", Wifi_Type: "Basic", passengers: 420, satisfaction_rate: 68.4, avg_wifi_rating: 2.85, avg_entertainment: 4.12 },
    { Model: "737-MAX", Wifi_Type: "High-Speed", passengers: 530, satisfaction_rate: 76.8, avg_wifi_rating: 4.31, avg_entertainment: 3.82 },
    { Model: "A320neo", Wifi_Type: "High-Speed", passengers: 310, satisfaction_rate: 74.2, avg_wifi_rating: 4.18, avg_entertainment: 3.75 },
    { Model: "E190", Wifi_Type: "Basic", passengers: 180, satisfaction_rate: 52.3, avg_wifi_rating: 2.10, avg_entertainment: 2.95 },
    { Model: "737-800", Wifi_Type: "Basic", passengers: 220, satisfaction_rate: 48.9, avg_wifi_rating: 1.95, avg_entertainment: 2.80 }
  ],
  drilldownEco: [
    { Model: "737-MAX", Wifi_Type: "High-Speed", passengers: 1350, satisfaction_rate: 26.4, avg_wifi_rating: 3.20, avg_entertainment: 2.85 },
    { Model: "A320neo", Wifi_Type: "High-Speed", passengers: 1190, satisfaction_rate: 25.8, avg_wifi_rating: 3.15, avg_entertainment: 2.80 },
    { Model: "737-800", Wifi_Type: "Basic", passengers: 890, satisfaction_rate: 14.2, avg_wifi_rating: 1.80, avg_entertainment: 2.10 },
    { Model: "E190", Wifi_Type: "Basic", passengers: 740, satisfaction_rate: 16.5, avg_wifi_rating: 1.95, avg_entertainment: 2.25 },
    { Model: "787 Dreamliner", Wifi_Type: "High-Speed", passengers: 450, satisfaction_rate: 34.2, avg_wifi_rating: 3.65, avg_entertainment: 3.40 }
  ],
  sliceDisloyal: [
    { Type_of_Travel: "Business travel", passengers: 1540, satisfaction_rate: 32.40, avg_price: 215.40 },
    { Type_of_Travel: "Personal Travel", passengers: 320, satisfaction_rate: 11.25, avg_price: 162.80 }
  ],
  diceWinterBusiness: {
    filter_criteria: { class: "Business", season: "Winter", min_delay: 15 },
    passengers_matched: 342,
    satisfaction_rate_pct: 64.33,
    avg_departure_delay_min: 44.80,
    avg_arrival_delay_min: 48.15
  },
  pivotMatrix: {
    row_dimension: "Origin_Airport_Code",
    col_dimension: "Class",
    rows: ["BOM", "DEL", "DXB", "JFK", "LHR", "SIN"],
    columns: ["Business", "Eco", "Eco Plus"],
    matrix: [
      [84.2, 22.1, 28.5],
      [85.6, 23.4, 29.8],
      [88.9, 26.5, 33.1],
      [87.4, 24.2, 30.5],
      [86.8, 25.1, 31.9],
      [89.5, 27.8, 34.2]
    ]
  }
};

// Model Metrics & Feature Importance Drivers
export const MODEL_EVALUATION = {
  modelName: "Voting Ensemble Classifier (LightGBM + XGBoost + CatBoost + Logistic Regression)",
  accuracyPct: 94.8,
  rocAuc: 0.9811,
  precisionPct: 94.0,
  recallPct: 90.0,
  f1ScorePct: 92.0,
  testSetSize: 2000,
  confusionMatrix: {
    tn: 1090, // True Negative (Correctly predicted Dissatisfied)
    tp: 775,  // True Positive (Correctly predicted Satisfied)
    fp: 48,   // False Positive (Type I Error)
    fn: 87    // False Negative (Type II Error)
  },
  topFeatures: [
    { rank: 1, feature: "Online_boarding", importance: 0.112, category: "Digital UX", effect: "Positive", note: "Seamless digital check-in is the #1 leading catalyst for passenger loyalty and satisfaction." },
    { rank: 2, feature: "Inflight_wifi_service", importance: 0.098, category: "Cabin Connectivity", effect: "Positive", note: "High-speed broadband Wi-Fi availability heavily dominates ratings among modern business travelers." },
    { rank: 3, feature: "Type_of_Travel_Personal Travel", importance: 0.070, category: "Travel Context", effect: "Negative", note: "Personal/leisure travelers are more price sensitive and report lower baseline tolerance." },
    { rank: 4, feature: "Class_Business", importance: 0.052, category: "Cabin Tier", effect: "Positive", note: "Premium Business seating drastically increases positive perception across all cabin services." },
    { rank: 5, feature: "Seat_comfort", importance: 0.048, category: "Cabin Hardware", effect: "Positive", note: "Ergonomics and leg posture on flights exceeding 2 hours directly affect bodily fatigue." },
    { rank: 6, feature: "Inflight_entertainment", importance: 0.045, category: "Cabin Hardware", effect: "Positive", note: "High-resolution seatback monitors and audio/movie catalog quality." },
    { rank: 7, feature: "Flight_Distance", importance: 0.041, category: "Flight Logistics", effect: "Neutral", note: "Long-haul flights amplify passengers' sensitivity to seat pitch and service frequency." },
    { rank: 8, feature: "Leg_room_service", importance: 0.039, category: "Cabin Hardware", effect: "Positive", note: "Physical seat pitch and under-seat baggage clear space." },
    { rank: 9, feature: "Ticket_Price", importance: 0.036, category: "Financial/Commercial", effect: "Negative", note: "Higher fare without perceived premium value yields heightened critique." },
    { rank: 10, feature: "Discount_Percent", importance: 0.034, category: "Financial/Commercial", effect: "Positive", note: "Promotional discounts foster positive perception and forgiveness of minor hiccups." },
    { rank: 11, feature: "On-board_service", importance: 0.031, category: "Crew & Service", effect: "Positive", note: "Promptness and warmth of flight attendant response to cabin call buttons." },
    { rank: 12, feature: "Cleanliness", importance: 0.029, category: "Cabin Hardware", effect: "Positive", note: "Sanitized tray tables, seat cushions, and pristine lavatories." },
    { rank: 13, feature: "Ease_of_Online_booking", importance: 0.027, category: "Digital UX", effect: "Positive", note: "Flight search speed, frictionless seat reservation, and payment experience." },
    { rank: 14, feature: "Baggage_handling", importance: 0.025, category: "Airport Operations", effect: "Positive", note: "Luggage transit reliability and minimal carousel wait time." },
    { rank: 15, feature: "Checkin_service", importance: 0.023, category: "Airport Operations", effect: "Positive", note: "Ground counter staff friendliness and boarding gate baggage checking efficiency." }
  ]
};

// Presets for the Interactive Simulator
export const SIMULATOR_PRESETS = [
  {
    id: "happy_exec",
    name: "Happy Executive",
    badge: "High Satisfaction Probability",
    description: "Business class executive with top-tier ratings, 0 min delay, and high-speed Wi-Fi.",
    values: {
      Gender: "Female",
      Age: 38,
      Customer_Type: "Loyal Customer",
      Class: "Business",
      Type_of_Travel: "Business travel",
      Flight_Distance: 1850,
      Departure_Delay_in_Minutes: 0,
      Arrival_Delay_in_Minutes: 0,
      Inflight_wifi_service: 5,
      Departure_Arrival_time_convenient: 4,
      Ease_of_Online_booking: 5,
      Gate_location: 4,
      Food_and_drink: 5,
      Online_boarding: 5,
      Seat_comfort: 5,
      Inflight_entertainment: 5,
      On_board_service: 5,
      Leg_room_service: 5,
      Baggage_handling: 5,
      Checkin_service: 5,
      Inflight_service: 5,
      Cleanliness: 5,
      Ticket_Price: 480.0,
      Discount_Percent: 5.0,
      Year: 2024,
      Month: 7,
      Day_of_Week: "Monday",
      Season: "Summer",
      Holiday_Rush_Flag: 0,
      Origin_Airport_Code: "DEL",
      Dest_Airport_Code: "BOM",
      Flight_Type: "Domestic",
      Manufacturer: "Boeing",
      Model: "777-300ER",
      Aircraft_Age_Years: 3,
      Wifi_Type: "High-Speed",
      Departure_Conditions: "Clear",
      Lead_Attendant_Seniority: "Senior",
      Crew_Size: 10
    }
  },
  {
    id: "frustrated_budget",
    name: "Frustrated Budget Flyer",
    badge: "High Churn Risk",
    description: "Economy passenger experiencing 55 min departure delay, poor Wi-Fi, and low legroom.",
    values: {
      Gender: "Male",
      Age: 25,
      Customer_Type: "disloyal Customer",
      Class: "Eco",
      Type_of_Travel: "Personal Travel",
      Flight_Distance: 620,
      Departure_Delay_in_Minutes: 55,
      Arrival_Delay_in_Minutes: 68,
      Inflight_wifi_service: 1,
      Departure_Arrival_time_convenient: 2,
      Ease_of_Online_booking: 2,
      Gate_location: 2,
      Food_and_drink: 1,
      Online_boarding: 1,
      Seat_comfort: 2,
      Inflight_entertainment: 1,
      On_board_service: 2,
      Leg_room_service: 1,
      Baggage_handling: 2,
      Checkin_service: 2,
      Inflight_service: 2,
      Cleanliness: 2,
      Ticket_Price: 110.0,
      Discount_Percent: 20.0,
      Year: 2024,
      Month: 12,
      Day_of_Week: "Friday",
      Season: "Winter",
      Holiday_Rush_Flag: 1,
      Origin_Airport_Code: "JFK",
      Dest_Airport_Code: "LHR",
      Flight_Type: "International",
      Manufacturer: "Boeing",
      Model: "737-800",
      Aircraft_Age_Years: 14,
      Wifi_Type: "Basic",
      Departure_Conditions: "Snow",
      Lead_Attendant_Seniority: "Junior",
      Crew_Size: 6
    }
  },
  {
    id: "long_haul_vacationer",
    name: "Long-Haul Vacationer",
    badge: "Balanced Moderate Profile",
    description: "Personal travel in Eco Plus, moderate entertainment rating, minor delays.",
    values: {
      Gender: "Female",
      Age: 46,
      Customer_Type: "Loyal Customer",
      Class: "Eco Plus",
      Type_of_Travel: "Personal Travel",
      Flight_Distance: 2400,
      Departure_Delay_in_Minutes: 12,
      Arrival_Delay_in_Minutes: 8,
      Inflight_wifi_service: 3,
      Departure_Arrival_time_convenient: 3,
      Ease_of_Online_booking: 4,
      Gate_location: 3,
      Food_and_drink: 3,
      Online_boarding: 3,
      Seat_comfort: 3,
      Inflight_entertainment: 4,
      On_board_service: 4,
      Leg_room_service: 3,
      Baggage_handling: 4,
      Checkin_service: 3,
      Inflight_service: 4,
      Cleanliness: 4,
      Ticket_Price: 285.0,
      Discount_Percent: 10.0,
      Year: 2024,
      Month: 6,
      Day_of_Week: "Saturday",
      Season: "Summer",
      Holiday_Rush_Flag: 0,
      Origin_Airport_Code: "SIN",
      Dest_Airport_Code: "HND",
      Flight_Type: "International",
      Manufacturer: "Airbus",
      Model: "A350",
      Aircraft_Age_Years: 4,
      Wifi_Type: "High-Speed",
      Departure_Conditions: "Clear",
      Lead_Attendant_Seniority: "Mid-Level",
      Crew_Size: 9
    }
  }
];

// Generates a clean sample CSV string ready for download & batch test
export const GENERATE_SAMPLE_CSV_CONTENT = () => {
  const headers = [
    "Gender", "Age", "Customer_Type", "Class", "Type_of_Travel", "Flight_Distance",
    "Departure_Delay_in_Minutes", "Arrival_Delay_in_Minutes", "Inflight_wifi_service",
    "Departure_Arrival_time_convenient", "Ease_of_Online_booking", "Gate_location",
    "Food_and_drink", "Online_boarding", "Seat_comfort", "Inflight_entertainment",
    "On_board_service", "Leg_room_service", "Baggage_handling", "Checkin_service",
    "Inflight_service", "Cleanliness", "Ticket_Price", "Discount_Percent",
    "Year", "Month", "Day_of_Week", "Season", "Holiday_Rush_Flag",
    "Origin_Airport_Code", "Dest_Airport_Code", "Flight_Type",
    "Manufacturer", "Model", "Aircraft_Age_Years", "Wifi_Type",
    "Departure_Conditions", "Lead_Attendant_Seniority", "Crew_Size"
  ].join(",");

  const rows = [
    "Male,35,Loyal Customer,Business,Business travel,1200,5,0,4,4,4,3,4,5,5,4,4,4,4,4,4,4,320.0,5.0,2024,6,Friday,Summer,0,DEL,BOM,Domestic,Boeing,777-300ER,5,High-Speed,Clear,Senior,10",
    "Female,28,disloyal Customer,Eco,Personal Travel,650,45,50,2,2,3,2,1,2,2,2,3,2,3,2,3,2,120.0,15.0,2024,3,Sunday,Spring,0,BOM,BLR,Domestic,Airbus,A320neo,3,High-Speed,Rain,Junior,6",
    "Female,42,Loyal Customer,Business,Business travel,2400,0,0,5,4,5,4,5,5,5,5,5,5,5,5,5,5,540.0,0.0,2024,8,Monday,Summer,0,JFK,LHR,International,Airbus,A350,4,High-Speed,Clear,Senior,12",
    "Male,58,Loyal Customer,Eco Plus,Business travel,980,15,10,3,3,3,3,3,4,4,4,3,4,4,3,4,4,220.0,8.0,2024,10,Wednesday,Fall,0,DXB,LHR,International,Boeing,787 Dreamliner,5,High-Speed,Clear,Mid-Level,8",
    "Male,22,disloyal Customer,Eco,Personal Travel,340,30,42,1,1,2,3,1,1,1,1,2,1,2,2,2,1,95.0,25.0,2024,1,Saturday,Winter,1,DEL,BOM,Domestic,Embraer,E190,10,Basic,Fog,Junior,6"
  ].join("\n");

  return `${headers}\n${rows}`;
};
