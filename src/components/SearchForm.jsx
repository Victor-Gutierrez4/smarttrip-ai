import BudgetSelector from './BudgetSelector';

export default function SearchForm({ form, onChange, onSubmit }) {
  const updateField = (field, value) => onChange({ ...form, [field]: value });

  return (
    <form className="planner-panel" onSubmit={onSubmit}>
      <div className="row g-3">
        <div className="col-md-7">
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
        <div className="col-md-5">
          <label className="form-label" htmlFor="duration">Duration</label>
          <input
            className="form-control"
            id="duration"
            min="1"
            type="number"
            value={form.duration}
            onChange={(event) => updateField('duration', event.target.value)}
          />
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
