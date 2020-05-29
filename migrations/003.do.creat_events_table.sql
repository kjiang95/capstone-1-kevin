CREATE TABLE giftees_table(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users_table(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  relationship relationship_type NOT NULL
);