import Database from "better-sqlite3";
import { db } from "../infrastructure/db/sqlite.js";
import type { User } from "../entities/user.entity.js";

export class UserRepository {
  constructor(private readonly database: Database.Database = db) {}

  /**
   * Найти пользователя по ID
   */
  findById(id: number): User | undefined {
    const stmt = this.database.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) return undefined;

    return {
      ...row,
      options: JSON.parse(row.options || "{}"),
    };
  }

  /**
   * Создать нового пользователя
   */
  create(user: Omit<User, "created_at" | "updated_at">): User {
    const now = new Date().toISOString();

    const stmt = this.database.prepare(`
      INSERT INTO users (id, username, options, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user.id,
      user.username || null,
      JSON.stringify(user.options),
      now,
      now,
    );

    console.log(result);

    return {
      ...user,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Обновить пользователя
   */
  update(
    id: number,
    updates: Partial<Omit<User, "id" | "created_at" | "updated_at">>,
  ): User | undefined {
    const now = new Date().toISOString();
    const existing = this.findById(id);

    if (!existing) {
      return undefined;
    }

    const updatedUser = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    const stmt = this.database.prepare(`
      UPDATE users
      SET username = ?, options = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedUser.username || null,
      JSON.stringify(updatedUser.options),
      now,
      id,
    );

    return updatedUser;
  }

  /**
   * Найти пользователя по ID или создать, если не существует
   * Полезно для команды /start
   */
  findOrCreate(user: Omit<User, "created_at" | "updated_at">): User {
    const existing = this.findById(user.id);

    if (existing) {
      return existing;
    }

    return this.create(user);
  }

  /**
   * Обновить options пользователя
   */
  updateOptions(id: number, options: Record<string, string>): User | undefined {
    const existing = this.findById(id);

    if (!existing) {
      return undefined;
    }

    return this.update(id, { options });
  }

  /**
   * Получить значение из options
   */
  getOption(id: number, key: string): string | undefined {
    const user = this.findById(id);
    if (!user) {
      return undefined;
    }
    return user.options[key];
  }

  /**
   * Установить значение в options
   */
  setOption(id: number, key: string, value: string): User | undefined {
    const existing = this.findById(id);

    if (!existing) {
      return undefined;
    }

    return this.update(id, {
      options: { ...existing.options, [key]: value },
    });
  }

  /**
   * Удалить опцию из options
   */
  deleteOption(id: number, key: string): User | undefined {
    const existing = this.findById(id);

    if (!existing) {
      return undefined;
    }

    const { [key]: _, ...restOptions } = existing.options;

    return this.update(id, {
      options: restOptions,
    });
  }
}
