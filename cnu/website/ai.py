from groq import Groq, RateLimitError
from django.conf import settings
from .prompts import SYSTEM_PROMPT
from .search import SearchEngine
import json


client = Groq(api_key=settings.GROQ_API_KEY)


def ask_ai(prompt, category, name, email):
    engine = SearchEngine()
    if isinstance(prompt, str):
        search_query = prompt
    else:
        search_query = ""

        for message in reversed(prompt):
            if message.get("role") == "user":
                search_query = message.get("content", "")
                break

    results = engine.search(search_query)
    print(engine.search(search_query))
    context = engine.build_context(search_query)
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "system",
            "content": f"""
    Informații găsite pe site:

    {context}

    Aceste informații au fost extrase automat de pe site-ul oficial.

    Dacă răspunsul utilizatorului poate fi obținut din acest context, folosește EXCLUSIV informațiile din context.

    

    Nu spune că nu ai găsit informații dacă ele există în context.

    Dacă contextul nu conține răspunsul, atunci folosește cunoștințele generale și precizează că informația nu apare pe site.
    """
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
        print("=" * 50)
        print(context)
        print("=" * 50)
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