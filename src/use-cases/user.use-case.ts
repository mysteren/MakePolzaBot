import { UserRepository } from "../repositories/user.repository.js";

export interface StartUseCaseInput {
  userId: number;
  username: string | null | undefined;
  firstName: string;
}

export class UserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  start(input: StartUseCaseInput): string {
    // Создаем или находим пользователя в базе
    const user = this.userRepo.findOrCreate({
      id: input.userId,
      username: input.username || null,
      options: {},
    });

    // Формируем приветственное сообщение
    const isNewUser =
      new Date(user.created_at).getTime() ===
      new Date(user.updated_at).getTime();

    if (isNewUser) {
      return (
        `Добро пожаловать, ${input.firstName}! 🎉\n\n` +
        `Вы успешно зарегистрированы` +
        `Доступные команды:\n` +
        `/settings - управление настроек\n` +
        `/getoptions - просмотр настроек`
      );
    } else {
      return (
        `С возвращением, ${input.firstName}! 👋\n\n` +
        `Ваш аккаунт уже существует в системе.`
      );
    }
  }

  getOptions(userId: number): Record<string, string> {
    const user = this.userRepo.findById(userId);
    return user?.options || {};
  }

  setOption(userId: number, key: string, value: string): boolean {
    const result = this.userRepo.setOption(userId, key, value);
    return result !== undefined;
  }

  setOptions(userId: number, data: Record<string, string>) {
    const result = this.userRepo.updateOptions(userId, data);
    return result !== undefined;
  }

  /**
   * Установить модель и сбросить опции на дефолтные значения
   * @param userId - ID пользователя
   * @param modelKey - ключ модели
   * @param modelOptions - опции модели с возможными значениями
   */
  setModelWithOptions(
    userId: number,
    modelKey: string,
    modelOptions: Record<string, { values: string[] }>,
  ): boolean {
    // Получаем текущие опции пользователя
    const user = this.userRepo.findById(userId);
    if (!user) {
      return false;
    }

    const newOptions: Record<string, string> = {};

    // Устанавливаем модель
    newOptions.model = modelKey;

    // Устанавливаем все опции модели на первые значения
    for (const [key, config] of Object.entries(modelOptions)) {
      if (config.values && config.values.length > 0) {
        newOptions[key] = config.values[0] as string;
      }
    }

    // Сохраняем все опции в БД (старые опции, которых нет в модели, удалятся)
    const result = this.userRepo.updateOptions(userId, newOptions);
    return result !== undefined;
  }
}
