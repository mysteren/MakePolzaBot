import { Config } from "../../infrastructure/config/index.js";
import { PolzaUseCase } from "../../use-cases/polza.use-case.js";
import { UserUseCase } from "../../use-cases/user.use-case.js";
import { repositories } from "../repositories/index.js";

/**
 * Use Cases с внедрёнными зависимостями
 *
 * Use cases создаются один раз и переиспользуются.
 * Зависимости внедряются через синглтоны репозиториев.
 */

export const useCases = {
  /**
   * Use case для команды /start
   */
  user: new UserUseCase(repositories.user),

  /**
   *
   */
  polza: new PolzaUseCase(
    Config.POLZA_AI_KEY,
    Config.BOT_TOKEN,
    repositories.user,
  ),
} as const;

/**
 * Тип для безопасного доступа к use cases
 */
export type UseCases = typeof useCases;
