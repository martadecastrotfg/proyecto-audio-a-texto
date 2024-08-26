import json
from multiprocessing import connection
import subprocess
from time import timezone
from django.shortcuts import render
from rest_framework import generics
from .models import User, Course, TrainingSession, Result, Activity, Item, Task
from .serializers import UserSerializer, CourseSerializer, TrainingSessionSerializer, ResultSerializer, ActivitySerializer, ItemSerializer, TaskSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import ResultSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer2
from .models import User
import jwt, datetime
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse
from .models import Result
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone  # Asegúrate de importar timezone
from .models import TrainingSession
from .serializers import TrainingSessionSerializer
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Course
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Activity
from .serializers import ActivitySerializer

import os
import zipfile
import shutil
import json
import subprocess
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
import venv



class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer2(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class LoginView(APIView):
    def post(self, request):
        username = request.data['username']
        password = request.data['password']

        user = User.objects.filter(username=username).first()

        if user is None:
            raise AuthenticationFailed('User not found!')

        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password!')

        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }

        # token = jwt.encode(payload, 'secret', algorithm='HS256').decode('utf-8')
        token = jwt.encode(payload, 'secret', algorithm='HS256')

        response = Response()

        response.set_cookie(key='jwt', value=token, httponly=True)
        response.data = {
            'jwt': token
        }
        return response


