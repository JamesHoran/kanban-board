CREATE TABLE public.boards (id uuid NOT NULL, name text NOT NULL, owner uuid NOT NULL, created_at timestamptz NOT NULL, PRIMARY KEY (id));
