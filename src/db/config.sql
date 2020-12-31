CREATE TABLE users (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  friends bigint ARRAY,
  created_at date DEFAULT CURRENT_DATE,
  modified_at date DEFAULT CURRENT_DATE
);

CREATE TABLE chats (
  id text NOT NULL,
  participants text ARRAY NOT NULL,
  messages jsonb NOT NULL
);