import { Context } from "grammy";
import type { MyContext } from "../context.js";

export const prepareHandler = async (ctx: MyContext) => {
  // Устанавливаем новый статус: подготовка
  ctx.session.state = "preparing";

  // Отправляем подтверждение пользователю
  await ctx.reply("✅ Статус установлен: Подготовка");
};
