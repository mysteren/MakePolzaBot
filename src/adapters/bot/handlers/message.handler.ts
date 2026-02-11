import { type Filter } from "grammy";
import { DI } from "../../../di/index.js";
import type { MyContext } from "../context.js";

// Обработка ввода URL
export const messageHandler = async (ctx: Filter<MyContext, "message">) => {
  const userId = ctx.from!.id;

  // Проверяем, не запущена ли генерация
  if (ctx.session.state === "running") {
    await ctx.reply(
      "⚠️ Генерация не завершена, дождитесь завершения, прежде чем писать новый запрос",
    );
    return;
  } else {
    ctx.session.state = "running";
    ctx.reply("Запрос принят, выполняю...");
    // Фоновая задача БЕЗ await
    setImmediate(async () => {
      try {
        const msg = ctx.message;

        console.log(msg);

        if (msg.text) {
          const result = await DI.useCases.polza.getImage(
            userId,
            msg.text ?? "",
          );
          // await ctx.api.sendMessage(ctx.chat.id, result?.content ?? "пусто :|");
          //
          if (result.url) {
            ctx.api.sendPhoto(ctx.chat.id, result.url);
          } else {
            await ctx.api.sendMessage(
              ctx.chat.id,
              "Не удалось сгенерировать изображение",
            );
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          await ctx.api.sendMessage(ctx.chat.id, "Ошибка: " + err.message);
        }
      } finally {
        ctx.session.state = "";
      }
    });
  }
};
