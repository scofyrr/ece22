-- =========================================================
-- AULA VIRTUAL — ejecutar en Supabase SQL Editor
-- =========================================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  school text default '',
  cycle text default '',
  plan text default '',
  group_name text default '',
  cover_color text default '#6366f1',
  join_code text unique not null,
  created_at timestamptz default now()
);
create index if not exists courses_teacher_idx on public.courses(teacher_id);

create table if not exists public.course_enrollments (
  course_id uuid references public.courses(id) on delete cascade,
  student_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (course_id, student_id)
);
create index if not exists enrollments_student_idx on public.course_enrollments(student_id);

create table if not exists public.course_weeks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz default now()
);
create index if not exists weeks_course_idx on public.course_weeks(course_id);

create table if not exists public.course_items (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references public.course_weeks(id) on delete cascade,
  kind text not null check (kind in ('file','video','assignment')),
  title text not null,
  description text default '',
  file_url text,
  file_name text,
  video_url text,
  due_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists items_week_idx on public.course_items(week_id);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.course_items(id) on delete cascade,
  student_id uuid references auth.users(id) on delete cascade,
  file_url text not null,
  file_name text,
  submitted_at timestamptz default now(),
  unique (item_id, student_id)
);
create index if not exists sub_item_idx on public.assignment_submissions(item_id);

-- GRANTS ----------------------------------------------------
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.course_enrollments to authenticated;
grant select, insert, update, delete on public.course_weeks to authenticated;
grant select, insert, update, delete on public.course_items to authenticated;
grant select, insert, update, delete on public.assignment_submissions to authenticated;
grant all on public.courses, public.course_enrollments, public.course_weeks,
             public.course_items, public.assignment_submissions to service_role;

-- HELPERS ---------------------------------------------------
create or replace function public.has_course_access(_course uuid, _uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.courses where id=_course and teacher_id=_uid)
      or exists(select 1 from public.course_enrollments where course_id=_course and student_id=_uid);
$$;

create or replace function public.is_course_teacher(_course uuid, _uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.courses where id=_course and teacher_id=_uid);
$$;

-- Estudiante se une por código
create or replace function public.join_course(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare _cid uuid;
begin
  select id into _cid from public.courses where join_code = _code;
  if _cid is null then raise exception 'Código inválido'; end if;
  insert into public.course_enrollments(course_id, student_id)
  values (_cid, auth.uid()) on conflict do nothing;
  return _cid;
end $$;
grant execute on function public.join_course(text) to authenticated;

-- RLS -------------------------------------------------------
alter table public.courses enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_weeks enable row level security;
alter table public.course_items enable row level security;
alter table public.assignment_submissions enable row level security;

drop policy if exists courses_sel on public.courses;
create policy courses_sel on public.courses for select to authenticated
  using (teacher_id = auth.uid() or public.has_course_access(id, auth.uid()));
drop policy if exists courses_ins on public.courses;
create policy courses_ins on public.courses for insert to authenticated
  with check (teacher_id = auth.uid());
drop policy if exists courses_upd on public.courses;
create policy courses_upd on public.courses for update to authenticated
  using (teacher_id = auth.uid());
drop policy if exists courses_del on public.courses;
create policy courses_del on public.courses for delete to authenticated
  using (teacher_id = auth.uid());

drop policy if exists enroll_sel on public.course_enrollments;
create policy enroll_sel on public.course_enrollments for select to authenticated
  using (student_id = auth.uid() or public.is_course_teacher(course_id, auth.uid()));
drop policy if exists enroll_ins on public.course_enrollments;
create policy enroll_ins on public.course_enrollments for insert to authenticated
  with check (student_id = auth.uid() or public.is_course_teacher(course_id, auth.uid()));
drop policy if exists enroll_del on public.course_enrollments;
create policy enroll_del on public.course_enrollments for delete to authenticated
  using (student_id = auth.uid() or public.is_course_teacher(course_id, auth.uid()));

drop policy if exists weeks_sel on public.course_weeks;
create policy weeks_sel on public.course_weeks for select to authenticated
  using (public.has_course_access(course_id, auth.uid()));
drop policy if exists weeks_write on public.course_weeks;
create policy weeks_write on public.course_weeks for all to authenticated
  using (public.is_course_teacher(course_id, auth.uid()))
  with check (public.is_course_teacher(course_id, auth.uid()));

drop policy if exists items_sel on public.course_items;
create policy items_sel on public.course_items for select to authenticated
  using (public.has_course_access((select course_id from public.course_weeks where id = week_id), auth.uid()));
drop policy if exists items_write on public.course_items;
create policy items_write on public.course_items for all to authenticated
  using (public.is_course_teacher((select course_id from public.course_weeks where id = week_id), auth.uid()))
  with check (public.is_course_teacher((select course_id from public.course_weeks where id = week_id), auth.uid()));

drop policy if exists sub_sel on public.assignment_submissions;
create policy sub_sel on public.assignment_submissions for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_course_teacher(
      (select cw.course_id from public.course_weeks cw
        join public.course_items ci on ci.week_id = cw.id
        where ci.id = item_id),
      auth.uid())
  );
drop policy if exists sub_ins on public.assignment_submissions;
create policy sub_ins on public.assignment_submissions for insert to authenticated
  with check (student_id = auth.uid());
drop policy if exists sub_upd on public.assignment_submissions;
create policy sub_upd on public.assignment_submissions for update to authenticated
  using (student_id = auth.uid());

-- BUCKETS ---------------------------------------------------
insert into storage.buckets (id, name, public) values ('course-materials','course-materials', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('submissions','submissions', true)
  on conflict (id) do nothing;

drop policy if exists cm_read on storage.objects;
create policy cm_read on storage.objects for select using (bucket_id in ('course-materials','submissions'));
drop policy if exists cm_write on storage.objects;
create policy cm_write on storage.objects for insert to authenticated
  with check (bucket_id in ('course-materials','submissions'));
drop policy if exists cm_upd on storage.objects;
create policy cm_upd on storage.objects for update to authenticated
  using (bucket_id in ('course-materials','submissions'));
drop policy if exists cm_del on storage.objects;
create policy cm_del on storage.objects for delete to authenticated
  using (bucket_id in ('course-materials','submissions'));

-- =========================================================
-- v2: calificación de entregas
-- =========================================================
alter table public.assignment_submissions
  add column if not exists grade numeric,
  add column if not exists feedback text;
