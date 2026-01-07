import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Global variables for connections
groq_client = None
collection = None
chat_histories = {}  # Store chat histories per session

def initialize_connections():
    """Initialize and validate API and database connections."""
    global groq_client, collection
    
    try:
        # Validate environment variables
        groq_api_key = os.getenv("GROQ_API_KEY")
        mongo_uri = os.getenv("MONGO_URI")
        
        if not groq_api_key:
            raise Exception("GROQ_API_KEY not found in .env file")
        if not mongo_uri:
            raise Exception("MONGO_URI not found in .env file")
        
        # Initialize Groq client
        groq_client = Groq(api_key=groq_api_key)
        
        # Initialize MongoDB client
        mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test MongoDB connection
        mongo_client.admin.command('ping')
        print("✓ Successfully connected to MongoDB")
        
        db = mongo_client["geargeniedb"]
        collection = db["vehicles"]
        
        # Check if collection has data
        doc_count = collection.count_documents({})
        print(f"✓ Found {doc_count} vehicle records in database")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to initialize connections: {e}")
        return False

def get_context_from_mongo(query):
    """
    Intelligent search across multiple fields in MongoDB.
    Searches for: Vehicle IDs, Service Types, Customer Names, Failure Categories.
    """
    try:
        # Clean and prepare query
        clean_query = query.strip()
        
        # Build flexible search query
        search_query = {"$or": [
            {"vehicle_id": {"$regex": clean_query, "$options": "i"}},
            {"make": {"$regex": clean_query, "$options": "i"}},
            {"model": {"$regex": clean_query, "$options": "i"}},
            {"service_type": {"$regex": clean_query, "$options": "i"}},
            {"failure_category": {"$regex": clean_query, "$options": "i"}},
            {"customer_name": {"$regex": clean_query, "$options": "i"}},
            {"repair_justification": {"$regex": clean_query, "$options": "i"}}
        ]}
        
        # Find matching documents
        results = list(collection.find(search_query).limit(5))
        
        if not results:
            return "No matching vehicle records found in database.", False
        
        # Format context with all relevant information
        context_text = "=== DATABASE RECORDS FOUND ===\n\n"
        for idx, doc in enumerate(results, 1):
            doc.pop('_id', None)  # Remove MongoDB internal ID
            context_text += f"RECORD #{idx}:\n"
            
            # Format each field clearly
            for key, value in doc.items():
                formatted_key = key.replace('_', ' ').title()
                context_text += f"  • {formatted_key}: {value}\n"
            context_text += "\n" + "="*50 + "\n\n"
        
        return context_text, True
        
    except Exception as e:
        return f"Database search error: {str(e)}", False

