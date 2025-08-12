ALTER TABLE public.columns ADD CONSTRAINT columns_position_unique UNIQUE (position);
ALTER TABLE public.columns ADD CONSTRAINT columns_created_at_unique UNIQUE (created_at);
