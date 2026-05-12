/**
 * RAG 範例：讀取 PDF 文件並建立向量資料庫，讓你可以對文件內容提問
 *
 * 工作流程：
 * 1. 用 PDFLoader 載入 PDF
 * 2. 用 RecursiveCharacterTextSplitter 切割成小塊
 * 3. 用 OllamaEmbeddings 向量化並存入 MemoryVectorStore
 * 4. 建立 Retriever，根據問題撈出相關段落
 * 5. 組合 Prompt + Model 生成最終答案
 *
 * 執行指令: bun run practice/02_rag_readpdf.ts
 */

import OllamaService from "../service/OllamaService";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// ✏️ 在這裡填入你想問的問題
const question = "請用一句話告訴我強化學習在說什麼? 請幫我摘要並回饋給我。";

async function runRAG() {
  try {
    // A. 載入 PDF 文件
    console.log("📂 正在載入 PDF 文件...");
    const loader = new PDFLoader(
      "./demo/Reinforcement learning an introduction_Richard Sutton.pdf"
    );
    const docs = await loader.load();
    console.log(`✅ 已載入 ${docs.length} 頁\n`);

    // B. 文檔分割
    console.log("✂️ 正在分割文檔為小塊...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    const allSplits = await splitter.splitDocuments(docs);
    console.log(`✅ 已分割為 ${allSplits.length} 個文檔塊\n`);

    // C. 向量化並存入記憶體向量資料庫
    console.log("🧮 正在向量化文檔（這可能需要幾分鐘）...");
    const vectorStore = await MemoryVectorStore.fromDocuments(
      allSplits,
      new OllamaEmbeddings({ model: "nomic-embed-text" })
    );
    console.log("✅ 向量資料庫已建立\n");

    // D. 建立檢索器
    const retriever = vectorStore.asRetriever({ k: 5 });

    // E. 檢索相關段落
    console.log(`❓ 問題: ${question}\n`);
    console.log("🔍 正在檢索相關文檔段落...");
    const relevantDocs = await retriever.invoke(question);
    const context = relevantDocs
      .map((d, i) => `[段落 ${i + 1}]\n${d.pageContent}`)
      .join("\n\n");
    console.log(`✅ 找到 ${relevantDocs.length} 個相關段落\n`);

    // F. 組合 Prompt 並用模型生成答案
    const prompt = PromptTemplate.fromTemplate(
      [
        "你是一位強化學習領域的專家，熟悉 Richard Sutton 的《Reinforcement Learning: An Introduction》。",
        "請根據以下從書中擷取的段落，詳細回答問題。",
        "如果段落中沒有足夠資訊，請誠實說明。",
        "",
        "參考段落：",
        "{context}",
        "",
        "問題：{question}",
        "",
        "請提供清晰且完整的回答：",
      ].join("\n")
    );

    const ollamaService = OllamaService.getInstance();
    const model = ollamaService.getModel();
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    console.log("🤖 正在生成回答...\n");
    const response = await chain.invoke({ context, question });

    console.log("📝 AI 的回答：");
    console.log("=".repeat(60));
    console.log(response);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ 發生錯誤：", error);
  }
}

runRAG();