def create_system_prompt(database_context, has_results):
    """Create a detailed system prompt for the AI."""
    
    base_prompt = """You are 'GearGenie', a friendly and knowledgeable vehicle service advisor. You're like talking to a helpful mechanic friend who genuinely cares about helping people understand their vehicle issues.

YOUR COMMUNICATION STYLE:
- Talk like a real person having a conversation, not a formal report
- Never use markdown formatting (no **, ##, bullets, or numbered lists)
- Write in flowing paragraphs that feel natural to read
- Use everyday language, avoid technical jargon unless necessary
- Use words like "approximately", "around", "about", "roughly" when giving estimates
- Be warm, empathetic, and genuinely helpful
- Keep responses concise but informative (2-4 short paragraphs max)

YOUR PERSONALITY:
- Friendly and approachable, like chatting with a knowledgeable friend
- Understanding about cost concerns
- Patient in explaining things
- Honest and transparent
- Reassuring without being pushy

IMPORTANT FORMATTING RULES:
❌ NEVER use asterisks (**) for emphasis
❌ NEVER use bullet points (•) or numbered lists (1., 2., 3.)
❌ NEVER use headers with # or ##
✓ Write in natural flowing paragraphs
✓ Use simple line breaks between thoughts
✓ Emphasize with words, not symbols

"""

    if has_results:
        prompt = base_prompt + f"""
DATABASE CONTEXT FOR THIS QUERY:
{database_context}

HOW TO RESPOND:

If user greets you (hi, hello, hey):
Just respond warmly like: "Hey there! I'm GearGenie, your vehicle service advisor. I'm here to help with any questions about vehicle repairs, service costs, or maintenance. What's on your mind today?"

When presenting service information:
Write in natural flowing paragraphs. Start by acknowledging what you found, then smoothly explain the service details. Include cost and time estimates using approximate language. Explain why the service matters in simple terms.

Example of good response style:

"I found information about that brake service in our records. From what I can see, this repair typically runs around $485, and it usually takes about 3 to 4 hours to complete.

The reason this repair is needed is because your brake pads have worn down quite a bit. If we don't address this soon, it could damage the rotors, which would make the repair significantly more expensive. Plus, worn brakes are a serious safety concern since they affect your stopping distance.

I know the cost might seem high, but this includes quality parts and professional installation to make sure everything works safely. Your brakes are really the most important safety feature on your vehicle, so it's definitely worth taking care of. Let me know if you have any questions about this!"

Key points:
- Present information conversationally
- Use "around", "about", "approximately" with all numbers
- Keep paragraphs short (2-4 sentences each)
- Show empathy about costs
- Explain things simply
- End with an invitation to ask more
"""
    else:
        prompt = base_prompt + f"""
{database_context}

CURRENT SITUATION: No exact matching records found for this specific query.

HOW TO RESPOND:

If user is greeting:
Respond warmly: "Hi! I'm GearGenie, your vehicle service advisor. I can help answer questions about repairs, maintenance, and service costs. What can I help you with?"

If user asked a question but no data found:
Politely let them know you couldn't find exact records, but offer helpful general information based on your automotive knowledge. Stay conversational and helpful.

Example response style:

"I couldn't find exact matching records for that specific issue in our database, but I can share some general information that might help.

For brake repairs, you're typically looking at somewhere between $300 to $600, depending on what exactly needs to be done and what type of vehicle you have. The labor usually takes around 2 to 4 hours. If the rotors need replacing too, that could add another $200 to $400 to the total.

The most important thing with brakes is to address any issues early. If you're hearing squealing, grinding, or notice the brake pedal feels soft, those are signs you should get it checked out soon. Catching problems early can actually save you money in the long run.

Is there anything specific about the repair you'd like to know more about?"

Remember:
- Stay helpful and conversational
- Use approximate language for all numbers
- Keep it simple and easy to read
- Offer value even without exact data
- Never use formatting symbols
"""
    
    return prompt

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests from the frontend."""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')  # Optional: track different users
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Initialize chat history for new sessions
        if session_id not in chat_histories:
            chat_histories[session_id] = []
        
        # Search database for relevant context
        database_context, has_results = get_context_from_mongo(user_message)
        
        # Create system prompt with context
        system_prompt = create_system_prompt(database_context, has_results)
        
        # Build messages for API
        messages = [
            {"role": "system", "content": system_prompt},
            *chat_histories[session_id][-8:],  # Keep last 8 messages for context
            {"role": "user", "content": user_message}
        ]
        
        # Call Groq API
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9
        )
        
        response = completion.choices[0].message.content
        
        # Update chat history
        chat_histories[session_id].append({"role": "user", "content": user_message})
        chat_histories[session_id].append({"role": "assistant", "content": response})
        
        # Keep history manageable (last 10 messages)
        if len(chat_histories[session_id]) > 10:
            chat_histories[session_id] = chat_histories[session_id][-10:]
        
        return jsonify({
            'response': response,
            'status': 'success'
        })
    
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': 'An error occurred processing your request',
            'details': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'groq_connected': groq_client is not None,
        'mongodb_connected': collection is not None
    })

@app.route('/clear-history', methods=['POST'])
def clear_history():
    """Clear chat history for a session."""
    try:
        data = request.json
        session_id = data.get('session_id', 'default')
        
        if session_id in chat_histories:
            chat_histories[session_id] = []
        
        return jsonify({
            'status': 'success',
            'message': 'Chat history cleared'
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to clear history',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("    🚗 GEARGENIE FLASK SERVER 🚗")
    print("="*60)
    print("\nInitializing connections...\n")
    
    if initialize_connections():
        print("\n" + "="*60)
        print("Server starting on http://0.0.0.0:5001")
        print("="*60 + "\n")
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("\n❌ Failed to initialize. Please check your configuration.\n")