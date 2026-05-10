const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export default function Itinerary({ days, summary }) {
  const dayCount = Math.max(days.length, 1);
  const dailyBreakdown = {
    hotel: summary ? summary.hotelNightly : 0,
    food: summary ? Math.round(summary.foodTotal / dayCount) : 0,
    transportation: summary ? Math.round(summary.transportationTotal / dayCount) : 0,
    total: summary ? summary.dailyAverage : 0
  };

  return (
    <section className="itinerary-list">
      {days.map((day) => (
        <article className="itinerary-day" key={day.day} tabIndex="0">
          <div className="itinerary-image-wrap">
            <img alt={day.imageAlt} className="itinerary-image" src={day.imageUrl} />
            <div className="day-badge">Day {day.day}</div>
          </div>
          <div className="itinerary-content">
            <div>
              <h3>{day.primaryPlace}</h3>
              <p>Nearby: {day.nearbyPlace}</p>
            </div>
            <ul>
              {day.activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
          <div className="day-budget-preview" role="tooltip">
            <strong>Day {day.day} budget</strong>
            <span>Hotel: {money.format(dailyBreakdown.hotel)}</span>
            <span>Food: {money.format(dailyBreakdown.food)}</span>
            <span>Transport: {money.format(dailyBreakdown.transportation)}</span>
            <em>Total: {money.format(dailyBreakdown.total)}</em>
          </div>
        </article>
      ))}
    </section>
  );
}
