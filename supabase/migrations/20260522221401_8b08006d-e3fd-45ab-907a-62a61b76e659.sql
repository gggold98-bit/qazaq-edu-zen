ALTER TABLE public.profiles ALTER COLUMN points SET DEFAULT 0;
UPDATE public.profiles SET points = 0 WHERE points > 0;