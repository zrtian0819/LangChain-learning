/** 
* 這個檔案示範了如何使用 RAG (Retrieval-Augmented Generation) 模式
* 結合向量搜索和生成式 AI，從文檔中檢索相關信息並生成答案
* 
* RAG 工作流程：
* 1. 載入文檔
* 2. 分割成小塊
* 3. 向量化和存儲
* 4. 基於問題檢索相關文檔
* 5. 結合檢索結果和 AI 生成答案
* 
* 執行指令: bun run demo/03_rag_example.ts
*/ 

import OllamaService from "../service/OllamaService";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

console.log("▶️ RAG (Retrieval-Augmented Generation) 演示開始\n");

async function runRAG() {
  try {
    // A. 載入文檔
    console.log("📂 正在載入文檔...");
    const loader = new TextLoader("./demo/info.txt");
    const docs = await loader.load();
    console.log(`✅ 已載入文檔，內容長度: ${docs[0].pageContent.length} 字符\n`);

    // B. 文檔分割：把長文章切成 500 字的小塊
    console.log("✂️ 正在分割文檔為小塊...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50, // 每一塊重複一點點，確保上下文不中斷
    });
    const allSplits = await splitter.splitDocuments(docs);
    console.log(`✅ 已分割為 ${allSplits.length} 個文檔塊\n`);

    // C. 向量化並存入庫 (使用 Ollama 的 Embedding)
    console.log("🧮 正在向量化文檔...");
    const vectorStore = await MemoryVectorStore.fromDocuments(
      allSplits,
      new OllamaEmbeddings({ model: "nomic-embed-text" })
    );
    console.log("✅ 向量存儲已建立\n");

    // D. 建立檢索器 (Retriever)
    const retriever = vectorStore.asRetriever();

    // E. 獲取模型
    const ollamaService = OllamaService.getInstance();
    const model = ollamaService.getModel();

    // 定義問題
    const questions = [
      "請列出 2026 年桃園必去的 3 個旅遊景點",
      "中原文創園區的營業時間是？它有什麼特色活動？",
      "如果我想去看水族館，應該去哪裡？它有什麼特別的體驗？",
    ];

    // 處理每個問題
    for (const question of questions) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`❓ 問題: ${question}\n`);

      // 1. 先去搜相關片段
      console.log("🔍 正在檢索相關文檔...");
      const relevantDocs = await retriever.invoke(question);
      const context = relevantDocs
        .map((d, i) => `[文檔片段 ${i + 1}]\n${d.pageContent}`)
        .join("\n\n");

      console.log(`✅ 找到 ${relevantDocs.length} 個相關片段\n`);

      // 2. 使用 LCEL 串接 Prompt + Model + Parser
      const prompt = PromptTemplate.fromTemplate([
        "你是一位專業的桃園旅遊顧問，對 2026 年桃園的所有景點、交通、美食都非常了解。",
        "",
        "請根據以下提供的參考資料來詳細回答旅客的問題。",
        "如果資料中沒有提到相關信息，請誠實地說你不知道。",
        "",
        "參考資料：",
        "{context}",
        "",
        "旅客提問：{question}",
        "",
        "請提供實用、詳細且親切的旅遊建議：",
      ].join("\n"));


      const chain = prompt.pipe(model).pipe(new StringOutputParser());

      console.log("🤖 正在生成回答...\n");
      const response = await chain.invoke({ context, question });

      console.log("📝 AI 的回答：");
      console.log(response);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("✅ RAG 演示完成！");
  } catch (error) {
    console.error("❌ 執行過程中出錯：", error);
  }
}

runRAG();
