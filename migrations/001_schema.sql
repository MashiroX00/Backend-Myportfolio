-- Portfolio database schema
-- Run: psql $DATABASE_URL -f migrations/001_schema.sql

CREATE TABLE IF NOT EXISTS about (
  id      INTEGER PRIMARY KEY DEFAULT 1,
  name    VARCHAR(255) NOT NULL DEFAULT '',
  titles  JSONB        NOT NULL DEFAULT '[]',
  bio     TEXT         NOT NULL DEFAULT '',
  photo_url VARCHAR(500),
  CONSTRAINT about_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack  JSONB        NOT NULL DEFAULT '[]',
  url         VARCHAR(500),
  image_url   VARCHAR(500),
  position    INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience (
  id          SERIAL PRIMARY KEY,
  company     VARCHAR(255) NOT NULL,
  role        VARCHAR(255) NOT NULL,
  start_date  VARCHAR(7)   NOT NULL,
  end_date    VARCHAR(7),
  description TEXT,
  position    INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  position INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
  id         SERIAL PRIMARY KEY,
  school     VARCHAR(255) NOT NULL,
  degree     VARCHAR(255) NOT NULL,
  major      VARCHAR(255) NOT NULL,
  start_year INTEGER      NOT NULL,
  end_year   INTEGER,
  position   INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS certificates (
  id               SERIAL PRIMARY KEY,
  cert_name        VARCHAR(255) NOT NULL,
  cert_description TEXT,
  issuer           VARCHAR(255) NOT NULL,
  date_issued      DATE         NOT NULL,
  url              VARCHAR(500),
  position         INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact (
  id       SERIAL PRIMARY KEY,
  platform VARCHAR(255) NOT NULL UNIQUE,
  url      VARCHAR(500) NOT NULL
);
