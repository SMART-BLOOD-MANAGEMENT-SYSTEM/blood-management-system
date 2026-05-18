const inventoryRows = [
  { id: 1, bank_id: 1, blood_type: "O-", quantity_units: 7, expiration_date: "2026-06-10" },
  { id: 2, bank_id: 1, blood_type: "A+", quantity_units: 22, expiration_date: "2026-06-15" },
  { id: 3, bank_id: 1, blood_type: "B-", quantity_units: 9, expiration_date: "2026-06-18" },
  { id: 4, bank_id: 1, blood_type: "AB+", quantity_units: 15, expiration_date: "2026-06-20" },
];

function getStockLabel(quantityUnits: number) {
  if (quantityUnits < 8) {
    return "Low stock";
  }

  if (quantityUnits < 12) {
    return "Watch";
  }

  return "Stable";
}

export function AdminInventory() {
  return (
    <section className="admin-screen" id="admin-inventory">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Admin Inventory</h2>
        </div>
        <span>bank_id: 1</span>
      </div>

      <div className="admin-metric-grid">
        {inventoryRows.map((row) => (
          <article className="admin-metric" key={row.id}>
            <span>{row.blood_type}</span>
            <label className="stock-control">
              <span>Units</span>
              <input aria-label={`${row.blood_type} stock units`} min="0" readOnly type="number" value={row.quantity_units} />
            </label>
            <p>{getStockLabel(row.quantity_units)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
