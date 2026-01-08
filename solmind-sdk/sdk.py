from solmind import Agent

# Initialize agent with wallet address for authentication
agent = Agent(
    agent_id="custom-d81856fd",
    chat_id="2a7f7064-0983-4cbb-beda-7391c339d068",
    wallet_address="AmfxkopBWbsF5qgQDCica6jGQ3NyMDhcLqcoRFzJodfJ",
    base_url="http://localhost:8000"  # Optional: defaults to localhost:8000
)

# Send a message to the agent
# The message is saved to chat history and memory is automatically updated
response = agent.chat("What is Kaushik")

print(response)