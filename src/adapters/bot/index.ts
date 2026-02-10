import { Bot, session } from "grammy";
import type { MyContext } from "./context.js";
import { messageHandler } from "./handlers/message.handler.js";
import { startHandler } from "./handlers/start.handler.js";
import { prepareHandler } from "./handlers/prepare.handler.js";
import { runHandler } from "./handlers/run.handler.js";

export function InitBot(token: string) {
  const bot = new Bot<MyContext>(token);

  function initial() {
    return { state: "", messages: [] as string[], files: [] as string[] };
  }

  function sendMessage(user: number, msg: string) {
    bot.api.sendMessage(user, msg);
  }

  bot.use(session({ initial }));

  // Команда /start
  bot.command("start", startHandler);

  // Команда /prepare
  // bot.command("prepare", prepareHandler);

  // Команда /run
  // bot.command("run", runHandler);

  bot.on("message", messageHandler);

  // Обработка ошибок
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(
      `Error while handling update ${ctx.update.update_id}:`,
      err.error,
    );
  });
  return { bot, sendMessage };
}
