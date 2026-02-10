import "dotenv/config";
import { z } from "zod";

// Загружаем переменные из .env файла
// config({ debug: false });

// Описываем схему конфигурации (Типы + Валидация)
const envSchema = z.object({
  // Токен бота: обязательная строка
  BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required"),

  // Окружение: development или production (по умолчанию development)
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Настройки БД
  DB_PATH: z.string().default("./data.sqlite"),

  // Порт для HTTP сервера (если понадобится для вебхуков или админки)
  PORT: z.coerce.number().default(3000),

  // Логирование
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

  //
  CHECK_MINUTES_RANGE: z.coerce.number().min(5).default(15),

  //
  POLZA_AI_KEY: z.string().min(1, "BOT_TOKEN is required"),
});

// 3. Валидируем данные из process.env
const _env = envSchema.safeParse(process.env);

// 4. Обработка ошибок валидации
if (!_env.success) {
  console.error("❌ Некорректная конфигурация:");

  // Красивый вывод ошибок
  const formatErrors = (errors: z.ZodError) => {
    errors.issues.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
  };

  formatErrors(_env.error);
  process.exit(1); // Завершаем работу приложения
}

// 5. Экспортируем валидный объект с правильными типами
// AsConst делает типы более конкретными (например 'development' вместо string)
export const Config = _env.data;

if (Config.LOG_LEVEL === "debug") {
  console.info(Config);
}
