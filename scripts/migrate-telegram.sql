ALTER TABLE agencies ADD COLUMN IF NOT EXISTS telegram_user_id bigint;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS telegram_connected_at timestamptz;

CREATE TABLE IF NOT EXISTS telegram_connect_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  code varchar(8) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '15 minutes',
  used_at timestamptz,
  UNIQUE(code)
);
CREATE INDEX IF NOT EXISTS idx_telegram_codes_agency ON telegram_connect_codes(agency_id);
CREATE INDEX IF NOT EXISTS idx_telegram_codes_code ON telegram_connect_codes(code);

CREATE TABLE IF NOT EXISTS telegram_usage (
  agency_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (agency_id, date)
);

CREATE TABLE IF NOT EXISTS telegram_connected_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  telegram_user_id bigint NOT NULL,
  telegram_username varchar(255),
  label varchar(100) DEFAULT 'Team Member',
  connected_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz,
  UNIQUE(telegram_user_id)
);
CREATE INDEX IF NOT EXISTS idx_telegram_users_agency ON telegram_connected_users(agency_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_connected_users(telegram_user_id);