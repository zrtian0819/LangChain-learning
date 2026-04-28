/** 
* 這個檔案示範了如何使用 LCEL (LangChain Expression Language) 優雅地串接各個組件
* 
* LCEL 的優勢：
* - 代碼簡潔優雅
* - 邏輯清晰易懂
* - 支援流式處理
* - 自動錯誤處理
* 
* 執行指令: bun run demo/02_lcel_chain.ts
*/ 

import OllamaService from "../service/OllamaService";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

console.log("▶️ LCEL 鏈結演示開始\n");

// 1. 獲取 Ollama 服務的單例實例
const ollamaService = OllamaService.getInstance();
const model = ollamaService.getModel();

// 2. 定義結構化輸出的 Schema
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    topic: z.string().describe("主題"),
    summary: z.string().describe("簡介"),
  })
);

// 3. 定義提示詞範本
const prompt = PromptTemplate.fromTemplate(
  `請幫我介紹一個關於 {input} 的前端技術概念。
{format_instructions}`
);

// 4. ✨ 重點：建立鏈結 (The Chain) ✨
// 使用 LCEL pipe 操作符優雅地串接：提示詞 -> 模型 -> 解析器
// 這行代碼就把所有的邏輯串起來了！
const chain = prompt.pipe(model).pipe(parser);

// 5. 執行鏈結
async function runChain() {
  try {
    console.log("📝 設置輸入參數...");
    const input = "TypeScript 泛型";
    
    console.log("🔗 通過 LCEL 鏈結執行請求...");
    console.log(`📌 主題: ${input}\n`);
    
    const result = await chain.invoke({
      input: input,
      format_instructions: parser.getFormatInstructions(),
    });

    console.log("✅ 鏈結執行成功！\n");
    console.log("📄 生成的技術概念：");
    console.log(`  主題: ${result.topic}`);
    console.log(`  簡介: ${result.summary}`);
  } catch (error) {
    console.error("❌ 執行過程中出錯：", error);
  }
}

runChain();
