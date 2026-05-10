import BudgetSelector from './BudgetSelector';
import { calculateTripDuration, getMinEndDate } from '../services/dateRange';

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
          <label className="form-label d-block">Budget</label>
          <BudgetSelector value={form.budgetLevel} onChange={(value) => updateField('budgetLevel', value)} />
        </div>
        <div className="col-12">
          <button className="btn btn-primary w-100" type="submit">Generate Trip Plan</button>
        </div>
      </div>
    </form>
  );
}
