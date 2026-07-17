from .models import Anunt, Events, Teacher
from django.db.models import Q
from django.urls import reverse
import unicodedata


def normalize(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join(
        c for c in text
        if unicodedata.category(c) != "Mn"
    )
    return text.lower()


class SearchEngine:

    def search_anunt(self, query):
        results = []

        anunturi = Anunt.objects.filter(
            Q(titlu__icontains=query) |
            Q(continut__icontains=query)
        )

        query_normalized = normalize(query)

        for anunt in anunturi:
            score = 0

            titlu = normalize(anunt.titlu)
            continut = normalize(anunt.continut)

            if query_normalized in titlu:
                score += 100

            if query_normalized in continut:
                score += 20

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

        query_normalized = normalize(query)

        teachers = Teacher.objects.all()

        for teacher in teachers:

            name = normalize(teacher.name)
            subject = normalize(teacher.subject)

            if query_normalized in name or query_normalized in subject:

                score = 0

                if query_normalized in name:
                    score += 100

                if query_normalized in subject:
                    score += 40

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

        events = Events.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query)
        )

        query_normalized = normalize(query)

        for event in events:
            score = 0

            title = normalize(event.title)
            description = normalize(event.description)

            if query_normalized in title:
                score += 100

            if query_normalized in description:
                score += 20

            results.append({
                "title": event.title,
                "content": event.description,
                "url": reverse("calendar"),
                "type": "Eveniment",
                "score": score,
            })

        return results[:5]


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