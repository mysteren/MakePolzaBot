/**
 * Асинхронная функция для задержки выполнения
 * @param ms Время задержки в миллисекундах
 * @returns Promise, который резолвится через указанное время
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
