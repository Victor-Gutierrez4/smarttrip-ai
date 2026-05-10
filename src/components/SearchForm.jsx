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
          <label className="form-label" htmlFor="startLocation">Starting Location</label>
          <input
            className="form-control"
            id="startLocation"
            placeholder="Los Angeles, CA"
            value={form.startLocation}
            onChange={(event) => updateField('startLocation', event.target.value)}
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
        <div className="col-md-6">
          <label className="form-label" htmlFor="travelers">Travelers</label>
          <input
            className="form-control"
            id="travelers"
            type="number"
            min="1"
            max="10"
            value={form.travelers}
            onChange={(event) => updateField('travelers', Number(event.target.value))}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="roundTrip">Round Trip</label>
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              id="roundTrip"
              type="checkbox"
              checked={form.roundTrip}
              onChange={(event) => updateField('roundTrip', event.target.checked)}
            />
            <label className="form-check-label" htmlFor="roundTrip">
              Include return travel cost in budget
            </label>
          </div>
        </div>
        <div className="col-12">
          <div className="budget-range-header">
            <label className="form-label" htmlFor="maxBudget">Budget Per Night</label>
            <strong>{money.format(Number(form.maxBudget))}+</strong>
          </div>
          <input
            className="form-range budget-range"
            id="maxBudget"
            max="600"
            min="100"
            step="25"
            type="range"
            value={form.maxBudget}
            onChange={(event) => updateField('maxBudget', Number(event.target.value))}
          />
          <div className="range-labels">
            <span>$100</span>
            <span>{money.format(Number(form.maxBudget) * duration)} total selected budget</span>
            <span>$600+</span>
          </div>
        </div>
        <div className="col-12">
          <button className="btn btn-primary w-100" type="submit">Generate Trip Plan</button>
        </div>
      </div>
    </form>
  );
}
