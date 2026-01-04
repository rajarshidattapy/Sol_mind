from solmind import Agent

# Initialize agent with wallet address for authentication
agent = Agent(
    agent_id="custom-1da9863b",
    chat_id="455dc692-df83-413d-bc48-e68af5525a71",
    wallet_address="5UMbS37mHgE5WCiwPUibRCSwGJNm5u76UKgwrents2ok",  # Replace with your Solana wallet address
    base_url="http://localhost:8000"  # Optional: defaults to localhost:8000
)

# Send a message to the agent
# The message is saved to chat history and memory is automatically updated
response = agent.chat("Analyze the chat history and provide a summary of the conversation")

print(response)