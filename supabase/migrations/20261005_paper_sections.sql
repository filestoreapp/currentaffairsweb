-- Paper sections for PYQ papers: multiple question papers + answer keys
-- grouped under headings like "Section A", "Section B".
-- Run once in the Supabase SQL editor.
alter table quizzes
  add column if not exists paper_sections jsonb not null default '[]';
