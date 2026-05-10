export default function Itinerary({ days }) {
  return (
    <section className="itinerary-list">
      {days.map((day) => (
        <article className="itinerary-day" key={day.day}>
          <div className="day-badge">Day {day.day}</div>
          <ul>
            {day.activities.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
