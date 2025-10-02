import requests
import json
import argparse

class ShopliteChatInterface:
    def __init__(self, api_url):
        self.api_url = api_url
        self.conversation_history = []
    
    def send_message(self, message, prompt_type="base_retrieval_prompt", k=3):
        """Send a message to the RAG API and get the response."""
        try:
            data = {
                "query": message,
                "prompt_type": prompt_type,
                "k": k
            }
            
            print("[Retrieving context...]")
            response = requests.post(f"{self.api_url}/chat", json=data)
            
            if response.status_code == 200:
                result = response.json()
                print("[Calling LLM...]")
                
                # Store in conversation history
                self.conversation_history.append({
                    "query": message,
                    "response": result["response"],
                    "retrieved_documents": result["retrieved_documents"]
                })
                
                return result
            else:
                return {"error": f"API request failed with status code {response.status_code}"}
        except Exception as e:
            return {"error": str(e)}
    
    def display_response(self, result):
        """Display the response in a formatted way."""
        if "error" in result:
            print(f"Error: {result['error']}")
            return
        
        print("\n" + "="*50)
        print("RESPONSE:")
        print("="*50)
        print(result["response"])
        
        if result.get("retrieved_documents"):
            print("\n" + "="*50)
            print("SOURCES:")
            print("="*50)
            for doc in result["retrieved_documents"]:
                print(f"- {doc['title']} (ID: {doc['id']})")
    
    def start_chat(self):
        """Start the interactive chat interface."""
        print("Shoplite RAG Chat Interface")
        print(f"Connected to API: {self.api_url}")
        print("Type 'exit' to quit, 'history' to view conversation history, or 'help' for commands.")
        print("="*50)
        
        while True:
            user_input = input("\n> ")
            
            if user_input.lower() == 'exit':
                print("Goodbye!")
                break
            elif user_input.lower() == 'history':
                self.display_history()
                continue
            elif user_input.lower() == 'help':
                self.display_help()
                continue
            elif not user_input.strip():
                continue
            
            # Send the message and display the response
            result = self.send_message(user_input)
            self.display_response(result)
    
    def display_history(self):
        """Display the conversation history."""
        if not self.conversation_history:
            print("No conversation history yet.")
            return
        
        print("\n" + "="*50)
        print("CONVERSATION HISTORY:")
        print("="*50)
        
        for i, entry in enumerate(self.conversation_history, 1):
            print(f"\n--- Exchange {i} ---")
            print(f"Query: {entry['query']}")
            print(f"Response: {entry['response']}")
            
            if entry.get("retrieved_documents"):
                print("Sources:")
                for doc in entry["retrieved_documents"]:
                    print(f"- {doc['title']} (ID: {doc['id']})")
    
    def display_help(self):
        """Display help information."""
        print("\n" + "="*50)
        print("HELP:")
        print("="*50)
        print("Available commands:")
        print("- 'exit': Exit the chat interface")
        print("- 'history': View conversation history")
        print("- 'help': Show this help message")
        print("\nYou can also ask questions about Shoplite, such as:")
        print("- 'How do I create a seller account?'")
        print("- 'What are Shoplite's return policies?'")
        print("- 'How does order tracking work?'")
    
    def save_history(self, filename):
        """Save conversation history to a file."""
        try:
            with open(filename, 'w') as f:
                json.dump(self.conversation_history, f, indent=2)
            print(f"Conversation history saved to {filename}")
        except Exception as e:
            print(f"Error saving history: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description="Shoplite RAG Chat Interface")
    parser.add_argument("--url", required=True, help="API URL (e.g., https://your-ngrok-url.ngrok.io)")
    parser.add_argument("--save", help="Filename to save conversation history")
    
    args = parser.parse_args()
    
    chat_interface = ShopliteChatInterface(args.url)
    chat_interface.start_chat()
    
    if args.save:
        chat_interface.save_history(args.save)

if __name__ == "__main__":
    main()
