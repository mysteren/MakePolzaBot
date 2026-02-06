import { UserRepository } from "../repositories/user.repository.js";

export interface StartUseCaseInput {
  userId: number;
  username: string | null | undefined;
  firstName: string;
}

export class StartUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  run(input: StartUseCaseInput): string {
    // Создаем или находим пользователя в базе
    const user = this.userRepo.findOrCreate({
      id: input.userId,
      username: input.username || null,
      options: { pagesCheck: "true" },
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
        `/prepare - сбор запросов для генерации\n` +
        `/run - запуск`
      );
    } else {
      return (
        `С возвращением, ${input.firstName}! 👋\n\n` +
        `Ваш аккаунт уже существует в системе.`
      );
    }
  }
}
