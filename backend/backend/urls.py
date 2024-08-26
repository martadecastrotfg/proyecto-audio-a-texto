# backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
]

# Servir archivos de medios durante el desarrollo
if settings.DEBUG:  # Asegúrate de que esto solo se ejecute en modo desarrollo
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
