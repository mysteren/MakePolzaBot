import { InitBot } from "../adapters/bot/index.js";
import "../infrastructure/db/sqlite.js"; // Инициализация базы данных
import "../di/index.js"; // Инициализация DI (создаёт синглтоны)
import { Config } from "../infrastructure/config/index.js";

// Функция запуска
const run = async () => {
  const bot = InitBot(Config.BOT_TOKEN);
  try {
    console.log("Запускаем бота");
    await bot.start();
    console.info("Бот успешно запущен!");
  } catch (error) {
    console.error("Ошибка запуска бота:", error);
  }
};

// Запускаем
run();
