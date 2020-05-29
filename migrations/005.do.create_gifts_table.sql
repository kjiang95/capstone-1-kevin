CREATE TABLE gifts_table (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events_table(id) ON DELETE CASCADE NOT NULL,
  idea TEXT NOT NULL,
  notes TEXT
)