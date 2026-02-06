import type { MyContext } from "../context.js";
import { InlineKeyboard, type Filter } from "grammy";

// Обработка ввода URL
export const messageHandler = async (ctx: Filter<MyContext, "message">) => {
  console.log(ctx.session);

  // Проверяем, не запущена ли генерация
  if (ctx.session.state === "running") {
    await ctx.reply(
      "⚠️ Генерация не завершена, дождитесь завершения, прежде чем писать новый запрос",
    );
    return;
  }

  // const data = ctx.message.text ?? "";

  // console.log(ctx.message);
};
