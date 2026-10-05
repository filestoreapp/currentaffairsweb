-- 2026-10-05: PYQ paper sections
-- Adds the paper_sections JSONB column to quizzes so a PYQ paper can hold
-- multiple sections (Section A, B, …), each with a question paper + answer
-- key PDF. Safe to re-run.

alter table quizzes add column if not exists paper_sections jsonb not null default '[]';
