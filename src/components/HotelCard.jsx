export default function HotelCard({ hotel }) {
  return (
    <a className="result-card interactive-result" href={hotel.placeUrl} target="_blank" rel="noreferrer">
      <div>
        <h3>{hotel.name}</h3>
        <p>{hotel.distance}</p>
      </div>
      <div className="result-meta">
        <span>{hotel.rating.toFixed(1)} rating</span>
        <strong>${hotel.estimatedPrice}/night</strong>
      </div>
      <div className="place-preview" role="tooltip">
        <strong>{hotel.name}</strong>
        <span>{hotel.rating.toFixed(1)} rating</span>
        <span>{hotel.distance}</span>
        <em>Open Google Maps page</em>
      </div>
    </a>
  );
}
