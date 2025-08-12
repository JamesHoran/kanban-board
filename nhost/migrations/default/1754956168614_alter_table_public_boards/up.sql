ALTER TABLE public.boards ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.boards ALTER COLUMN created_at SET DEFAULT now();
