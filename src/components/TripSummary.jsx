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
    [summary.travelCostLabel || 'Travel estimate', summary.flightTotal]
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
        <div className="budget-note">
          <span>{summary.travelers} traveler{summary.travelers === 1 ? '' : 's'}</span>
          <span>{summary.roundTrip ? 'Round trip included' : 'One-way travel only'}</span>
          <span>From {summary.startLocation || 'your starting location'} to {summary.destination}</span>
        </div>
        <div className={`budget-status ${isOverBudget ? 'over-budget' : 'within-budget'}`}>
          <strong>{isOverBudget ? 'Over selected budget' : 'Within selected budget'}</strong>
          <span>
            {money.format(Math.abs(summary.budgetRemaining))}
            {isOverBudget ? ' over' : ' remaining'} from {money.format(summary.budgetLimit)} total selected budget
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
          <span>Total selected budget</span>
          <strong>{money.format(summary.budgetLimit)}</strong>
        </li>
        <li>
          <span>Budget per night</span>
          <strong>{money.format(summary.dailyBudget)}</strong>
        </li>
        <li>
          <span>Budget per traveler</span>
          <strong>{money.format(summary.dailyBudgetPerPerson)}</strong>
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
