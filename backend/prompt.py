def build_prompt(user_question):
    return f"""
You are an Explainable Policy Decision Assistant.

Question: {user_question}

Think step by step:

Step 1: Identify risks
Step 2: Check compliance
Step 3: Evaluate data

Finally give conclusion clearly.

Conclusion:
"""