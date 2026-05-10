export default function RestaurantCard({ restaurant, onViewMap }) {
  return (
    <div className="result-card interactive-result">
      <div>
        <h3>{restaurant.name}</h3>
        <p>{restaurant.cuisine || restaurant.address}</p>
      </div>
      <div className="result-meta">
        <span>{restaurant.rating.toFixed(1)} rating</span>
        <strong>{restaurant.priceCategory}</strong>
      </div>
      <div className="place-preview" role="tooltip">
        <strong>{restaurant.name}</strong>
        <span>{restaurant.rating.toFixed(1)} rating · {restaurant.priceCategory}</span>
        <span>{restaurant.address || restaurant.cuisine}</span>
        <button type="button" className="map-button" onClick={onViewMap}>
          Preview on map
        </button>
      </div>
    </div>
  );
}
