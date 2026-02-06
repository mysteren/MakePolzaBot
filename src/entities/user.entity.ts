export type User = {
  id: number;
  username: string | null;
  options: Record<string, string>;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};
