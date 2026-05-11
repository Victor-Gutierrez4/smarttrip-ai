function mapEmbedUrl(place) {
  const query = encodeURIComponent(`${place.name || ''} ${place.distance || ''}`.trim());
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export default function HotelCard({ hotel, isSelected, onSelect }) {
  return (
    <div className={`result-card interactive-result ${isSelected ? 'selected-result' : ''}`}>
      <button type="button" className="interactive-card-button" onClick={onSelect}>
        <div>
          <h3>
            <a
              className="place-name-link"
              href={hotel.placeUrl}
              onClick={(event) => event.stopPropagation()}
              rel="noreferrer"
              target="_blank"
            >
              {hotel.name}
            </a>
          </h3>
          <p>{hotel.distance}</p>
          {hotel.priceContext && <p className="price-context">{hotel.priceContext}</p>}
        </div>
        <div className="result-meta">
          <span>{hotel.rating.toFixed(1)} rating</span>
          <strong>${hotel.estimatedPrice}/night est.</strong>
          {isSelected && <small>Used in budget</small>}
        </div>
      </button>
      <div className="place-preview" role="tooltip">
        <div className="mini-map-frame">
          <iframe
            title={`${hotel.name} map preview`}
            src={mapEmbedUrl(hotel)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <strong>{hotel.name}</strong>
        <span>{hotel.rating.toFixed(1)} rating</span>
        <span>${hotel.estimatedPrice}/night estimate | {hotel.distance}</span>
        {hotel.priceContext && <span>{hotel.priceContext}</span>}
        <span>{isSelected ? 'Selected hotel used in budget' : 'Tap to use in trip budget'}</span>
      </div>
    </div>
  );
}
