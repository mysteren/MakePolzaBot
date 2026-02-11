import { Context } from "grammy";
import { DI } from "../../../di/index.js";

export const startHandler = async (ctx: Context) => {
  const userId = ctx.from!.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name || "Пользователь";

  const responseMessage = DI.useCases.user.start({
    userId,
    username: username || null,
    firstName,
  });

  // Отправляем ответ обратно в Telegram
  await ctx.reply(responseMessage);
};
