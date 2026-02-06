# Dependency Injection (DI)

Центральный контейнер зависимостей приложения. Использует паттерн **Singleton** для оптимизации производительности и **Dependency Injection** для гибкости и тестируемости.

## Структура

```
src/di/
├── index.ts              # Главный контейнер DI
├── repositories/
│   └── index.ts          # Синглтоны репозиториев
└── use-cases/
    └── index.ts          # Use cases с внедрёнными зависимостями
```

## Использование

### В хендлерах бота

```ts
import { DI } from "../../di/index.js";

const responseMessage = DI.useCases.start.run({
  userId,
  username,
  firstName,
});
```

### Прямой импорт

```ts
import { repositories, useCases } from "../../di/index.js";

const userRepo = repositories.user;
const startUseCase = useCases.start;
```

## Добавление новых зависимостей

### 1. Добавить новый репозиторий

В файле `src/di/repositories/index.ts`:

```ts
import { PageRepository } from "../../repositories/page.repository.js";

export const repositories = {
  user: new UserRepository(),
  
  // Добавляем новый репозиторий
  page: new PageRepository(),
} as const;
```

### 2. Добавить новый Use Case

В файле `src/di/use-cases/index.ts`:

```ts
import { AddPageUseCase } from "../../use-cases/add-page.use-case.js";

export const useCases = {
  start: new StartUseCase(repositories.user),
  
  // Добавляем новый use case
  addPage: new AddPageUseCase(repositories.page, repositories.user),
} as const;
```

### 3. Использовать в хендлере

```ts
const result = DI.useCases.addPage.execute({
  userId,
  url,
  checkPeriod,
});
```

## Преимущества

- ✅ **Производительность** — синглтоны создаются один раз
- ✅ **Гибкость** — легко тестировать (можно подменить DI)
- ✅ **Простота** — без тяжёлых DI-фреймворков
- ✅ **Чистота** — слои разделены, явные зависимости
- ✅ **Масштабируемость** — просто добавлять новые зависимости

## Инициализация

DI инициализируется автоматически при импорте в `src/app/index.ts`:

```ts
import "../di/index.js"; // Создаёт все синглтоны
```

## Типизация

Используются TypeScript `const assertions` для точной типизации:

```ts
// Автодополнение работает из коробки
DI.useCases.start.run(...)
//     ^^^^^^^^ доступные use cases
//           ^^^^^^ доступные методы
```
