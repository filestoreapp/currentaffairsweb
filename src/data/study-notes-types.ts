/**
 * Shared types for the study-notes library.
 * Content modules (src/data/study-notes/batch-1-*.ts) import these types;
 * src/data/study-notes.ts merges metadata + content.
 * All prose fields are Malayalam. Keep each note roughly 300-600 words total.
 */
export interface StudyNoteTable {
  /** Two Malayalam column headers. */
  headers: [string, string];
  rows: [string, string][];
}

export interface StudyNoteSection {
  /** Malayalam section heading. */
  heading: string;
  /** 1-3 Malayalam paragraphs. */
  paragraphs: string[];
  /** Optional Malayalam bullet list of key facts. */
  bullets?: string[];
  /** Optional two-column Malayalam facts table. */
  table?: StudyNoteTable;
}

export interface StudyNoteContent {
  /** 1-2 Malayalam intro paragraphs. */
  intro: string[];
  /** 2-4 sections. */
  sections: StudyNoteSection[];
  /** 4-6 short Malayalam revision points. */
  revisionPoints: string[];
}

export interface StudyTopicMeta {
  slug: string;
  subject: string;
  subjectMalayalam: string;
  topic: string;
  topicMalayalam: string;
  subtopics: string[];
  exams: string[];
  coveredBySyllabus: boolean;
  sourceUrl: string;
}

export interface StudyTopic extends StudyTopicMeta {
  content?: StudyNoteContent;
}
