export default function HotelCard({ hotel }) {
  return (
    <article className="result-card">
      <div>
        <h3>{hotel.name}</h3>
        <p>{hotel.distance}</p>
      </div>
      <div className="result-meta">
        <span>{hotel.rating.toFixed(1)} rating</span>
        <strong>${hotel.estimatedPrice}/night</strong>
      </div>
    </article>
  );
}
