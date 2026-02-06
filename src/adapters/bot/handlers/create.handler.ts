import type { CallbackQueryContext } from "grammy";
import type { MyContext } from "../context.js";

export const createHandler = async (ctx: CallbackQueryContext<MyContext>) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Введите URL для проверки:");
  // Установить состояние: ожидание URL
  ctx.session.state = "awaiting_url";
};
