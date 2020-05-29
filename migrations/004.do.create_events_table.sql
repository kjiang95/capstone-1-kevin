CREATE TABLE events_table (
  id SERIAL PRIMARY KEY,
  giftee_id INTEGER REFERENCES giftees_table(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  budget MONEY NOT NULL
)