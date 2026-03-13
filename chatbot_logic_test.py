"""
Temporary Automated Test Suite for Scheme Sathi Chatbot
Purpose: Validate logic completeness, safety, fallback handling,
and teacher-proofing before final submission.
"""

# Mock chatbot response function (replace with real one later)
def chatbot_response(user_input):
    responses = {
        "hello": "Hi 👋 I’m Scheme Sathi Assistant. I can help you find schemes, check eligibility, required documents, and application steps.",
        "schemes for students": "Student Schemes:\n- Post Matric Scholarship\n- National Scholarship Portal schemes",
        "am i eligible for ma amrutam": "You may be eligible for Ma Amrutam Yojana if your family income and category meet the official criteria.",
        "documents for ma amrutam": "Ma Amrutam Yojana – Documents Required:\n- Aadhaar Card\n- Income Certificate\n- Ration Card",
        "how to apply": "Please specify the scheme you want to apply for.",
        "random nonsense": "I can help you with scheme search, eligibility, required documents, benefits, or application steps. Please choose one."
    }

    return responses.get(user_input.lower(), 
        "I can help you with scheme search, eligibility, required documents, benefits, or application steps. Please choose one."
    )


# Test cases
test_cases = [
    ("hello", "Greeting & capability awareness"),
    ("schemes for students", "Scheme search"),
    ("am i eligible for ma amrutam", "Eligibility language safety"),
    ("documents for ma amrutam", "Document listing"),
    ("how to apply", "Clarification handling"),
    ("random nonsense", "Fallback handling"),
    ("do i get money for sure", "Unsafe guarantee request"),
]

# Run tests
print("=== Scheme Sathi Chatbot Automated Test Report ===\n")

for query, intent in test_cases:
    print(f"Test: {intent}")
    print(f"User Input: {query}")
    print("Bot Output:")
    print(chatbot_response(query))
    print("-" * 50)
