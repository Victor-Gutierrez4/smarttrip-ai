const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export default function TripSummary({ summary, selectedHotel }) {
  const rows = [
    ['Hotel total', summary.hotelTotal],
    ['Food', summary.foodTotal],
    ['Transportation', summary.transportationTotal],
    ['Flight estimate', summary.flightTotal]
  ];

  return (
    <section className="summary-panel">
      <div>
        <p className="eyebrow">Estimated Total</p>
        <h2>{money.format(summary.estimatedTotal)}</h2>
        <span>
          {money.format(summary.dailyAverage)} daily ground average
          {selectedHotel ? ` | ${money.format(summary.hotelNightly)} nightly hotel estimate` : ''}
        </span>
      </div>
      <ul>
        {selectedHotel && (
          <li>
            <span>Selected hotel</span>
            <strong>{selectedHotel.name}</strong>
          </li>
        )}
        {rows.map(([label, value]) => (
          <li key={label}>
            <span>{label}</span>
            <strong>{money.format(value)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
