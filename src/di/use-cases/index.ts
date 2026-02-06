import { StartUseCase } from "../../use-cases/start.use-case.js";
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
  start: new StartUseCase(repositories.user),
} as const;

/**
 * Тип для безопасного доступа к use cases
 */
export type UseCases = typeof useCases;
