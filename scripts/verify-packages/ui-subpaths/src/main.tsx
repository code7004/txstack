import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { TxAgGrid, TxAgGridProvider, type TxAgGridSort } from "@txstack/ui/aggrid";
import { TxDayPicker, TxDayPickerRange, TxFormDayPicker, type TxDateRange } from "@txstack/ui/daypicker";
import { TxForm } from "@txstack/ui";
import "@txstack/ui/styles.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Row {
  id: number;
  name: string;
}

function App() {
  const [sort, setSort] = useState<TxAgGridSort<Row>>({ value: "none" });
  const [range, setRange] = useState<TxDateRange>([undefined, undefined]);
  return (
    <TxAgGridProvider>
      <div style={{ height: 300, display: "flex", flexDirection: "column" }}>
        <TxAgGrid<Row> rowData={[{ id: 1, name: "kim" }]} option={{ headers: ["id", "name", "actions"], serverSortColumns: ["name"], customColumnDefs: [{ colId: "actions", cellRenderer: () => "edit" }] }} sortState={sort} onChangeSort={setSort} />
      </div>
      <TxDayPicker />
      <TxDayPickerRange value={range} onChange={setRange} />
      <TxForm noValidate onSubmit={() => undefined}>
        <TxFormDayPicker caption="날짜" />
      </TxForm>
    </TxAgGridProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
