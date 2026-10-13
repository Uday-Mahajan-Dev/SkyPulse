import React, { useState } from "react";
import WarehouseMetadataCards from "./WarehouseMetadataCards";
import StarSchemaVisualizer from "./StarSchemaVisualizer";
import DataDictionaryView from "./DataDictionaryView";
import EdaDistributionStudio from "./EdaDistributionStudio";
import TableDetailsModal from "./TableDetailsModal";

export default function WarehouseSchemaView({ schemaData, theme }) {
  const [selectedTable, setSelectedTable] = useState(null);

  return (
    <div className="space-y-6">
      {/* Top Warehouse Cardinality & Architecture Scorecards */}
      <WarehouseMetadataCards schemaData={schemaData} theme={theme} />

      {/* Interactive Radial Star Schema Diagram */}
      <StarSchemaVisualizer
        onSelectTable={(tbl) => setSelectedTable(tbl)}
        theme={theme}
      />

      {/* Enterprise Data Dictionary Catalog */}
      <DataDictionaryView
        onSelectTable={(tbl) => setSelectedTable(tbl)}
        theme={theme}
      />

      {/* Dedicated Exploratory Data Analysis (EDA) & Distribution Studio */}
      <EdaDistributionStudio theme={theme} />

      {/* Detail Inspector Drawer / Modal */}
      {selectedTable && (
        <TableDetailsModal
          tableData={selectedTable}
          onClose={() => setSelectedTable(null)}
          theme={theme}
        />
      )}
    </div>
  );
}

