from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def test_api(request):
    data = {
        "message": "Hello from Django 🚀",
        "status": "success"
    }
    return JsonResponse(data)