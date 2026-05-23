export type QType = "multiple" | "truefalse" | "image";

export interface QQQuestion {
  id: string;
  quiz_id: string;
  idx: number;
  qtype: QType;
  text: string;
  image_url: string | null;
  options: string[];
  correct_index: number;
  time_limit_sec: number;
  points: number;
}

export interface QQQuiz {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  lang: string;
  created_at: string;
  updated_at: string;
}

export interface QQSession {
  id: string;
  quiz_id: string;
  host_id: string;
  pin: string;
  status: "lobby" | "running" | "ended";
  current_index: number;
  summary: { players?: { nickname: string; score: number }[]; totalQuestions?: number; finishedAt?: string };
  created_at: string;
}

// Broadcast payloads
export type HostBroadcast =
  | { type: "lobby"; pin: string; quizTitle: string }
  | { type: "question"; idx: number; total: number; qtype: QType; text: string; image_url: string | null; options: string[]; time_limit_sec: number; serverNow: number }
  | { type: "reveal"; idx: number; correct_index: number; scoreboard: { nickname: string; score: number }[] }
  | { type: "podium"; players: { nickname: string; score: number }[] }
  | { type: "kick"; nickname: string };

export type PlayerBroadcast =
  | { type: "join"; nickname: string }
  | { type: "answer"; idx: number; choice: number; ms: number; nickname: string };

export function genPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
