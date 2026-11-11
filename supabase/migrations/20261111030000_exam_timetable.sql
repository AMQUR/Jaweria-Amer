-- Single editable exam timetable shared by the website countdown/study plans and (read-only,
-- via /api/exam-dates) the LMS dashboard. Service-role access only; no policies.
create table if not exists public.exam_timetable (
  syllabus_key text not null check (syllabus_key in ('1123','0500','0510-0511','9093-as','9093-a')),
  paper text not null check (char_length(paper) between 1 and 60),
  exam_date date not null,
  session text not null default 'Morning' check (session in ('Morning','Afternoon')),
  series text not null default 'June 2027',
  updated_at timestamptz not null default now(),
  primary key (syllabus_key, paper, series)
);
alter table public.exam_timetable enable row level security;
revoke all on public.exam_timetable from public, anon, authenticated;
grant select, insert, update, delete on public.exam_timetable to service_role;

insert into public.exam_timetable (syllabus_key, paper, exam_date) values
  ('1123','Paper 2','2027-04-29'),('1123','Paper 1','2027-05-06'),
  ('0500','Paper 1','2027-04-29'),('0500','Paper 2','2027-05-14'),
  ('0510-0511','Reading and Writing','2027-04-29'),('0510-0511','Listening','2027-05-24'),
  ('9093-as','Paper 1','2027-04-26'),('9093-as','Paper 2','2027-05-04'),
  ('9093-a','Paper 3','2027-05-07'),('9093-a','Paper 4','2027-05-25')
on conflict do nothing;
