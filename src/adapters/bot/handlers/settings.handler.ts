import { Context, InlineKeyboard } from "grammy";
import { DI } from "../../../di/index.js";

// Определения настроек
const SETTINGS: {
  models: {
    key: string;
    options: Record<string, { values: string[]; description: string }>;
  }[];
} = {
  models: [
    {
      key: "seedream-v4",
      options: {
        size: {
          values: ["1:1", "4:3", "3:4", "16:9", "9:16", "4k"],
          description: "Соотношение сторон целевого изображения",
        },
        imageResolution: {
          values: ["1K", "2K", "4K"],
          description: "Размер фотографии",
        },
      },
    },
    {
      key: "gpt4o-image",
      options: {
        size: {
          values: ["1:1", "2:3", "3:2"],
          description: "Соотношение сторон изображения",
        },
      },
    },
    {
      key: "nano-banana",
      options: {
        size: {
          values: ["auto", "1:1", "3:4", "9:16", "4:3", "16:9"],
          description: "Соотношение сторон изображения",
        },
      },
    },
  ],
};

/**
 * Создать главное меню настроек
 */
function createSettingsMenu(currentModel: string | undefined): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // Если модель выбрана, показать кнопки опций
  if (currentModel) {
    const model = SETTINGS.models.find((m) => m.key === currentModel);
    if (model) {
      for (const [key, config] of Object.entries(model.options)) {
        keyboard.text(`${key}: ${config.description}`, `settings_${key}`).row();
      }
    }
  }

  // Разделитель
  keyboard.text("---").row();

  // Кнопки выбора модели
  for (const model of SETTINGS.models) {
    const isActive = currentModel === model.key ? "✅ " : "";
    keyboard.text(`${isActive}${model.key}`, `select_model_${model.key}`).row();
  }

  return keyboard;
}

/**
 * Создать меню выбора значений для конкретной настройки
 */
