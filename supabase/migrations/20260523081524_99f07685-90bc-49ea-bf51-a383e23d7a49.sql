
-- Textbook content storage (admin-managed)
CREATE TABLE IF NOT EXISTS public.textbook_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  grade int NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject, grade)
);
ALTER TABLE public.textbook_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read textbook_content" ON public.textbook_content
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage textbook_content" ON public.textbook_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.asked_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  grade int NOT NULL,
  question text NOT NULL,
  topic text,
  was_correct boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_asked_questions_user ON public.asked_questions (user_id, subject, grade, created_at DESC);
ALTER TABLE public.asked_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own asked_questions" ON public.asked_questions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own asked_questions" ON public.asked_questions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own asked_questions" ON public.asked_questions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  grade int NOT NULL,
  score int NOT NULL,
  total int NOT NULL,
  percent numeric NOT NULL,
  weak_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON public.test_attempts (user_id, subject, grade, created_at DESC);
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own test_attempts" ON public.test_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own test_attempts" ON public.test_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_textbook_content_updated_at ON public.textbook_content;
CREATE TRIGGER trg_textbook_content_updated_at
BEFORE UPDATE ON public.textbook_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
