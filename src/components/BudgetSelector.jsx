import { budgetOptions } from '../services/budgetCalculator';

const labels = {
  budget: 'Budget',
  moderate: 'Moderate',
  luxury: 'Luxury'
};

export default function BudgetSelector({ value, onChange }) {
  return (
    <div className="budget-selector" aria-label="Budget level">
      {budgetOptions.map((option) => (
        <button
          className={`budget-option ${value === option ? 'active' : ''}`}
          key={option}
          type="button"
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
