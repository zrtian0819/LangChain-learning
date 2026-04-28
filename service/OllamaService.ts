import { ChatOllama } from "@langchain/ollama";

/**
 * Ollama 服務 - 使用單例模式
 * 確保全應用中只有一個 Ollama 模型實例
 */
class OllamaService {
  private static instance: OllamaService;
  private model: ChatOllama;

  private constructor() {
    this.model = new ChatOllama({
      baseUrl: "http://localhost:11434", // 本地 Ollama 的地址
      model: "gemma4", // 確認你的 Ollama 裡已經 pull 了這個模型
      temperature: 0,
    });
  }

  /**
   * 獲取 OllamaService 的唯一實例
   */
  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  /**
   * 獲取 ChatOllama 模型
   */
  public getModel(): ChatOllama {
    return this.model;
  }
}

export default OllamaService;