function createValuesMenu(
  settingKey: string,
  values: string[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  // Создаем кнопки в два столбца
  for (let i = 0; i < values.length; i += 2) {
    const value1 = values[i];
    const value2 = values[i + 1];

    if (value1) {
      keyboard.text(value1, `set_${settingKey}_${value1}`);
    }

    if (value2) {
      keyboard.text(value2, `set_${settingKey}_${value2}`);
    }

    keyboard.row();
  }

  // Кнопка "Назад"
  keyboard.text("⬅️ Назад", "settings_main");

  return keyboard;
}

/**
 * Обработчик команды /settings
 */
export const settingsHandler = async (ctx: Context) => {
  const userId = ctx.from!.id;

  // Показываем текущие значения настроек
  const currentSettings = DI.useCases.user.getOptions(userId);
  const currentModel = currentSettings.model || "seedream-v4"; // модель по умолчанию

  let message = "⚙️ **Настройки**\n\n";
  message += `🤖 Модель: **${currentModel}**\n\n`;

  const model = SETTINGS.models.find((m) => m.key === currentModel);
  if (model) {
    message += `Доступные опции для этой модели:\n\n`;
    for (const [key, config] of Object.entries(model.options)) {
      const currentValue = currentSettings[key] || "не установлено";
      message += `📌 **${key}**: ${currentValue}\n   ${config.description}\n\n`;
    }
  }

  message += "Выберите настройку для изменения или смените модель:";

  await ctx.reply(message, {
    reply_markup: createSettingsMenu(currentModel),
    parse_mode: "Markdown",
  });
};

/**
 * Обработчик callback query для навигации по меню настроек
 */
export const settingsCallbackHandler = async (ctx: Context) => {
  const userId = ctx.from!.id;
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) return;

  // Главная страница настроек
  if (callbackData === "settings_main") {
    const currentSettings = DI.useCases.user.getOptions(userId);
    const currentModel = currentSettings.model || "seedream-v4";

    let message = "⚙️ **Настройки**\n\n";
    message += `🤖 Модель: **${currentModel}**\n\n`;

    const model = SETTINGS.models.find((m) => m.key === currentModel);
    if (model) {
      message += `Доступные опции для этой модели:\n\n`;
      for (const [key, config] of Object.entries(model.options)) {
        const currentValue = currentSettings[key] || "не установлено";
        message += `📌 **${key}**: ${currentValue}\n   ${config.description}\n\n`;
      }
    }

    message += "Выберите настройку для изменения или смените модель:";

    await ctx.editMessageText(message, {
      reply_markup: createSettingsMenu(currentModel),
      parse_mode: "Markdown",
    });
    return;
  }

  // Выбор модели
  const modelMatch = callbackData.match(/^select_model_(.+)$/);
  if (modelMatch && modelMatch[1]) {
    const modelKey = modelMatch[1];
    const model = SETTINGS.models.find((m) => m.key === modelKey);

    if (!model) {
      await ctx.answerCallbackQuery("❌ Модель не найдена");
      return;
    }

    // Устанавливаем модель и сбрасываем опции
    DI.useCases.user.setModelWithOptions(userId, modelKey, model.options);

    await ctx.answerCallbackQuery(`✅ Модель установлена: ${modelKey}`);

    // Возвращаемся в главное меню
    const currentSettings = DI.useCases.user.getOptions(userId);
    let message = "⚙️ **Настройки**\n\n";
    message += `🤖 Модель: **${modelKey}**\n\n`;
    message += `Доступные опции для этой модели:\n\n`;
    for (const [key, config] of Object.entries(model.options)) {
      const currentValue = currentSettings[key] || "не установлено";
      message += `📌 **${key}**: ${currentValue}\n   ${config.description}\n\n`;
    }
    message += "Выберите настройку для изменения или смените модель:";

    await ctx.editMessageText(message, {
      reply_markup: createSettingsMenu(modelKey),
      parse_mode: "Markdown",
    });
    return;
  }

  // Показать опции для настройки
  const optionMatch = callbackData.match(/^settings_(.+)$/);
  if (optionMatch && optionMatch[1]) {
    const optionKey = optionMatch[1];
    const currentSettings = DI.useCases.user.getOptions(userId);
    const currentModel = currentSettings.model || "seedream-v4";

    const model = SETTINGS.models.find((m) => m.key === currentModel);
    if (!model || !model.options[optionKey]) {
      await ctx.answerCallbackQuery(
        `❌ Опция ${optionKey} не найдена для модели ${currentModel}`,
      );
      return;
    }

    const option = model.options[optionKey];
    const currentValue = currentSettings[optionKey] || "не установлено";

    const message =
      `📌 **${optionKey}**\n\n` +
      `Текущее значение: ${currentValue}\n\n` +
      `${option.description}\n\n` +
      `Выберите значение:`;

    await ctx.editMessageText(message, {
      reply_markup: createValuesMenu(optionKey, option.values),
      parse_mode: "Markdown",
    });
    return;
  }

  // Установить значение для опции
  const setValueMatch = callbackData.match(/^set_(.+)_(.+)$/);
  if (setValueMatch && setValueMatch[1] && setValueMatch[2]) {
    const optionKey = setValueMatch[1];
    const value = setValueMatch[2];

    DI.useCases.user.setOption(userId, optionKey, value);

    await ctx.answerCallbackQuery(`✅ ${optionKey} установлен: ${value}`);

    // Возвращаемся в главное меню
    const currentSettings = DI.useCases.user.getOptions(userId);
    const currentModel = currentSettings.model || "seedream-v4";

    const model = SETTINGS.models.find((m) => m.key === currentModel);
    let message = "⚙️ **Настройки**\n\n";
    message += `🤖 Модель: **${currentModel}**\n\n`;
    if (model) {
      message += `Доступные опции для этой модели:\n\n`;
      for (const [key, config] of Object.entries(model.options)) {
        const currentValue = currentSettings[key] || "не установлено";
        message += `📌 **${key}**: ${currentValue}\n   ${config.description}\n\n`;
      }
    }
    message += "Выберите настройку для изменения или смените модель:";

    await ctx.editMessageText(message, {
      reply_markup: createSettingsMenu(currentModel),
      parse_mode: "Markdown",
    });
    return;
  }
};

export const getOptionsHandler = async (ctx: Context) => {
  const userId = ctx.from!.id;

  // Получаем все опции пользователя
  const currentSettings = DI.useCases.user.getOptions(userId);

  let message = "📊 **Ваши текущие настройки**\n\n";

  message += `${JSON.stringify(currentSettings)}\n\n`;

  // Показываем модель
  const currentModel = currentSettings.model || "не установлено";
  message += `🤖 **Модель**: ${currentModel}\n\n`;

  // Находим информацию о модели
  const model = SETTINGS.models.find((m) => m.key === currentModel);

  if (model) {
    message += `Доступные опции для модели **${model.key}**:\n\n`;

    // Показываем опции модели
    for (const [key, config] of Object.entries(model.options)) {
      const currentValue = currentSettings[key] || "не установлено";
      message += `📌 **${key}**: ${currentValue}\n   ${config.description}\n\n`;
    }
  }

  // Показываем остальные опции (если есть)
  const modelOptionKeys = model ? Object.keys(model.options) : [];
  const otherOptions = Object.entries(currentSettings).filter(
    ([key]) => key !== "model" && !modelOptionKeys.includes(key),
  );

  if (otherOptions.length > 0) {
    message += `📝 **Другие опции**:\n\n`;
    for (const [key, value] of otherOptions) {
      message += `🔹 **${key}**: ${value}\n`;
    }
    message += "\n";
  }

  message += `Для изменения настроек используйте команду /settings`;

  await ctx.reply(message, {
    parse_mode: "Markdown",
  });
};
