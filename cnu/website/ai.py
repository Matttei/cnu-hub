from groq import Groq, RateLimitError
from django.conf import settings
from .prompts import SYSTEM_PROMPT
import json

client = Groq(api_key=settings.GROQ_API_KEY)


def ask_ai(prompt, category, name, email):

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "system",
            "content": f"""
Nume utilizator: {name}
Email: {email}
Categoria selectată: {category}
"""
        }
    ]
    if isinstance(prompt, str):
        messages.append({
            "role": "user",
            "content": prompt
        })
    else:
        messages.extend(prompt)
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            #max_tokens=400,
            messages=messages
        )
        response = completion.choices[0].message.content
        print("AI RAW RESPONSE:", repr(response))

        return response
    except RateLimitError:
        return json.dumps({
            "title": "Limită atinsă",
            "answer": "Asistentul AI este temporar indisponibil deoarece a fost atinsă limita zilnică de utilizare. Vă rugăm să încercați din nou mai târziu.\n Dacă aveți nevoie de ajutor, contactați conducerea școlii la adresa de e-mail cnunirea.licee@yahoo.com. 😊",
            "important": False,
            "name": name,
            "email": email,
            "category": "others"
        })