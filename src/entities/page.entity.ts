export type Page = {
  id: string;
  user_id: number; // Owner
  url: string;
  check_time: number;
  last_status: string; // 'ok', 'error', 'pending'
  find_value: string; // строка для поиска
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};
