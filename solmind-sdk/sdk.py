from solmind import Agent

# Initialize agent with wallet address for authentication
agent = Agent(
    agent_id="custom-3aa06046",
    chat_id="df4bddfe-002c-46a7-a409-ad76bd10973b",
    wallet_address="AmfxkopBWbsF5qgQDCica6jGQ3NyMDhcLqcoRFzJodfJ",
    base_url="http://localhost:8000"  # Optional: defaults to localhost:8000
)

# Send a message to the agent
# The message is saved to chat history and memory is automatically updated
response = agent.chat("Analyze the chat history and provide a summary of the conversation")

print(response)