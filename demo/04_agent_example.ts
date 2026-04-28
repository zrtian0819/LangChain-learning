/** 
* 這個檔案示範了如何使用 Agent (代理) 模式
* 結合語言模型和自訂工具，讓 AI 能夠思考 (Thought) 和採取行動 (Action)
* 
* Agent 工作流程：
* 1. 接收用戶問題
* 2. 大腦 (LLM) 進行思考
* 3. 決定要使用哪個工具
* 4. 執行工具並獲得結果
* 5. 根據結果進行下一步思考
* 6. 最終給出答案
* 
* 執行指令: bun run demo/04_agent_example.ts
*/ 

import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createReactAgent } from "@langchain/classic/agents";
import { PromptTemplate } from "@langchain/core/prompts";
import OllamaService from "../service/OllamaService";

async function runAgent() {
  console.log("初始化 Agent Demo...");
  
  // 1. 定義大腦 - 透過單例模式取得共用的 Ollama 模型
  const model = OllamaService.getInstance().getModel();

  // 2. 定義工具 (手腳)
  // 我們自訂一個計算字數 (長度) 的工具
  const wordCounterTool = new DynamicTool({
    name: "word_counter",
    description: "當你需要計算一段文字有幾個字的時候使用。輸入應該是要計算的文字。",
    func: async (input: string) => `這段文字的長度是 ${input.length} 個字`,
  });

  const tools = [wordCounterTool];

  // 3. 準備提示詞 (Agent 需要特殊的提示詞來告訴它如何思考)
  const prompt = PromptTemplate.fromTemplate(`
    回答以下問題。你可以使用以下工具：
    {tools}

    使用以下格式：
    Question: 你必須回答的問題
    Thought: 你應該思考要做什麼
    Action: 要採取的行動，必須是 [{tool_names}] 之一
    Action Input: 行動的輸入
    Observation: 行動的結果
    ... (這個 Thought/Action/Action Input/Observation 可以重複 N 次)
    Thought: 我現在知道最終答案了
    Final Answer: 對原始問題的最終回答

    問題: {input}
    Thought: {agent_scratchpad}
  `);

  // 4. 建立 Agent
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  // 5. 執行
  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // 開啟 verbose 以便觀察 Agent 的決策過程 (Thought, Action)
  });

  const question = "請問 'TypeScript is awesome' 這句話有幾個字？";
  console.log(`\n問題: ${question}\n`);
  
  const result = await executor.invoke({
    input: question,
  });

  console.log("\n==============================");
  console.log("Agent 的最終回答：", result.output);
  console.log("==============================\n");
}

runAgent().catch(console.error);
