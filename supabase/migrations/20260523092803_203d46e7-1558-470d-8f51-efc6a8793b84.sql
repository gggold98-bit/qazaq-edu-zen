
-- Quizzes
CREATE TABLE public.qq_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  cover_url text,
  lang text NOT NULL DEFAULT 'kk',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.qq_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qq_quizzes owner select" ON public.qq_quizzes FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "qq_quizzes owner insert" ON public.qq_quizzes FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "qq_quizzes owner update" ON public.qq_quizzes FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "qq_quizzes owner delete" ON public.qq_quizzes FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER qq_quizzes_updated BEFORE UPDATE ON public.qq_quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Questions
CREATE TABLE public.qq_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.qq_quizzes(id) ON DELETE CASCADE,
  idx integer NOT NULL DEFAULT 0,
  qtype text NOT NULL DEFAULT 'multiple', -- multiple | truefalse | image
  text text NOT NULL,
  image_url text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of strings
  correct_index integer NOT NULL DEFAULT 0,
  time_limit_sec integer NOT NULL DEFAULT 20,
  points integer NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.qq_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qq_questions owner select" ON public.qq_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.qq_quizzes q WHERE q.id = quiz_id AND q.owner_id = auth.uid()));
CREATE POLICY "qq_questions owner insert" ON public.qq_questions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.qq_quizzes q WHERE q.id = quiz_id AND q.owner_id = auth.uid()));
CREATE POLICY "qq_questions owner update" ON public.qq_questions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.qq_quizzes q WHERE q.id = quiz_id AND q.owner_id = auth.uid()));
CREATE POLICY "qq_questions owner delete" ON public.qq_questions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.qq_quizzes q WHERE q.id = quiz_id AND q.owner_id = auth.uid()));

-- Sessions
CREATE TABLE public.qq_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.qq_quizzes(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  pin text NOT NULL,
  status text NOT NULL DEFAULT 'lobby', -- lobby | running | ended
  current_index integer NOT NULL DEFAULT 0,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb, -- {players:[{nickname,score}], totalQuestions, finishedAt}
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX qq_sessions_active_pin ON public.qq_sessions(pin) WHERE status <> 'ended';
CREATE INDEX qq_sessions_host ON public.qq_sessions(host_id, created_at DESC);
ALTER TABLE public.qq_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qq_sessions host all" ON public.qq_sessions FOR ALL TO authenticated
  USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);
-- Public lookup by PIN (so anonymous students can verify a live room before joining via Realtime broadcasts)
CREATE POLICY "qq_sessions public read by pin" ON public.qq_sessions FOR SELECT TO anon, authenticated
  USING (status IN ('lobby','running'));
CREATE TRIGGER qq_sessions_updated BEFORE UPDATE ON public.qq_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
