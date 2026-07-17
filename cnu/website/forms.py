from django import forms
from .models import Anunt, Categorie

class AnuntForm(forms.ModelForm):
    categorie_noua = forms.CharField(required=False, label='Categorie nouă')

    class Meta:
        model = Anunt
        fields = ['titlu', 'username', 'categorie', 'categorie_noua', 'continut', 'Important']

    def clean(self):
        cleaned_data = super().clean()
        cat = cleaned_data.get('categorie')
        new_cat = cleaned_data.get('categorie_noua')

        if not cat and not new_cat:
            raise forms.ValidationError("Selectează o categorie sau introdu una nouă.")
        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        new_cat = self.cleaned_data.get('categorie_noua')

        if new_cat:
            categorie_obj, created = Categorie.objects.get_or_create(nume=new_cat)
            instance.categorie = categorie_obj

        if commit:
            instance.save()
        return instance
