-- Biblioteca: economía de puntos + max_points histórico
--   - Subir libro: cuesta 40 pts
--   - Comprar libro: cuesta 20 pts, 100% al autor
--   - max_points: pico histórico (ranking estable)
--   - Soporta PDF/DOC/DOCX/PPT/PPTX/TXT/ZIP

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_points INTEGER NOT NULL DEFAULT 0;

UPDATE public.profiles SET max_points = GREATEST(max_points, points);

CREATE OR REPLACE FUNCTION public.bump_max_points()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.points > COALESCE(NEW.max_points, 0) THEN
    NEW.max_points := NEW.points;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_bump_max_points ON public.profiles;
CREATE TRIGGER profiles_bump_max_points
  BEFORE INSERT OR UPDATE OF points ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.bump_max_points();

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS file_ext TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

ALTER TABLE public.books ALTER COLUMN price_points SET DEFAULT 20;

CREATE OR REPLACE FUNCTION public.create_book(
  _title TEXT, _author TEXT, _description TEXT, _cover_url TEXT,
  _file_path TEXT, _mime_type TEXT, _file_ext TEXT, _file_size INTEGER
) RETURNS public.books
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _pts INT;
  _book public.books;
  _fee CONSTANT INT := 40;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  IF _file_path IS NULL OR length(_file_path) = 0 THEN RAISE EXCEPTION 'Archivo requerido'; END IF;

  SELECT points INTO _pts FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF COALESCE(_pts,0) < _fee THEN
    RAISE EXCEPTION 'Necesitas % puntos para subir un libro (tienes %)', _fee, COALESCE(_pts,0);
  END IF;

  UPDATE public.profiles
    SET points = points - _fee, level = public.calc_level(points - _fee)
    WHERE id = _uid;

  INSERT INTO public.books (owner_id, title, author, description, cover_url, pdf_path, price_points, mime_type, file_ext, file_size)
  VALUES (_uid, _title, NULLIF(_author,''), NULLIF(_description,''), _cover_url, _file_path, 20, _mime_type, _file_ext, _file_size)
  RETURNING * INTO _book;

  RETURN _book;
END $$;

GRANT EXECUTE ON FUNCTION public.create_book(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.purchase_book(_book_id UUID)
RETURNS public.book_purchases
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _buyer UUID := auth.uid();
  _book public.books;
  _buyer_points INT;
  _purchase public.book_purchases;
  _price CONSTANT INT := 20;
BEGIN
  IF _buyer IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;
  SELECT * INTO _book FROM public.books WHERE id = _book_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Libro no encontrado'; END IF;
  IF _book.owner_id = _buyer THEN RAISE EXCEPTION 'No puedes comprar tu propio libro'; END IF;
  IF EXISTS (SELECT 1 FROM public.book_purchases WHERE book_id = _book_id AND buyer_id = _buyer) THEN
    RAISE EXCEPTION 'Ya compraste este libro';
  END IF;

  SELECT points INTO _buyer_points FROM public.profiles WHERE id = _buyer FOR UPDATE;
  IF COALESCE(_buyer_points,0) < _price THEN
    RAISE EXCEPTION 'Te faltan % puntos', _price - COALESCE(_buyer_points,0);
  END IF;

  UPDATE public.profiles
    SET points = points - _price, level = public.calc_level(points - _price)
    WHERE id = _buyer;

  UPDATE public.profiles
    SET points = points + _price, level = public.calc_level(points + _price)
    WHERE id = _book.owner_id;

  INSERT INTO public.book_purchases (book_id, buyer_id, price_paid)
    VALUES (_book_id, _buyer, _price) RETURNING * INTO _purchase;

  RETURN _purchase;
END $$;

GRANT EXECUTE ON FUNCTION public.purchase_book(UUID) TO authenticated;
ON