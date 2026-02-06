import type { Context, SessionFlavor } from "grammy";

type SessionData = {
  state: string;
  messages: string[];
  files: string[];
};

export type MyContext = Context & SessionFlavor<SessionData>;
