const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export default function TripSummary({ summary, selectedHotel }) {
  const isOverBudget = summary.budgetRemaining < 0;
  const isTightBudget = summary.dailyBudget < 180;
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
        <div className={`budget-status ${isOverBudget ? 'over-budget' : 'within-budget'}`}>
          <strong>{isOverBudget ? 'Over selected budget' : 'Within selected budget'}</strong>
          <span>
            {money.format(Math.abs(summary.budgetRemaining))}
            {isOverBudget ? ' over' : ' remaining'} from {money.format(summary.budgetLimit)}
          </span>
        </div>
        {(isOverBudget || isTightBudget) && (
          <div className="budget-guidance">
            <strong>Budget guidance</strong>
            <span>
              This budget is tight for the selected dates. Choose fewer days, raise the trip budget, or look for lower-rated
              areas farther from the main attractions.
            </span>
          </div>
        )}
      </div>
      <ul>
        <li>
          <span>Selected trip budget</span>
          <strong>{money.format(summary.budgetLimit)}</strong>
        </li>
        <li>
          <span>Budget per day</span>
          <strong>{money.format(summary.dailyBudget)}</strong>
        </li>
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
