-- ECE / Colegio JCM — esquema compatible con el código actual.
-- Copia y pega este archivo completo en el SQL Editor de Supabase.
-- Tablas usadas por el app: profiles, user_roles, categories, posts, comments,
-- likes, books, book_purchases, chat_threads y chat_messages.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dni TEXT NOT NULL UNIQUE CHECK (dni ~ '^[0-9]{8}$'),
  full_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '📚',
  color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

INSERT INTO public.categories (name, slug, emoji, color) VALUES
  ('Matemática', 'matematica', '🧮', 'chart-1'),
  ('Inglés', 'ingles', '🌍', 'chart-2'),
  ('Ciencia', 'ciencia', '🔬', 'chart-3'),
  ('Arte', 'arte', '🎨', 'chart-4'),
  ('Historia', 'historia', '📜', 'chart-5'),
  ('Tecnología', 'tecnologia', '💻', 'primary'),
  ('Música', 'musica', '🎵', 'chart-2'),
  ('Consejos', 'consejos', '💡', 'chart-4')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 20000),
  cover_image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS posts_created_idx ON public.posts(created_at DESC);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_post_idx ON public.comments(post_id);
GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS likes_post_idx ON public.likes(post_id);
GRANT SELECT ON public.likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_author_profile_fkey') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_author_profile_fkey
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_author_profile_fkey') THEN
    ALTER TABLE public.comments ADD CONSTRAINT comments_author_profile_fkey
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  author TEXT CHECK (author IS NULL OR char_length(author) <= 120),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 4000),
  cover_url TEXT,
  pdf_path TEXT NOT NULL,
  price_points INTEGER NOT NULL DEFAULT 100 CHECK (price_points >= 0 AND price_points <= 100000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS books_owner_idx ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS books_created_idx ON public.books(created_at DESC);
GRANT SELECT ON public.books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.book_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, buyer_id)
);
CREATE INDEX IF NOT EXISTS purchases_buyer_idx ON public.book_purchases(buyer_id);
GRANT SELECT, INSERT ON public.book_purchases TO authenticated;
GRANT ALL ON public.book_purchases TO service_role;
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nueva conversación' CHECK (char_length(title) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user ON public.chat_threads(user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 16000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages(thread_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Roles viewable by everyone" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users create posts" ON public.posts;
DROP POLICY IF EXISTS "Users update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins delete any post" ON public.posts;
CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins delete any post" ON public.posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users comment" ON public.comments;
DROP POLICY IF EXISTS "Users delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins delete any comment" ON public.comments;
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users comment" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins delete any comment" ON public.comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users insert own likes" ON public.likes;
DROP POLICY IF EXISTS "Users manage own likes insert" ON public.likes;
DROP POLICY IF EXISTS "Users delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Users manage own likes delete" ON public.likes;
CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users insert own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "books_select_all" ON public.books;
DROP POLICY IF EXISTS "books_insert_own" ON public.books;
DROP POLICY IF EXISTS "books_update_own" ON public.books;
DROP POLICY IF EXISTS "books_delete_own" ON public.books;
DROP POLICY IF EXISTS "books_admin_delete" ON public.books;
CREATE POLICY "books_select_all" ON public.books FOR SELECT USING (true);
CREATE POLICY "books_insert_own" ON public.books FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "books_update_own" ON public.books FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "books_delete_own" ON public.books FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "books_admin_delete" ON public.books FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "purchases_select_involved" ON public.book_purchases;
CREATE POLICY "purchases_select_involved" ON public.book_purchases FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.owner_id = auth.uid()));

