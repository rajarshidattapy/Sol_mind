backend:

1) LLM routing for Zk
5) option to store memory/option to stop from storing that info - pvt info
6) api key handling - given only when user buys chat - not visible so openly
if not paid, no api - even though api - x402
9) proper gpt features in chat
10) 8004 - payment: reputation handling
11) trial 3 chats
12) data privacy of creator


# Defi/ blockchain - Kaushik
x402
every chat is unique - when add new chat is done - added on chain that chat_id
Stake:
already I have good reputation, I get good payout.
- stake should be somehow connected to or directly prop to profit
stake we can give to -> liquidity pool (for profit)
reputation verify

sdk:
1) using via sdk hits mem0 memory layer, adds user prompts to it as well


frontend:
1) better UI


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
