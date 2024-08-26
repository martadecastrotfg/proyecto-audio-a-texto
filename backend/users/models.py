from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import EmailValidator
from django.forms import ValidationError
from django.utils.translation import gettext_lazy as _
import os
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, username, first_name, last_name, email, password=None, rol='entrenado'):
        if not email:
            raise ValueError(_('El email debe ser proporcionado'))
        user = self.model(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=self.normalize_email(email),
            rol=rol
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, first_name, last_name, email, password=None):
        user = self.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            rol='administrador'  # El rol del superusuario será Administrador
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    ROL_ADMINISTRADOR = 'administrador'
    ROL_ENTRENADOR = 'entrenador'
    ROL_ENTRENADO = 'entrenado'

    ROL_CHOICES = [
        (ROL_ADMINISTRADOR, 'Administrador'),
        (ROL_ENTRENADOR, 'Entrenador'),
        (ROL_ENTRENADO, 'Entrenado'),
    ]

    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    username_glifing = models.CharField(max_length=150, blank=True, null=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    password = models.CharField(max_length=128)  
    rol = models.CharField(
        max_length=20,
        choices=ROL_CHOICES,
        default=ROL_ENTRENADO
    )

    # Campos para control de acceso
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Relación con Course
    courses = models.ManyToManyField('Course', related_name='enrolled_users', blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'email']

    def __str__(self):
        return self.username
    def has_perm(self, perm, obj=None):
        # Devuelve True si el usuario tiene el permiso 'perm'
        return self.is_admin

    def has_module_perms(self, app_label):
        # Devuelve True si el usuario tiene permisos en el módulo 'app_label'
        return self.is_admin

class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    # Relación One-to-Many con TrainingSession
    training_sessions = models.ManyToManyField('TrainingSession', related_name='courses', blank=True)

    def __str__(self):
        return self.name

class TrainingSession(models.Model):

    ACTIVE = 'activo'
    TESTING = 'en_pruebas'

    STATUS_TYPES = [
        (ACTIVE, 'Activo'),
        (TESTING, 'En pruebas'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    session_id = models.CharField(max_length=255)
    description = models.TextField(default="Descripción no proporcionada")
    status = models.CharField(
        max_length=20,
        choices=STATUS_TYPES,
        default=TESTING
    )
    created_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_sessions', on_delete=models.SET_NULL, null=True, blank=True)
    modified_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='modified_sessions', on_delete=models.SET_NULL, null=True, blank=True)
    created_datetime = models.DateTimeField(default=timezone.now)
    modified_datetime = models.DateTimeField(auto_now=True)


    
    # Relación Many-to-Many con Activity
    activities = models.ManyToManyField('Activity', related_name='sessions', blank=True)

    # Relación One-to-Many con Result
    results = models.ForeignKey('Result', related_name='training_sessions', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Session {self.session_id} on {self.created_datetime.strftime('%Y-%m-%d %H:%M:%S')}"
    
    def get_completed_activities_count(self):
        return self.activities.filter(completed=True).count()

    def get_total_activities_count(self):
        return self.activities.count()
        

class Activity(models.Model):
    TEXT_COMPLETE = 'texto_completo'
    WORDS = 'palabras_sueltas'

    ACTIVITY_TYPES = [
        (TEXT_COMPLETE, 'Texto Completo'),
        (WORDS, 'Palabras Sueltas'),
    ]

    id = models.AutoField(primary_key=True)  # Cambia a AutoField
    name = models.CharField(max_length=255)
    description = models.TextField()
    instruction = models.TextField()
    order_in_session = models.IntegerField()
    task_id = models.CharField(max_length=255)
    type = models.CharField(
        max_length=20,
        choices=ACTIVITY_TYPES,
        default=TEXT_COMPLETE
    )
    completed = models.BooleanField(default=False)
    session = models.ForeignKey(
        'TrainingSession',
        related_name='activity_list',
        on_delete=models.CASCADE,
        null=True,  # Permite valores nulos
        blank=True  # Permite que el campo sea opcional en formularios
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)


    def __str__(self):
        return f"{self.name} - {self.description[:30]}"
    
class Item(models.Model):
    id = models.AutoField(primary_key=True)  # Cambia a AutoField
    activity = models.ForeignKey(Activity, related_name='items', on_delete=models.CASCADE)
    order_in_activity = models.IntegerField()
    value = models.TextField()  # Texto que podría incluir formato

    def clean(self):
        # Validación para actividades de tipo "Texto Completo"
        if self.activity.type == Activity.TEXT_COMPLETE:
            existing_items_count = Item.objects.filter(activity=self.activity).count()
            if existing_items_count >= 1:
                raise ValidationError('No se puede agregar más de un ítem a una actividad de tipo "Texto Completo".')

    def save(self, *args, **kwargs):
        self.clean()
        super(Item, self).save(*args, **kwargs)

    def __str__(self):
        return f"Item {self.order_in_activity} in activity {self.activity.name}"





class Result(models.Model):
    id = models.AutoField(primary_key=True)
    activity_id = models.CharField(max_length=255)
    session_id = models.CharField(max_length=255, default='default_session')
    datetime = models.DateTimeField()
    task = models.JSONField()
    audio_file = models.FileField(upload_to='results/', null=True, blank=True)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    

    def save(self, *args, **kwargs):
        initial_save = not self.id
        super().save(*args, **kwargs)

        if self.audio_file and initial_save:
            try:
                file_path = self.audio_file.path
                user_dir = os.path.join(settings.MEDIA_ROOT, 'results', str(self.user_id.id))  # Use user ID, not username
                session_dir = os.path.join(user_dir, str(self.session_id))
                activity_dir = os.path.join(session_dir, str(self.activity_id))
                
                os.makedirs(activity_dir, exist_ok=True)
                
                existing_files = [f for f in os.listdir(activity_dir) if os.path.isfile(os.path.join(activity_dir, f))]
                next_file_number = len(existing_files) + 1
                file_name = f"{next_file_number} audio.wav"
                new_file_path = os.path.join(activity_dir, file_name)

                if file_path != new_file_path:
                    os.rename(file_path, new_file_path)
                    self.audio_file.name = os.path.relpath(new_file_path, settings.MEDIA_ROOT)
                    super().save(update_fields=['audio_file'])
            except Exception as e:
                print(f"Error al guardar el archivo de audio: {e}")


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