class UserView(APIView):
    def get(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated!')

        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Unauthenticated!')

        user = User.objects.filter(id=payload['id']).first()
        serializer = UserSerializer2(user)
        return Response(serializer.data)
    


class LogoutView(APIView):
    def post(self, request):
        # Create a response object
        response = Response()
        
        # Set the cookie with the same key and an expired date to delete it
        response.set_cookie(key='jwt', value='', expires=datetime.datetime.utcnow() - datetime.timedelta(days=1), httponly=True)
        
        # Optional: Extract the token from the request
        token = request.COOKIES.get('jwt')

        if token:
            try:
                payload = jwt.decode(token, 'secret', algorithms=['HS256'])
                exp_time = payload.get('exp')
                if exp_time:
                    remaining_time = datetime.datetime.utcfromtimestamp(exp_time) - datetime.datetime.utcnow()
                    response.data = {
                        'message': 'Successfully logged out',
                        'time_until_expiration': remaining_time.total_seconds()
                    }
                else:
                    response.data = {'message': 'Successfully logged out'}
            except jwt.ExpiredSignatureError:
                response.data = {'message': 'Token already expired'}
            except jwt.DecodeError:
                response.data = {'message': 'Invalid token'}
        else:
            response.data = {'message': 'Token not provided'}
        
        return response


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course_id', None)
        if course_id:
            queryset = queryset.filter(courses__id=course_id)
        return queryset


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


#CURSOS

class CourseList(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(enrolled_users__id=user_id)
        return queryset

class CourseDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

#ENTRENAMIENTOS

class TrainingSessionList(generics.ListAPIView):
    serializer_class = TrainingSessionSerializer

    def get_queryset(self):
        queryset = TrainingSession.objects.all()
        filter_results = self.request.query_params.get('results', None)

        if filter_results:
            if filter_results.lower() == 'no':
                queryset = queryset.filter(results__isnull=True)
            elif filter_results.lower() == 'yes':
                queryset = queryset.filter(results__isnull=False)
        
        return queryset

class TrainingSessionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer


def user_sessions_view(request):
    user = request.user
    sessions = TrainingSession.objects.filter(user=user)

    sessions_data = []
    for session in sessions:
        total_activities = session.get_total_activities_count()
        completed_activities = session.get_completed_activities_count()
        sessions_data.append({
            'id': session.id,
            'date': session.date,
            'total_activities': total_activities,
            'completed_activities': completed_activities,
        })

    context = {
        'user': user,
        'sessions': sessions_data,
    }
    return render(request, 'sessiones_usuarios.html', context)

@api_view(['POST'])
def create_session(request):
    serializer = TrainingSessionSerializer(data=request.data)
    if serializer.is_valid():
        # Asignar el usuario actual como creador y modificador si está autenticado
        user = request.user if request.user.is_authenticated else None

        # Aquí, guardamos los datos en un nuevo diccionario
        validated_data = serializer.validated_data.copy()
        # validated_data['created_user'] = user
        # validated_data['modified_user'] = user
        validated_data['created_datetime'] = timezone.now()
        validated_data['modified_datetime'] = timezone.now()
        
        # Crear la instancia del modelo
        session = TrainingSession.objects.create(**validated_data)
        serializer = TrainingSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_sessions_by_course(request, course_id):
    # Obtén el curso por ID
    course = get_object_or_404(Course, id=course_id)
    
    # Obtén las sesiones asociadas al curso
    sessions = course.training_sessions.all()
    
    # Prepara la respuesta
    sessions_data = [
        {
            'id': session.id,
            'name': session.name,
            'session_id': session.session_id,
            'description': session.description,
            'status': session.status,
            'created_user': session.created_user.username if session.created_user else 'No disponible',
            'modified_user': session.modified_user.username if session.modified_user else 'No disponible',
            'created_datetime': session.created_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'modified_datetime': session.modified_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            'completed_activities_count': session.get_completed_activities_count(),
            'total_activities_count': session.get_total_activities_count(),
            'activities': [
                {
                    'id': activity.id,
                    'name': activity.name,
                    'instruction': activity.instruction,
                    'description': activity.description,
                    'type': activity.type,
                    'items': [
                        {
                            'id': item.id,
                            'value': item.value
                        }
                        for item in activity.items.all()
                    ] if activity.type == 'palabras_sueltas' else []
                }
                for activity in session.activities.all()
            ]
        }
        for session in sessions
    ]
    
    return JsonResponse({'sessions': sessions_data})


#TAREAS

class TaskList(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer



@csrf_exempt
@require_POST
def subir_tarea(request):
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No se ha proporcionado un archivo'}, status=400)

    archivo_zip = request.FILES['file']
    
    if not archivo_zip.name.endswith('.zip'):
        return JsonResponse({'error': 'El archivo debe ser un ZIP'}, status=400)

    task_name = request.POST.get('nombre', 'Tarea desconocida')
    task_description = request.POST.get('descripcion', '')

    tarea = Task(name=task_name, description=task_description)
    tarea.save()

    ruta_base = os.path.join(settings.MEDIA_ROOT, 'tareas')
    task_folder = os.path.join(ruta_base, str(tarea.id))
    os.makedirs(task_folder, exist_ok=True)

    archivo_zip_path = os.path.join(task_folder, 'tarea.zip')
    with open(archivo_zip_path, 'wb+') as destino:
        for chunk in archivo_zip.chunks():
            destino.write(chunk)

    try:
        temp_dir = os.path.join(task_folder, 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Descomprimir y mover el contenido a la carpeta de tarea
        with zipfile.ZipFile(archivo_zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Buscar la primera carpeta dentro del directorio temporal
        extracted_items = os.listdir(temp_dir)
        if len(extracted_items) == 1 and os.path.isdir(os.path.join(temp_dir, extracted_items[0])):
            extracted_folder = os.path.join(temp_dir, extracted_items[0])

            # Mover el contenido de la carpeta extraída a la carpeta de tarea
            for item in os.listdir(extracted_folder):
                s = os.path.join(extracted_folder, item)
                d = os.path.join(task_folder, item)
                if os.path.isdir(s):
                    shutil.move(s, d)
                else:
                    shutil.move(s, d)

            # Eliminar la carpeta intermedia después de mover su contenido
            shutil.rmtree(extracted_folder)
        else:
            return JsonResponse({'error': 'No se encontró una estructura de carpetas válida en el archivo ZIP'}, status=400)

        # Limpiar el directorio temporal
        shutil.rmtree(temp_dir)

    except zipfile.BadZipFile:
        return JsonResponse({'error': 'El archivo ZIP está corrupto'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error al descomprimir el archivo: {str(e)}'}, status=500)
    finally:
        if os.path.exists(archivo_zip_path):
            os.remove(archivo_zip_path)

    # Listar los archivos y carpetas que se descomprimieron
    archivos_descomprimidos = os.listdir(task_folder)
    
    return JsonResponse({
        'mensaje': 'Archivo ZIP descomprimido correctamente.',
        'archivos': archivos_descomprimidos,
        'task_id': tarea.id
    })



@csrf_exempt
@require_POST
def analizar_tarea(request):
    # Asegúrate de que `wavFile` y `task_id` están presentes en la solicitud
    if 'wavFile' not in request.FILES or not request.POST.get('task_id'):
        return JsonResponse({'error': 'Faltan parámetros: task_id o wavFile'}, status=400)

    wav_file = request.FILES['wavFile']
    task_id = request.POST.get('task_id')

    # Ruta del directorio de la tarea
    task_folder = os.path.join(settings.MEDIA_ROOT, 'tareas', task_id)

    # Verificar que la carpeta de la tarea existe
    if not os.path.isdir(task_folder):
        return JsonResponse({'error': 'La tarea no existe'}, status=404)

    # Guardar el archivo WAV
    wav_file_path = os.path.join(task_folder, 'temp.wav')
    with open(wav_file_path, 'wb+') as destino:
        for chunk in wav_file.chunks():
            destino.write(chunk)

    try:
        # Crear el entorno virtual si no existe
        venv_path = os.path.join(task_folder, 'venv')
        if not os.path.isdir(venv_path):
            venv.create(venv_path, with_pip=True)
            # Instalar dependencias desde requirements.txt
            requirements_path = os.path.join(task_folder, 'libs', 'env', 'requeriments.txt')
            if os.path.isfile(requirements_path):
                subprocess.run([os.path.join(venv_path, 'bin', 'pip'), 'install', '-r', requirements_path], check=True)

        # Verificar existencia del script y entorno virtual
        script_path = os.path.join(task_folder, 'src', 'task_code.py')
        venv_python_path = os.path.join(venv_path, 'bin', 'python')
        
        if not os.path.isfile(script_path):
            return JsonResponse({'error': f'No se encontró el archivo de script en: {script_path}'}, status=500)
        
        if not os.path.isfile(venv_python_path):
            return JsonResponse({'error': f'No se encontró el ejecutable python en: {venv_python_path}'}, status=500)
        
        audio_file_path = '/home/marta/Downloads/p.wav'
        
        command = [venv_python_path, script_path, json.dumps({"audio_file": audio_file_path})]
        
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        
        output = result.stdout.strip()
        output_json = json.loads(output)
        
        return JsonResponse(output_json)

    except subprocess.CalledProcessError as e:
        return JsonResponse({'error': f'Error al ejecutar la tarea: {str(e)}', 'details': e.stderr}, status=500)
    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Error al decodificar la salida del script', 'details': str(e)}, status=500)
    except Exception as e:
        return JsonResponse({'error': f'Error desconocido: {str(e)}'}, status=500)

    


#RESULTADOS 

class ResultList(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer

class ResultDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_result(request):
    """
    Maneja la subida de resultados, incluyendo archivos de audio.
    """
    print("Datos recibidos:", request.data)
    
    serializer = ResultSerializer(data=request.data)
    
    if serializer.is_valid():
        # Mensaje de depuración
        print("Datos válidos, guardando resultado...")
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Mensaje de depuración
    print("Errores en la validación de datos:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def get_resultados(request):
    user_id = request.GET.get('user_id')
    session_id = request.GET.get('session_id')
    activity_id = request.GET.get('activity_id')

    if not all([user_id, session_id, activity_id]):
        return JsonResponse({"error": "Missing parameters"}, status=400)

    try:
        user_id = int(user_id)
    except ValueError:
        return JsonResponse({"error": "Invalid user_id"}, status=400)

    results = Result.objects.filter(user_id=user_id, session_id=session_id, activity_id=activity_id)

    if results.exists():
        serialized_results = []
        for result in results:
            serialized_result = {
                "id": result.id,
                "activity_id": result.activity_id,
                "session_id": result.session_id,
                "datetime": result.datetime.isoformat(),
                "task": result.task,
                "audio_file": result.audio_file.url,
                "user_id": result.user_id.id
            }
            serialized_results.append(serialized_result)

        try:
            return JsonResponse(serialized_results, encoder=DjangoJSONEncoder, safe=False)
        except TypeError as e:
            return JsonResponse({"error": f"Serialization error: {str(e)}"}, status=500)
    else:
        return JsonResponse({"error": "No results found"}, status=404)



#ACTIVIDADES

class ActivityList(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

class ActivityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

      


@api_view(['POST'])
def create_activity(request):
    serializer = ActivitySerializer(data=request.data)
    if serializer.is_valid():
        # Crear la instancia del modelo sin campos adicionales
        activity = serializer.save()
        return Response(ActivitySerializer(activity).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_activities_by_user(request):
    user_id = request.query_params.get('user_id', None)
    
    if user_id is None:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        activities = Activity.objects.filter(user_id=user_id)
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Activity.DoesNotExist:
        return Response({"error": "No activities found for this user"}, status=status.HTTP_404_NOT_FOUND)



#ITEMS

class ItemList(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


@api_view(['POST'])
def create_item(request):
    serializer = ItemSerializer(data=request.data)
    if serializer.is_valid():
        item = serializer.save()
        return Response(ItemSerializer(item).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




