// import { sleep } from "../../../shared/utils.js";
import { type MyContext } from "../context.js";

export const runHandler = async (ctx: MyContext) => {
  // Обновляем статус: генерация запущена
  ctx.session.state = "running";

  // Отправляем заглушку пользователю
  await ctx.reply("🚀 Генерация запущена...");

  // await sleep(8000);

  // ctx.session.state = "";

  // await ctx.reply("✅ Генерация завершена");
};
