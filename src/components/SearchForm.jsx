import BudgetSelector from './BudgetSelector';
import { calculateTripDuration, getMinEndDate } from '../services/dateRange';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export default function SearchForm({ form, onChange, onSubmit }) {
  const duration = calculateTripDuration(form.startDate, form.endDate);
  const updateField = (field, value) => {
    const nextForm = { ...form, [field]: value };

    if (field === 'startDate' && nextForm.endDate < value) {
      nextForm.endDate = value;
    }

    onChange(nextForm);
  };

  return (
    <form className="planner-panel" onSubmit={onSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label" htmlFor="destination">Destination</label>
          <input
            className="form-control"
            id="destination"
            placeholder="Tokyo, Japan"
            value={form.destination}
            onChange={(event) => updateField('destination', event.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="startDate">Start Date</label>
          <input
            className="form-control"
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="endDate">End Date</label>
          <input
            className="form-control"
            id="endDate"
            min={getMinEndDate(form.startDate)}
            type="date"
            value={form.endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
            required
          />
        </div>
        <div className="col-12">
          <div className="duration-chip">{duration} day trip</div>
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="points">Points of Interest</label>
          <textarea
            className="form-control"
            id="points"
            placeholder="Shibuya Crossing, Tokyo Tower, Akihabara"
            rows="3"
            value={form.pointsText}
            onChange={(event) => updateField('pointsText', event.target.value)}
          />
        </div>
        <div className="col-12">
          <div className="budget-range-header">
            <label className="form-label" htmlFor="maxBudget">Trip Budget</label>
            <strong>{money.format(Number(form.maxBudget))}</strong>
          </div>
          <input
            className="form-range budget-range"
            id="maxBudget"
            max="5000"
            min="150"
            step="50"
            type="range"
            value={form.maxBudget}
            onChange={(event) => updateField('maxBudget', Number(event.target.value))}
          />
          <div className="range-labels">
            <span>$150</span>
            <span>{money.format(Math.round(Number(form.maxBudget) / duration))} per day</span>
            <span>$5,000</span>
          </div>
        </div>
        <div className="col-12">
          <label className="form-label d-block">Travel Style</label>
          <BudgetSelector value={form.budgetLevel} onChange={(value) => updateField('budgetLevel', value)} />
        </div>
        <div className="col-12">
          <button className="btn btn-primary w-100" type="submit">Generate Trip Plan</button>
        </div>
      </div>
    </form>
  );
}
