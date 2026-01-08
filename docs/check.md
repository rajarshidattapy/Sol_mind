backend:

1) LLM routing for Zk
2) better naming of model_id and chat_id
3) delete chat/llm feature
4) rename chats and llms
5) option to store memory/option to stop from storing that info - pvt info
6) api key handling - given only when user buys chat - not visible so openly
if not paid, no api - even though api - x402
7) support for groq/any multi-interface api
8) support for openai, claude
9) proper gpt features in chat


# if stake

already I have good reputation, I get good payout.

- stake should be somehow connected to or directly prop to profit

stake we can give to -> liquidity pool (for profit)

issues:
1) Defi/ blockchain - Kaushik
x402

reputation verify
Issues:

trial 3 chats
1) data privacy of creator
2) 8004 - payment: 
reputation handling



sdk:
1) using via sdk hits mem0 memory layer, adds user prompts to it as well


frontend:
1) better UI


blockchain:
1) every chat is unique - when add new chat is done - added on chain that chat_id


deploy:
1) add cron:
ex:
name: Health Ping

on:
  schedule:
    - cron: "0 */5 * * *"  # every 5 hours

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Call health endpoint
        run: curl https://your-app.onrender.com/health
