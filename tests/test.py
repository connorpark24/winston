input_text = """1. What is the function of a p-type transistor in a circuit?
A) Outputs 1 when input is 1
B) Outputs 0 when input is 1
C) Disconnected output when input is 1
D) Outputs 1 when input is 0

2. When connecting the outputs of a p-type and n-type transistor, what does the resulting circuit do?
A) NOR operation
B) OR operation
C) AND operation
D) NAND operation

3. How can a NOR gate be changed to an OR gate using transistors?
A) Altering the input wiring
B) Reversing the connection of the transistors
C) Adding an extra transistor
D) Changing the output wiring

4. Which configuration allows the implementation of an OR gate with 3 inputs using transistors?
A) A p-type, B p-type, C p-type
B) A n-type, B n-type, C n-type
C) A p-type, B n-type, C p-type
D) A n-type, B p-type, C n-type

5. How can a NAND gate be converted to an AND gate using transistors?
A) Switching the input connections
B) Changing the transistor types
C) Modifying the output wiring
D) Reversing the output states"""

# Split the input text into individual questions
questions = input_text.strip().split('\n\n')

# Create an array of questions with their respective answers
parsed_questions = []

for question in questions:
    lines = question.split('\n')
    question_text = lines[0].split('. ', 1)[1]  # Remove the question number
    answers = [line.split(') ', 1)[1] for line in lines[1:]]  # Remove the answer labels
    parsed_questions.append({'question': question_text, 'answers': answers})

# Print the parsed questions
for q in parsed_questions:
    print(q)