DROP POLICY IF EXISTS "threads_own" ON public.chat_threads;
CREATE POLICY "threads_own" ON public.chat_threads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "messages_own" ON public.chat_messages;
CREATE POLICY "messages_own" ON public.chat_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.calc_level(_points INT)
RETURNS INT LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT GREATEST(1, (_points / 100) + 1)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS posts_updated ON public.posts;
CREATE TRIGGER posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS chat_threads_updated ON public.chat_threads;
CREATE TRIGGER chat_threads_updated BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _dni TEXT;
BEGIN
  _dni := COALESCE(NULLIF(NEW.raw_user_meta_data->>'dni', ''), regexp_replace(split_part(NEW.email, '@', 1), '\D', '', 'g'));
  IF _dni IS NULL OR _dni !~ '^[0-9]{8}$' THEN
    _dni := lpad((floor(random() * 100000000))::int::text, 8, '0');
  END IF;

  INSERT INTO public.profiles (id, dni, full_name, grade)
  VALUES (
    NEW.id,
    _dni,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Estudiante'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'grade', ''), 'Sin especificar')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.award_points_post()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET points = points + 10, level = public.calc_level(points + 10) WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS post_award_points ON public.posts;
CREATE TRIGGER post_award_points AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.award_points_post();

CREATE OR REPLACE FUNCTION public.award_points_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET points = points + 2, level = public.calc_level(points + 2) WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS comment_award_points ON public.comments;
CREATE TRIGGER comment_award_points AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.award_points_comment();

CREATE OR REPLACE FUNCTION public.award_points_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author UUID;
BEGIN
  SELECT author_id INTO _author FROM public.posts WHERE id = NEW.post_id;
  IF _author IS NOT NULL AND _author <> NEW.user_id THEN
    UPDATE public.profiles SET points = points + 1, level = public.calc_level(points + 1) WHERE id = _author;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS like_award_points ON public.likes;
CREATE TRIGGER like_award_points AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.award_points_like();

CREATE OR REPLACE FUNCTION public.purchase_book(_book_id UUID)
RETURNS public.book_purchases LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _buyer UUID := auth.uid();
  _book public.books;
  _buyer_points INT;
  _seller_share INT;
  _purchase public.book_purchases;
BEGIN
  IF _buyer IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  SELECT * INTO _book FROM public.books WHERE id = _book_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Libro no encontrado'; END IF;
  IF _book.owner_id = _buyer THEN RAISE EXCEPTION 'No puedes comprar tu propio libro'; END IF;
  IF EXISTS (SELECT 1 FROM public.book_purchases WHERE book_id = _book_id AND buyer_id = _buyer) THEN
    RAISE EXCEPTION 'Ya compraste este libro';
  END IF;
  SELECT points INTO _buyer_points FROM public.profiles WHERE id = _buyer;
  IF COALESCE(_buyer_points, 0) < _book.price_points THEN RAISE EXCEPTION 'Puntos insuficientes'; END IF;
  UPDATE public.profiles SET points = points - _book.price_points, level = public.calc_level(points - _book.price_points) WHERE id = _buyer;
  _seller_share := floor(_book.price_points * 0.70);
  UPDATE public.profiles SET points = points + _seller_share, level = public.calc_level(points + _seller_share) WHERE id = _book.owner_id;
  INSERT INTO public.book_purchases (book_id, buyer_id, price_paid)
    VALUES (_book_id, _buyer, _book.price_points) RETURNING * INTO _purchase;
  RETURN _purchase;
END;
$$;
GRANT EXECUTE ON FUNCTION public.purchase_book(UUID) TO authenticated;

INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers','book-covers',true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('book-pdfs','book-pdfs',false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "covers_read" ON storage.objects;
DROP POLICY IF EXISTS "covers_write" ON storage.objects;
DROP POLICY IF EXISTS "covers_update_own" ON storage.objects;
DROP POLICY IF EXISTS "covers_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "pdfs_write" ON storage.objects;
DROP POLICY IF EXISTS "pdfs_owner_read" ON storage.objects;
DROP POLICY IF EXISTS "pdfs_buyer_read" ON storage.objects;
DROP POLICY IF EXISTS "pdfs_delete_own" ON storage.objects;

CREATE POLICY "covers_read" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "covers_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "covers_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'book-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "covers_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pdfs_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pdfs_owner_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pdfs_buyer_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'book-pdfs' AND EXISTS (
    SELECT 1 FROM public.books b JOIN public.book_purchases p ON p.book_id = b.id
    WHERE b.pdf_path = storage.objects.name AND p.buyer_id = auth.uid()
  ));
CREATE POLICY "pdfs_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
