export default function HotelCard({ hotel, isSelected, onSelect, onViewMap }) {
  return (
    <div className={`result-card interactive-result ${isSelected ? 'selected-result' : ''}`}>
      <button type="button" className="interactive-card-button" onClick={onSelect}>
        <div>
          <h3>{hotel.name}</h3>
          <p>{hotel.distance}</p>
        </div>
        <div className="result-meta">
          <span>{hotel.rating.toFixed(1)} rating</span>
          <strong>${hotel.estimatedPrice}/night est.</strong>
          {isSelected && <small>Used in budget</small>}
        </div>
      </button>
      <div className="place-preview" role="tooltip">
        <strong>{hotel.name}</strong>
        <span>{hotel.rating.toFixed(1)} rating</span>
        <span>${hotel.estimatedPrice}/night estimate | {hotel.distance}</span>
        <div className="card-actions">
          <button type="button" className="map-button" onClick={onViewMap}>
            Preview on map
          </button>
          <span>{isSelected ? 'Selected hotel used in budget' : 'Tap to use in trip budget'}</span>
        </div>
      </div>
    </div>
  );
}
