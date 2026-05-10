export default function RestaurantCard({ restaurant }) {
  return (
    <article className="result-card">
      <div>
        <h3>{restaurant.name}</h3>
        <p>{restaurant.cuisine}</p>
      </div>
      <div className="result-meta">
        <span>{restaurant.rating.toFixed(1)} rating</span>
        <strong>{restaurant.priceCategory}</strong>
      </div>
    </article>
  );
}
