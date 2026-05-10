function mapEmbedUrl(place) {
  const query = encodeURIComponent(`${place.name || ''} ${place.address || place.cuisine || ''}`.trim());
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export default function RestaurantCard({ restaurant, onViewMap }) {
  return (
    <div className="result-card interactive-result">
      <button type="button" className="interactive-card-button" onClick={onViewMap}>
        <div>
          <h3>
            <a
              className="place-name-link"
              href={restaurant.placeUrl}
              onClick={(event) => event.stopPropagation()}
              rel="noreferrer"
              target="_blank"
            >
              {restaurant.name}
            </a>
          </h3>
          <p>{restaurant.cuisine || restaurant.address}</p>
        </div>
        <div className="result-meta">
          <span>{restaurant.rating.toFixed(1)} rating</span>
          <strong>{restaurant.priceCategory}</strong>
        </div>
      </button>
      <div className="place-preview" role="tooltip">
        <div className="mini-map-frame">
          <iframe
            title={`${restaurant.name} map preview`}
            src={mapEmbedUrl(restaurant)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <strong>{restaurant.name}</strong>
        <span>{restaurant.rating.toFixed(1)} rating | {restaurant.priceCategory}</span>
        <span>{restaurant.address || restaurant.cuisine}</span>
        <div className="card-actions">
          <button type="button" className="map-button" onClick={onViewMap}>
            Preview on map
          </button>
          <span>Tap the card to preview or the name to open Google Maps</span>
        </div>
      </div>
    </div>
  );
}
