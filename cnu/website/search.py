from .models import Anunt, Events, Teacher
from django.db.models import Q
from django.urls import reverse
import unicodedata
import re
BASE_URL = "https://cnu-hub.onrender.com"

def normalize(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join(
        c for c in text
        if unicodedata.category(c) != "Mn"
    )
    return text.lower()


def extract_keywords(query):
    query = normalize(query)

    words = re.findall(r"\w+", query)

    stopwords = {
        "cine", "este", "sunt", "care", "ce", "despre",
        "profesor", "profesoara", "profesorul", "profesoarei",
        "domnul", "doamna", "va", "imi", "spune", "un", "o",
        "la", "din", "si", "cu", "de", "a", "al", "ale",
        "pentru", "care", "cat", "cand", "unde"
    }

    return [w for w in words if w not in stopwords]


class SearchEngine:

    def search_anunt(self, query):
        results = []
        keywords = extract_keywords(query)

        anunturi = Anunt.objects.all()

        for anunt in anunturi:
            score = 0

            titlu = normalize(anunt.titlu)
            continut = normalize(anunt.continut)

            for word in keywords:
                if word in titlu:
                    score += 100
                if word in continut:
                    score += 20

            if score > 0:
                results.append({
                    "title": anunt.titlu,
                    "content": anunt.continut,
                    "url": reverse("publicatie", args=[anunt.id]),
                    "type": "Publicatie",
                    "score": score
                })

        return results


    def search_teacher(self, query):
        results = []
        keywords = extract_keywords(query)

        teachers = Teacher.objects.all()

        for teacher in teachers:

            name = normalize(teacher.name)
            subject = normalize(teacher.subject)

            score = 0

            for word in keywords:
                if word in name:
                    score += 100
                if word in subject:
                    score += 40

            if score > 0:
                results.append({
                    "title": teacher.name,
                    "content": teacher.subject,
                    "url": reverse("personal_didactic"),
                    "type": "Profesor",
                    "score": score,
                })

        return results


    def search_events(self, query):
        results = []
        keywords = extract_keywords(query)

        events = Events.objects.all()

        for event in events:
            score = 0

            title = normalize(event.title)
            description = normalize(event.description)

            for word in keywords:
                if word in title:
                    score += 100
                if word in description:
                    score += 20

            if score > 0:
                results.append({
                    "title": event.title,
                    "content": event.description,
                    "url": reverse("calendar"),
                    "startEvent": event.startDateTime, 
                    "endEvent": event.endDateTime,
                    "type": "Eveniment",
                    "score": score,
                })

        return results


    def rank(self, results):
        return sorted(
            results,
            key=lambda result: result["score"],
            reverse=True
        )


    def search(self, query):
        anunturi = self.search_anunt(query)
        profesori = self.search_teacher(query)
        evenimente = self.search_events(query)

        return {
            "anunturi": self.rank(anunturi)[:5],
            "profesori": self.rank(profesori)[:5],
            "evenimente": self.rank(evenimente)[:5],
        }

    def build_context(self, query):
        results = self.search(query)

        context = ""

        for categorie in results.values():
            for item in categorie:

                context += f"""
    Tip: {item['type']}
    Titlu: {item['title']}
    Conținut:
    {item['content']}
    Link: {BASE_URL}{item['url']}
    """

                if item["type"] == "Eveniment":

                    start = item["startEvent"]
                    end = item["endEvent"]

                    start = start.strftime("%d.%m.%Y %H:%M") if start else "Necunoscută"
                    end = end.strftime("%d.%m.%Y %H:%M") if end else "Necunoscută"

                    context += f"""
    Data începerii: {start}
    Data încheierii: {end}
    """

                context += "\n-------------------------\n"

        return context