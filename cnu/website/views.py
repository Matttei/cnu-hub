import json
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse
from django.urls import reverse
from django.shortcuts import redirect
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.exceptions import ValidationError
from django.conf import settings
from django.core.mail import send_mail
from django.contrib import messages
from .forms import AnuntForm
from .models import Events, ContactForm, Anunt, ChatSession
from .ai import ask_ai
# Create your views here.

def index(request):
    now = timezone.now()
    seven_days_ago = now - timedelta(days=7)
    all_events = Events.objects.all()
    latest_events = []
    all_pinned = Anunt.objects.filter(Important=True).order_by('-data_publicare')[:3]
    if (len(all_pinned) == 3):
        latest_events = []
    else:
        latest_events = Events.objects.filter(startDateTime__gte=seven_days_ago)[:3]  
    return render(request, 'cnu/index.html', {
        'all_pinned': all_pinned,
        'latest_events': latest_events
    })


def calendar(request):
    current_date = timezone.now()
    active_events = []
    expired_events = []
    events = Events.objects.all()
    for event in events:
        if event.endDateTime < current_date:
            expired_events.append(event)
        else:
            active_events.append(event)
    return render(request, 'cnu/calendar.html', {
        'current_date': current_date,
        'active_events': active_events,
        'expired_events': expired_events,
    })


def contact(request):
    return render(request, 'cnu/contact.html')


def despre(request):
    return render(request, 'cnu/despre.html')

def admitere(request):
    return render(request, 'cnu/admitere.html')

import logging

import logging
import socket
import smtplib
import traceback

logger = logging.getLogger(__name__)

def contact_form(request):
    if request.method != "POST":
        return JsonResponse({"error": "Metodă neacceptată."}, status=400)

    name = request.POST.get("name")
    email = request.POST.get("email")
    message = request.POST.get("message")

    logger.warning("=== CONTACT FORM START ===")

    try:
        ContactForm.objects.create(
            name=name,
            email=email,
            message=message,
        )
        logger.warning("Saved to database.")
    except Exception:
        logger.exception("Database error")
        raise

    subject = f"Mesaj nou de la {name}"
    body = f"""
Ai primit un mesaj nou de pe formularul de contact.

Email: {email}
Mesaj:
{message}
"""

    logger.warning(f"EMAIL_BACKEND = {settings.EMAIL_BACKEND}")
    logger.warning(f"EMAIL_HOST = {settings.EMAIL_HOST}")
    logger.warning(f"EMAIL_PORT = {settings.EMAIL_PORT}")
    logger.warning(f"EMAIL_TLS = {settings.EMAIL_USE_TLS}")
    logger.warning(f"EMAIL_USER = {settings.EMAIL_HOST_USER}")
    logger.warning(f"PASSWORD SET = {bool(settings.EMAIL_HOST_PASSWORD)}")

    # Test DNS
    try:
        ip = socket.gethostbyname(settings.EMAIL_HOST)
        logger.warning(f"SMTP resolves to {ip}")
    except Exception:
        logger.exception("DNS lookup failed")

    # Test TCP
    try:
        sock = socket.create_connection(
            (settings.EMAIL_HOST, settings.EMAIL_PORT),
            timeout=10,
        )
        logger.warning("TCP connection OK")
        sock.close()
    except Exception:
        logger.exception("TCP connection FAILED")

    try:
        logger.warning("Calling send_mail()...")

        send_mail(
            subject,
            body,
            settings.EMAIL_HOST_USER,
            ["mateidorcea@gmail.com"],
            fail_silently=False,
        )

        logger.warning("send_mail() finished OK")

    except smtplib.SMTPException:
        logger.exception("SMTP Exception")
        return JsonResponse({"error": "SMTP Exception"}, status=500)

    except Exception:
        logger.exception("Unknown exception")
        return JsonResponse({"error": traceback.format_exc()}, status=500)

    logger.warning("=== CONTACT FORM END ===")

    return JsonResponse({
        "success": True,
        "message": "Mesaj trimis!"
    })


def orar(request):
    clase = []
    litere = ['IX', 'X', 'XI', 'XII']
    for an in litere:
        for litera in ['A', 'B', 'C', 'D', 'E']:
            clase.append({
                'value': f"{an}{litera}",
                'label': f"Clasa a {an}-a {litera}"
            })
    return render(request, 'cnu/orar.html', {'clase': clase})



def custom_404_view(request, exception):
    return render(request, 'cnu/404.html', status=404)


@login_required
def admin_cnu(request):
    if request.method == 'POST':
        form = AnuntForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/?success=1')
    else:
        form = AnuntForm()
    pinned_things = Anunt.objects.filter(Important=True)
    trendings  = Anunt.objects.filter(views__gte=10).order_by('-views')
    
    return render(request, 'cnu/admin.html', {
        'form': form,
        'pinned': pinned_things,
        'trendings': trendings
        })


def publicatii(request):
    # For now the news will be only the annouces 
    all_news = Anunt.objects.all().order_by('-data_publicare')
    p = Paginator(all_news, 9)
    page_number = int(request.GET.get('page', 1))
    page_obj = p.get_page(page_number)
    return render(request, 'cnu/publicatii.html', {
        'news': page_obj,
    })

