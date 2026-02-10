import OpenAI from "openai";
import { sleep } from "../shared/utils.js";

type genStatusResponse = {
  id: string;
  status: "COMPLETED" | "FAILED";
  url: string;
};

export class PolzaRequestUseCase {
  private openAi: OpenAI;

  private baseURL: string;

  private apiKey: string;

  constructor(apiKey: string) {
    this.baseURL = "https://api.polza.ai/api/v1";
    this.apiKey = apiKey;

    this.openAi = new OpenAI({
      baseURL: this.baseURL,
      apiKey,
    });
  }

  private async getImageGenStatus(id: string) {
    const response = await fetch(this.baseURL + "/images/" + id, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = (await response.json()) as genStatusResponse;

    return result;
  }

  async getText(content: string) {
    const completion = await this.openAi.chat.completions.create({
      model: "z-ai/glm-4.7-flash",
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    return completion.choices[0]?.message;
  }

  async getImage(prompt: string) {
    const response = await this.openAi.images.generate({
      model: "seedream-v4",
      prompt,
      n: 1,
      quality: "standard",
      response_format: "url",
    });

    console.log("Initial generation result:");
    console.dir(response, { depth: null });

    // Получаем ID сгенерированного изображения для отслеживания статуса
    const imageId = (response as unknown as { requestId: string }).requestId;

    if (!imageId) {
      throw new Error("Failed to get image ID from response");
    }

    console.log(`Tracking image generation with ID: ${imageId}`);

    // Поллинг статуса каждые 5 секунд, максимум 12 попыток (1 минута)
    const maxAttempts = 12;
    let attempt = 0;
    let finalStatus: genStatusResponse | null = null;
    let url: string;

    while (attempt < maxAttempts) {
      attempt++;

      try {
        const status = await this.getImageGenStatus(imageId);
        console.log(
          `Attempt ${attempt}/${maxAttempts}: Status = ${status.status}`,
        );

        if (status.status === "COMPLETED" || status.status === "FAILED") {
          finalStatus = status;
          url = status.url ?? "";
          break;
        }

        // Ждем 5 секунд перед следующей проверкой
        await sleep(5000);
      } catch (error) {
        console.error(`Error checking status (attempt ${attempt}):`, error);
        await sleep(5000);
      }
    }

    if (!finalStatus) {
      throw new Error(
        "Image generation timeout: status not resolved within 1 minute",
      );
    }

    console.log("Final status:");
    console.dir(finalStatus, { depth: null });

    return { url, status: finalStatus };
  }
}
