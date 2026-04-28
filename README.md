# LangChain + Ollama Demo

這是一個使用 LangChain 和本地 Ollama 模型的演示專案，展示如何使用結構化輸出解析器生成並解析 AI 回覆。

## 前置要求

在運行 demo 之前，**必須**在本地端安裝以下項目：

1. **Ollama** - 本地 LLM 運行環境
2. **gemma4 模型** - 用於生成開發者資料的 AI 模型

## 安裝步驟

### 1. 安裝 Ollama

#### Windows/Mac/Linux

前往 [Ollama 官方網站](https://ollama.ai) 下載並安裝對應您系統的版本。

- **Windows**: 下載 `.exe` 安裝檔並執行
- **Mac**: 下載 `.dmg` 檔案並安裝
- **Linux**: 執行安裝命令：
  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
  ```

**驗證安裝**：
```bash
ollama --version
```

### 2. 拉取 gemma4 和 embedding 模型

安裝 Ollama 後，需要下載所需的模型到本地：

```bash
# 用於文本生成的主模型
ollama pull gemma4

# 用於 RAG 的 embedding 模型（用於向量化文本）
ollama pull nomic-embed-text
```

> ⚠️ 首次下載可能需要一些時間，請耐心等候模型下載完成

**驗證模型是否已安裝**：
```bash
ollama list
```

你應該會看到 `gemma4` 模型在列表中。

### 3. 啟動 Ollama 服務

在運行 demo 之前，確保 Ollama 服務正在運行：

```bash
ollama serve
```

> 💡 Ollama 服務預設運行在 `http://localhost:11434`

## 環境設置

### 安裝依賴

```bash
bun install
```

## 運行 Demo

確保 Ollama 服務已啟動（見上面的第 3 步），然後執行：

### Demo 1: 基礎結構化輸出

生成隨機開發者資料的基礎示範：

```bash
bun run demo/01_create_fake_object.ts
```

### Demo 2: LCEL 優雅鏈結

使用 LCEL (LangChain Expression Language) 優雅地串接各個組件：

```bash
bun run demo/02_lcel_chain.ts
```

### Demo 3: RAG 完整示範

使用 RAG (Retrieval-Augmented Generation) 從文檔中檢索信息並生成答案：

```bash
bun run demo/03_rag_example.ts
```

此演示會：
- 📂 載入 `demo/info.txt` 中的文檔
- ✂️ 將文檔分割成小塊以便向量化
- 🧮 使用 `nomic-embed-text` 模型進行向量化
- 🔍 根據提問檢索相關的文檔片段
- 🤖 結合 gemma4 模型生成基於文檔的回答

或使用開發模式：

```bash
bun dev
```

### 預期輸出

程式會生成隨機開發者資料並顯示如下結果：

```
程式開始了
開始執行 getProfile...
正在初始化 Parser...
正在格式化 Prompt...
正在呼叫 Ollama (這可能需要一點時間)...
收到 AI 回覆，準備解析...
本地模型生成的資料：
 {
  name: "林曉雯",
  age: 28,
  skills: [ "Python", "Django", "React", "AWS", "Docker" ]
}
```

## 常見問題

### Q: 執行時出現 "無法連接到 Ollama" 的錯誤？
**A**: 確保 Ollama 服務正在運行。執行 `ollama serve` 命令啟動服務。

### Q: 模型下載太慢了怎麼辦？
**A**: 這是正常的，gemma4 模型較大。可以在下載期間進行其他工作，或檢查網路連接。

### Q: 在 Windows 上如何持久化運行 Ollama？
**A**: 安裝後，Ollama 可以設置為開機自動啟動。檢查 Windows 服務中是否有 Ollama 服務。

## 專案結構

```
langchain/
├── demo/
│   └── index.ts          # 主要演示程式
├── service/
│   └── OllamaService.ts  # Ollama 服務（單例模式）
├── package.json
├── .env                  # 環境變數配置
├── .gitignore            # Git 忽略規則
└── README.md             # 本檔案
```

## 技術棧

- **Bun** - JavaScript 運行時
- **TypeScript** - 程式語言
- **LangChain** - AI 應用框架
- **Ollama** - 本地 LLM 運行環境
- **Zod** - 資料驗證和類型推斷

## 相關資源

- [Ollama 官方文檔](https://github.com/ollama/ollama)
- [LangChain 文檔](https://js.langchain.com/)
- [Gemma 模型信息](https://ai.google.dev/gemma/)
