# Graduation Project

Topic: Build a financial market analysis website using linguistic model to support predicting future financial trends

## Design

[Design](https://stockanalysis.com/)

## Key Technical

- React
- LLMs
- LangChain
- LangGraph
- FastAPI

## Prerequisites

- NodeJS equal or above (v20.18.0)
- Python equal or above (v3.11.0)
- Setup virtual environment python ([optional](https://docs.python.org/3/library/venv.html))
- Setup MongoDB local or Atlas

## Install and Run

Open Windows PowerShell or cmd or [Windows Terminal](https://www.microsoft.com/en-gb/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab)

**_Step 1:_** Clone repo

```bash
git clone git@github.com:QToan1202/financial-analysis.git
```

**_Step 2:_** Move to _financial-analysis_ folder

```bash
cd financial-analysis
```

- Checkout to branch:
  - feature/create-ui: for web app
  - feature/create-chat-model: for the chatbot

```bash
# For web
cd apps/financial-web

# For chat model
cd apps/chatbot
```

**_Step 3:_** Setup own environment variables. Rename the _.env.example_ file to _.env_

- For the FE: Require for stocks endpoint
  - [Alpha Vantage](https://www.alphavantage.co/)
  - [Financial Modeling Prep](https://site.financialmodelingprep.com/)
  - [Polygon](https://polygon.io/)
- For the Chatbot:
  - LangChain key for [LangSmith tracing](https://www.langchain.com/) (optional)
  - [NVIDIA NIM](https://developer.nvidia.com/nim) key to connect to the LLM model
  - [MongoDB](https://www.mongodb.com/) for the tradition database as well as vector database. Make sure your database can create at lease 2 search indexes
  - [Tavily](https://tavily.com/) tool search for ReAct agent

**_Step 4:_** Install project dependencies

```bash
# For JavaScript code
pnpm i

# For Python code
pip install -r requirements.txt
```

**_Step 5:_** Run the applications

```bash
# For web
pnpm --filter financial-web dev

# For python
# Active virtual env
<path_to_venv>/Scripts/activate.bat # For cmd
<path_to_venv>/Scripts/Activate.ps1 # For Powershell

# Run app
py main.py
```
