CREATE TABLE users (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  username text NOT NULL UNIQUE,
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

CREATE TABLE friend_requests (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  sender text NOT NULL,
  reciever text NOT NULL,
  seen boolean DEFAULT FALSE
);