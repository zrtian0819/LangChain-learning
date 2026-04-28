/** 
* 這個檔案示範了如何使用 Ollama 來創建一個假的開發者資料物件，並且解析它的內容。
* 
* 執行指令: bun run demo/01_create_fake_object.ts
*/ 

import OllamaService from "../service/OllamaService";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// 獲取 Ollama 服務的單例實例
const ollamaService = OllamaService.getInstance();
const model = ollamaService.getModel();

// 更改model中的temperature參數，讓生成的資料更有隨機性
model.temperature = 0.8;

// --- 後面的 Parser 和 Prompt 邏輯完全不用改 ---
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    name: z.string().describe("姓名"),
    age: z.number().describe("年齡"),
    skills: z.array(z.string()).describe("技能清單")
  })
);

async function getProfile() {
  console.log("▶️ 開始執行 getProfile...");
  try {
    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template: "請隨機生成一個開發者的資料。\n{format_instructions}",
      inputVariables: [],
      partialVariables: { format_instructions: formatInstructions },
    });

    console.log("正在格式化 Prompt...");
    const input = await prompt.format({});
    
    console.log("正在呼叫 Ollama (這可能需要一點時間)...");
    const response = await model.invoke(input);

    console.log("收到 AI 回覆，準備解析...");
    const result = await parser.parse(response.content as string);
    console.log("本地模型生成的資料：\n", result);

  } catch (error) {
    // 這裡會告訴你是連不到 Ollama，還是 AI 格式回傳錯誤
    console.error("發生錯誤了！", error);
  }
}

  await getProfile();