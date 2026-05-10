export default function RestaurantCard({ restaurant }) {
  return (
    <a className="result-card interactive-result" href={restaurant.placeUrl} target="_blank" rel="noreferrer">
      <div>
        <h3>{restaurant.name}</h3>
        <p>{restaurant.cuisine}</p>
      </div>
      <div className="result-meta">
        <span>{restaurant.rating.toFixed(1)} rating</span>
        <strong>{restaurant.priceCategory}</strong>
      </div>
      <div className="place-preview" role="tooltip">
        <strong>{restaurant.name}</strong>
        <span>{restaurant.rating.toFixed(1)} rating · {restaurant.priceCategory}</span>
        <span>{restaurant.address || restaurant.cuisine}</span>
        <em>Open Google Maps page</em>
      </div>
    </a>
  );
}
