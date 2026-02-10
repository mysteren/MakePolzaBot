import { Config } from "../../infrastructure/config/index.js";
import { PolzaRequestUseCase } from "../../use-cases/polza-request.use-case.js";
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

  /**
   *
   */
  polzaRequest: new PolzaRequestUseCase(Config.POLZA_AI_KEY),
} as const;

/**
 * Тип для безопасного доступа к use cases
 */
export type UseCases = typeof useCases;
