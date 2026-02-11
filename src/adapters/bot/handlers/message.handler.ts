import { type Filter } from "grammy";
import { DI } from "../../../di/index.js";
import type { MyContext } from "../context.js";

/**
 * Получить URLs картинок из сообщения
 */
async function getImageUrls(
  ctx: Filter<MyContext, "message">,
): Promise<string[]> {
  const urls: string[] = [];
  const msg = ctx.message;

  // Обработка photo массива (берем последний элемент - наивысшее качество)
  if (msg.photo && msg.photo.length > 0) {
    const photo = msg.photo[msg.photo.length - 1];

    if (photo) {
      const file = await ctx.api.getFile(photo.file_id);

      if (file.file_path) {
        urls.push(file.file_path);
      }
    }
  }
  // Обработка document (если это картинка)
  else if (msg.document && msg.document.mime_type?.startsWith("image/")) {
    const file = await ctx.api.getFile(msg.document.file_id);
    if (file.file_path) {
      urls.push(file.file_path);
    }
  }

  return urls;
}

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

        // Получаем текст запроса
        const prompt = msg.text ?? msg.caption ?? "";

        // Получаем URLs картинок
        const imageUrls = await getImageUrls(ctx);

        // Если нет ни текста ни картинок - игнорируем
        if (!prompt && imageUrls.length === 0) {
          return;
        }

        const result = await DI.useCases.polza.getImage(
          userId,
          prompt,
          imageUrls.length > 0 ? imageUrls : undefined,
        );

        if (result.url) {
          ctx.api.sendPhoto(ctx.chat.id, result.url);
        } else {
          await ctx.api.sendMessage(
            ctx.chat.id,
            "Не удалось сгенерировать изображение",
          );
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(err);
          await ctx.api.sendMessage(ctx.chat.id, "Ошибка: " + err.message);
        }
      } finally {
        ctx.session.state = "";
      }
    });
  }
};