def noutati(request):
    noutati = Anunt.objects.filter(categorie__nume='Noutati').order_by('-data_publicare')
    return render(request, 'cnu/noutati.html',{
        'noutati': noutati
    })


def activitati(request):
    activitati = Anunt.objects.filter(categorie__nume='Activități').order_by('-data_publicare')
    return render(request, 'cnu/activitati.html',{
        'activitati': activitati
    })
def proiecte(request):
    proiecte = Anunt.objects.filter(categorie__nume='Proiecte').order_by('-data_publicare')
    return render(request, 'cnu/proiecte.html',{
        'proiecte': proiecte
    })

@login_required
def unpin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            event = Anunt.objects.get(pk=data.get('id'))
            user = request.user
            if event.Important:
                event.Important = False
                event.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Actiune realizata cu succes!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Acest anunt nu era Pinned!'
                })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            })
    return JsonResponse({
        'success': False,
        'message': 'Invalid request method.',
    }, status=405)
            


def publicatie(request, publicatie_id):
    publicatie = Anunt.objects.get(pk=publicatie_id)
    publicatie.views += 1
    publicatie.save()
    return render(request, 'cnu/publicatie.html', {
        'publicatie': publicatie,
    })


def bacalaureat(request):
    return render(request, 'cnu/bacalaureat.html')


def personal_didactic(request):
    categories = [
        ('Limba și literatura română', ['Prof. Mariana Adelina ELS', 'Prof. Elena Daniela NICA', 'Prof. Elena ȘERBĂNESCU', 'Prof. Monica CRISTEA']),
        ('Limba engleză', ['Prof. Crina Ionela DORCEA', 'Prof. Daniela Sonia PLOCON', 'Prof. Răzvan Delcea VASILE']),
        ('Limba franceză', ['Prof. Andreea Cristina BĂLAȘA', 'Prof. Mircea TATARICI', 'Prof. Geanina Petruța SAVA']),
        ('Matematică', ['Prof. Florin ORIȚĂ', 'Prof. Irina PETREANU', 'Prof. Mariana TUDOR', 'Prof. Rodica Argentina IONESCU']),
        ('Fizică', ['Prof. Mihai CĂLIN', 'Prof. Marinela DIEACONU']),
        ('Chimie', ['Prof. Ioan Fernand CARAGEA', 'Prof. Nicoleta Claudia DRĂGULEASA']),
        ('Biologie', ['Prof. Daniela GRASU', 'Prof. Mihaela NEACȘU']),
        ('Istorie', ['Prof. Vasile MĂRCUȘU', 'Prof. Ștefănel VIPIE', 'Prof. Ramona Elena STĂNESCU']),
        ('Geografie', ['Prof. Violeta DIMA', 'Prof. Daniela Rodica VASILE']),
        ('Științe socio-umane', ['Prof. Nicolae Alin ALEXE', 'Consilier Georgeta FUNARU']),
        ('Educație vizuală', ['Prof. Ovidiu Nicolae ORBEȘTEANU']),
        ('Educație fizică și sport', ['Prof. Mădălin BARBU']),
        ('Informatică și TIC', ['Prof. Miruna GRUIA', 'Prof. Nicoleta MARINESCU', 'Prof. Gabriel DEFTA']),
        ('Religie', ['Prof. Constantin COJOACĂ', 'Prof. Gabriel DEFTA']),
    ]
    return render(request, 'cnu/personal_didactic.html', {
        'categories': categories,
    })

def personal_auxiliar(request):
    return render(request, 'cnu/personal_auxiliar.html')

def personal_nedidactic(request):
    return render(request, 'cnu/personal_nedidactic.html')

def hotarari(request):
    return render(request, 'cnu/hotarari.html')

def echipa(request):
    return render(request, 'cnu/echipa.html')

def documente(request):
    return render(request, 'cnu/documente_publice.html')

def cereri_tip(request):
    return render(request, 'cnu/cereri.html')

def burse(request):
    return render(request, 'cnu/burse.html')
def chatbot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body)

    ai_response = ask_ai(
        prompt=data["content"],
        category=data["category"],
        name=data["name"],
        email=data["email"]
    )

    ai_data = json.loads(ai_response)

    session = ChatSession.objects.create(
        username=data["name"],
        email=data["email"],
        categorie=ai_data["category"],
        important=ai_data["important"],
        titlu=ai_data["title"],
        continut=data["content"],
    )

    return JsonResponse({
        "response": ai_data["answer"],
        "session_id": session.id,
    })

def chatbot_message(request):

    data = json.loads(request.body)
    session = ChatSession.objects.get(pk=data["session_id"])
    response = ask_ai(
        prompt=data["content"],
        category=data["category"],
        name=data["name"],
        email=data["email"]
    )
    response_data = json.loads(response)
    session.categorie = response_data["category"]
    session.important = response_data["important"]
    session.titlu = response_data["title"]
    session.email = response_data["email"]
    session.continut += f'.\n\n {response_data["name"]}: '+ data["message"]
    session.continut += ".\n\n AI: " + response_data["answer"]
    session.save()
    return JsonResponse({
        "response": response_data["answer"]
    })