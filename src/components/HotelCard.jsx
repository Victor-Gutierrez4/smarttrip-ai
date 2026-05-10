export default function HotelCard({ hotel, isSelected, onSelect }) {
  return (
    <a
      className={`result-card interactive-result ${isSelected ? 'selected-result' : ''}`}
      href={hotel.placeUrl}
      target="_blank"
      rel="noreferrer"
      onClick={onSelect}
    >
      <div>
        <h3>{hotel.name}</h3>
        <p>{hotel.distance}</p>
      </div>
      <div className="result-meta">
        <span>{hotel.rating.toFixed(1)} rating</span>
        <strong>${hotel.estimatedPrice}/night est.</strong>
        {isSelected && <small>Used in budget</small>}
      </div>
      <div className="place-preview" role="tooltip">
        <strong>{hotel.name}</strong>
        <span>{hotel.rating.toFixed(1)} rating</span>
        <span>${hotel.estimatedPrice}/night estimate | {hotel.distance}</span>
        <em>Open Google Maps page</em>
      </div>
    </a>
  );
}
