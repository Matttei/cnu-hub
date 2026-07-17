from django.contrib import admin
from .models import User, Events, ContactForm, Anunt, Categorie, ChatSession
# Register your models here.
admin.site.register(Events)
admin.site.register(ContactForm)
admin.site.register(Anunt)
admin.site.register(Categorie)
admin.site.register(ChatSession)
