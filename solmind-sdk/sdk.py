from solmind import Agent

# Initialize agent with wallet address for authentication
agent = Agent(
    agent_id="custom-3aa06046",
    chat_id="7b873ca5-880b-478b-8fe7-512fc9d4a3fc",
    wallet_address="AmfxkopBWbsF5qgQDCica6jGQ3NyMDhcLqcoRFzJodfJ",
    base_url="http://localhost:8000"  # Optional: defaults to localhost:8000
)

# Send a message to the agent
# The message is saved to chat history and memory is automatically updated
response = agent.chat("Analyze the chat history and provide a summary of the conversation. Please be concise and to the point.")

print(response)