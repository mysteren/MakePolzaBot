/**
 * DI Container (Dependency Injection)
 *
 * Центральный контейнер зависимостей приложения.
 * Использует паттерн Singleton для оптимизации производительности.
 *
 * Структура:
 * - repositories: Синглтоны репозиториев (работают с БД)
 * - useCases: Use cases с внедрёнными зависимостями (бизнес-логика)
 */

import { repositories, type Repositories } from "./repositories/index.js";
import { useCases, type UseCases } from "./use-cases/index.js";

/**
 * Главный объект DI для удобного импорта
 *
 * Пример использования:
 * import { DI } from "../../di/index.js";
 * DI.useCases.start.run(...)
 */
export const DI = {
  repositories,
  useCases,
} as const;

// Re-export for convenience
export { repositories, useCases };
export type { Repositories, UseCases };
