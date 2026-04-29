/**
 * 這個檔案示範了如何使用 Ollama 服務來生成結構化的汽車資料。
 * 透過 Zod Schema 定義了汽車資料的結構，並使用 
 * StructuredOutputParser 來解析 AI 回傳的 JSON。
 * 
 * 執行指令:
 * bun run practice\01_format_count_response.ts 
 * 
 */

import OllamaService from "../service/OllamaService";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// 獲取 Ollama 服務的單例實例
const ollamaService = OllamaService.getInstance();
const model = ollamaService.getModel();

// 更改model中的temperature參數，讓生成的資料更有隨機性
model.temperature = 0.9;

// --- 後面的 Parser 和 Prompt 邏輯完全不用改 ---
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    cars: z.array(
      z.object({
        id: z.string().describe("型號"),
        brand: z.string().describe("品牌"),
        feature: z.array(z.string()).describe("特色清單")
      })
    ).describe("汽車資料清單")
  })
);

const getProfile = async (count: number = 1) => {
    console.log("▶️ 開始執行 getProfile...");

    try{
        const formatInstructions = parser.getFormatInstructions();
    
        const prompt = new PromptTemplate({
          template: `請隨機生成${count}筆汽車的資料。\n{format_instructions}`,
          inputVariables: [],
          partialVariables: { format_instructions: formatInstructions },
        });
    
        const input = await prompt.format({});
    
        const response = await model.invoke(input);
    
        const result = await parser.parse(response.content as string);
        console.log("✅ getProfile 執行完成:\n", result); 
    }catch(error){
        console.error("發生錯誤了！", error);
    }
}

 await getProfile(10);


 /*
 ✅測試結果
 
{
  cars: [
    {
      id: "Model 3",
      brand: "Tesla",
      feature: [ "全電動", "自動輔助駕駛", "OTA更新", "高性能" ],
    }, {
      id: "CT5",
      brand: "Chevrolet",
      feature: [ "運動操控", "油電混合動力", "燃油效率", "美式設計" ],
    }, {
      id: "Model S",
      brand: "Tesla",
      feature: [ "長續航里程", "四輪驅動", "豪華內裝", "快速充電" ],
    }, {
      id: "CR-V",
      brand: "Honda",
      feature: [ "實用空間", "油耗經濟", "可靠耐用", "小型SUV" ],
    }, {
      id: "XV70",
      brand: "Toyota",
      feature: [ "全天候可靠", "混動技術", "越野能力", "家庭適用" ],
    }, {
      id: "GLE 450",
      brand: "Mercedes-Benz",
      feature: [ "豪華舒適", "高階科技", "平穩騎乘", "品牌地位" ],
    }, {
      id: "RAV4",
      brand: "Toyota",
      feature: [ "環保友善", "城市通勤", "操作簡便", "混動車款" ],
    }, {
      id: "Mustang",
      brand: "Ford",
      feature: [ "肌肉風格", "純粹駕駛樂趣", "V8引擎", "美式跑車" ],
    }, {
      id: "CLS 550",
      brand: "Mercedes-Benz",
      feature: [ "流線型車身", "極致奢華", "舒適乘坐體驗", "高品位設計" ],
    }, {
      id: "A5 Sportback",
      brand: "Audi",
      feature: [ "跨界風格", "科技感十足", "AD平台的優勢", "運動性能" ],
    }
  ],
}
 
 */