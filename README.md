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
- Setup [Docker CLI](https://docs.docker.com/reference/cli/docker/)

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

**_Step 3:_** Checkout to the _develop_ branch

```bash
git checkout develop
```

**_Step 4:_** Setup own environment variables. Rename the _.env.example_ file to _.env_

- For the FE: Require for stocks endpoint
  - [Alpha Vantage](https://www.alphavantage.co/)
  - [Financial Modeling Prep](https://site.financialmodelingprep.com/)
  - [Polygon](https://polygon.io/)
- For the Chatbot:
  - LangChain key for [LangSmith tracing](https://www.langchain.com/) (optional)
  - [NVIDIA NIM](https://developer.nvidia.com/nim) key to connect to the LLM model
  - [Tavily](https://tavily.com/) tool search for ReAct agent
  - PostgreSQL and PGVector connection string

**_Step 5:_** Install project dependencies

```bash
# For JavaScript code
pnpm i

# For Python code
# Active virtual env
<path_to_venv>/Scripts/activate.bat # For cmd
<path_to_venv>/Scripts/Activate.ps1 # For Powershell

pip install -r requirements.txt
```

**_Step 6:_** Run the applications

```bash
# Run docker compose
docker-compose up -d

# For FE
pnpm --filter financial-web dev

# For API
pnpm --filter financial-api start:dev

# For python
# Active virtual env
<path_to_venv>/Scripts/activate.bat # For cmd
<path_to_venv>/Scripts/Activate.ps1 # For Powershell

# Run app
py apps/chatbot/main.py
```

After shutdown all the services you may want to run `docker-compose down` to shutdown all composes

Any modifies in the `docker-compose.yml` might need to remove the existed volumes

Please contact [with me](mailto:ngquoctoan.02@gmail.com) if have any issues

_Author: Toan Nguyen-Quoc_
