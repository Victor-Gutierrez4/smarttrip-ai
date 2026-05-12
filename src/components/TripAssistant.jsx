import { useMemo, useState } from 'react';

const starterMessages = [
  {
    role: 'assistant',
    content: 'Hi, I am your Trip Assistant. Ask me about your budget, itinerary, hotels, restaurants, or ways to improve this trip.'
  }
];

function buildTripPayload({ trip, summary, selectedHotel, itinerary }) {
  return {
    destination: trip.destination,
    startLocation: trip.startLocation,
    dateRange: trip.dateRange,
    duration: trip.duration,
    travelers: trip.travelers,
    nightlyBudget: trip.nightlyBudget,
    estimatedTotal: summary?.estimatedTotal,
    selectedHotelName: selectedHotel?.name,
    hotels: trip.hotels,
    restaurants: trip.restaurants,
    itinerary
  };
}

export default function TripAssistant({ trip, summary, selectedHotel, itinerary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const tripPayload = useMemo(
    () => buildTripPayload({ trip, summary, selectedHotel, itinerary }),
    [itinerary, selectedHotel, summary, trip]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const message = draft.trim();

    if (!message || loading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setDraft('');
    setLoading(true);

    try {
      const response = await fetch('/api/trip-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.slice(-6),
          trip: tripPayload
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Trip Assistant is unavailable.');
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: error.message || 'Trip Assistant is temporarily unavailable.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className={`trip-assistant ${isOpen ? 'assistant-open' : ''}`}>
      {isOpen && (
        <section className="assistant-panel" aria-label="Trip Assistant chat">
          <div className="assistant-header">
            <div>
              <strong>Trip Assistant</strong>
              <span>Ask about this trip plan</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close Trip Assistant">
              Close
            </button>
          </div>
          <div className="assistant-messages">
            {messages.map((message, index) => (
              <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {loading && <div className="assistant-message assistant">Thinking...</div>}
          </div>
          <form className="assistant-form" onSubmit={handleSubmit}>
            <input
              aria-label="Ask Trip Assistant"
              maxLength="600"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about budget, hotels, or itinerary..."
              value={draft}
            />
            <button type="submit" disabled={loading || !draft.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
      {!isOpen && (
        <button className="assistant-launcher" type="button" onClick={() => setIsOpen(true)}>
          Trip Assistant
        </button>
      )}
    </aside>
  );
}
