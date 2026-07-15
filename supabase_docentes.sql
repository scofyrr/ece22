-- =========================================================
-- ECE: Docentes, baneos, vistas de página
-- IMPORTANTE: copia y pega este archivo COMPLETO en el editor SQL de tu
-- proyecto Supabase (SQL Editor → New query → Run). Es idempotente.
-- =========================================================

-- 1) Añadir 'docente' al enum app_role (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'docente'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'docente';
  END IF;
END $$;

-- 2) Tabla teacher_profiles
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_modular TEXT NOT NULL UNIQUE CHECK (codigo_modular ~ '^\d{10}$'),
  full_name TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE CHECK (dni ~ '^\d{8}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.teacher_profiles TO authenticated;
GRANT ALL ON public.teacher_profiles TO service_role;

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_profiles readable by all" ON public.teacher_profiles;
CREATE POLICY "teacher_profiles readable by all" ON public.teacher_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "teacher can insert own" ON public.teacher_profiles;
CREATE POLICY "teacher can insert own" ON public.teacher_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3) Helper is_teacher
CREATE OR REPLACE FUNCTION public.is_teacher(_uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid AND role IN ('docente', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_teacher(UUID) TO authenticated, anon;

-- 4) Tabla user_bans
CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS user_bans_user_idx ON public.user_bans(user_id) WHERE active;

GRANT SELECT ON public.user_bans TO authenticated;
GRANT ALL ON public.user_bans TO service_role;

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bans visible to authenticated" ON public.user_bans;
CREATE POLICY "bans visible to authenticated" ON public.user_bans
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "teachers manage bans" ON public.user_bans;
CREATE POLICY "teachers manage bans" ON public.user_bans
  FOR ALL TO authenticated
  USING (public.is_teacher(auth.uid()))
  WITH CHECK (public.is_teacher(auth.uid()));

-- 5) Función is_banned
CREATE OR REPLACE FUNCTION public.is_banned(_uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_bans
    WHERE user_id = _uid AND active = true
      AND (until IS NULL OR until > now())
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_banned(UUID) TO authenticated, anon;

-- 6) Restricciones: baneados no publican / comentan / dan like
DROP POLICY IF EXISTS "no banned can insert posts" ON public.posts;
CREATE POLICY "no banned can insert posts" ON public.posts
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_banned(auth.uid()));

DROP POLICY IF EXISTS "no banned can insert comments" ON public.comments;
CREATE POLICY "no banned can insert comments" ON public.comments
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_banned(auth.uid()));

DROP POLICY IF EXISTS "no banned can insert likes" ON public.likes;
CREATE POLICY "no banned can insert likes" ON public.likes
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_banned(auth.uid()));

-- 7) Docentes/admin pueden borrar contenido ajeno
DROP POLICY IF EXISTS "teachers can delete any post" ON public.posts;
CREATE POLICY "teachers can delete any post" ON public.posts
  FOR DELETE TO authenticated
  USING (public.is_teacher(auth.uid()) OR auth.uid() = author_id);

DROP POLICY IF EXISTS "teachers can delete any comment" ON public.comments;
CREATE POLICY "teachers can delete any comment" ON public.comments
  FOR DELETE TO authenticated
  USING (public.is_teacher(auth.uid()) OR auth.uid() = author_id);

DROP POLICY IF EXISTS "teachers can delete any book" ON public.books;
CREATE POLICY "teachers can delete any book" ON public.books
  FOR DELETE TO authenticated
  USING (public.is_teacher(auth.uid()) OR auth.uid() = owner_id);

-- 8) Vistas de página
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS page_views_day_idx ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_user_idx ON public.page_views(user_id, created_at DESC);

GRANT INSERT ON public.page_views TO authenticated, anon;
GRANT SELECT ON public.page_views TO authenticated;
GRANT USAGE ON SEQUENCE page_views_id_seq TO authenticated, anon;
GRANT ALL ON public.page_views TO service_role;
GRANT ALL ON SEQUENCE page_views_id_seq TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can log view" ON public.page_views;
CREATE POLICY "anyone can log view" ON public.page_views
  FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "teachers read views" ON public.page_views;
CREATE POLICY "teachers read views" ON public.page_views
  FOR SELECT TO authenticated
  USING (public.is_teacher(auth.uid()));

-- 9) RPC: registro de docente
CREATE OR REPLACE FUNCTION public.register_teacher(
  _codigo_modular TEXT, _full_name TEXT, _dni TEXT
) RETURNS public.teacher_profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _tp public.teacher_profiles;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  IF _codigo_modular !~ '^\d{10}$' THEN RAISE EXCEPTION 'Código modular inválido (10 dígitos)'; END IF;
  IF _dni !~ '^\d{8}$' THEN RAISE EXCEPTION 'DNI inválido (8 dígitos)'; END IF;

  INSERT INTO public.teacher_profiles(id, codigo_modular, full_name, dni)
    VALUES (_uid, _codigo_modular, trim(_full_name), _dni)
    RETURNING * INTO _tp;

  INSERT INTO public.user_roles(user_id, role)
    VALUES (_uid, 'docente') ON CONFLICT DO NOTHING;

  INSERT INTO public.profiles(id, dni, full_name, grade)
    VALUES (_uid, _dni, trim(_full_name), 'Docente')
    ON CONFLICT (id) DO NOTHING;

  RETURN _tp;
END $$;

GRANT EXECUTE ON FUNCTION public.register_teacher(TEXT, TEXT, TEXT) TO authenticated;

-- 10) RPC: banear / desbanear
CREATE OR REPLACE FUNCTION public.ban_user(
  _user_id UUID, _reason TEXT, _duration TEXT
) RETURNS public.user_bans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _me UUID := auth.uid();
  _until TIMESTAMPTZ;
  _ban public.user_bans;
BEGIN
  IF NOT public.is_teacher(_me) THEN RAISE EXCEPTION 'Solo docentes'; END IF;
  IF _user_id = _me THEN RAISE EXCEPTION 'No puedes banearte a ti mismo'; END IF;

  _until := CASE _duration
    WHEN '1d' THEN now() + interval '1 day'
    WHEN '2d' THEN now() + interval '2 days'
    WHEN '1w' THEN now() + interval '7 days'
    WHEN '1m' THEN now() + interval '30 days'
    WHEN 'permanent' THEN NULL
    ELSE now() + interval '1 day'
  END;

  UPDATE public.user_bans SET active = false WHERE user_id = _user_id AND active = true;

  INSERT INTO public.user_bans(user_id, banned_by, reason, until, active)
    VALUES (_user_id, _me, _reason, _until, true)
    RETURNING * INTO _ban;

  RETURN _ban;
END $$;

GRANT EXECUTE ON FUNCTION public.ban_user(UUID, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.unban_user(_user_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c INT;
BEGIN
  IF NOT public.is_teacher(auth.uid()) THEN RAISE EXCEPTION 'Solo docentes'; END IF;
  UPDATE public.user_bans SET active = false
    WHERE user_id = _user_id AND active = true;
  GET DIAGNOSTICS _c = ROW_COUNT;
  RETURN _c;
END $$;

GRANT EXECUTE ON FUNCTION public.unban_user(UUID) TO authenticated;
