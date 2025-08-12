ALTER TABLE public.cards ADD CONSTRAINT cards_position_unique UNIQUE (position);
ALTER TABLE public.cards ADD CONSTRAINT cards_created_at_unique UNIQUE (created_at);
ALTER TABLE public.cards ADD CONSTRAINT cards_column_id_unique UNIQUE (column_id);
