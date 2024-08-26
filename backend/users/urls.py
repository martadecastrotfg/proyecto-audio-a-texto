# backend/users/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('usuarios/', views.UserList.as_view(), name='user-list'),
    path('usuarios/<int:pk>/', views.UserDetail.as_view(), name='user-detail'),
    path('cursos/', views.CourseList.as_view(), name='course-list'),
    path('cursos/<int:pk>/', views.CourseDetail.as_view(), name='course-detail'),
    path('entrenamientos/', views.TrainingSessionList.as_view(), name='training-session-list'),
    path('entrenamientos/<int:pk>/', views.TrainingSessionDetail.as_view(), name='training-session-detail'),
    path('actividad/', views.ActivityList.as_view(), name='activity-list'),
    path('actividad/<int:pk>/', views.ActivityDetail.as_view(), name='activity-detail'),
    path('resultados/', views.ResultList.as_view(), name='result-list'),
    path('resultados/<int:pk>/', views.ResultDetail.as_view(), name='result-detail'),
    path('item/', views.ItemList.as_view(), name='item-list'),
    path('item/<int:pk>/', views.ItemDetail.as_view(), name='item-detail'),
    path('task/', views.TaskList.as_view(), name='task-list'),
    path('task/<int:pk>/', views.TaskDetail.as_view(), name='task-detail'),


    path('register', views.RegisterView.as_view(), name='register'),
    path('login', views.LoginView.as_view(),name='login'),
    path('user', views.UserView.as_view()),
    path('logout', views.LogoutView.as_view()),

    path('upload-result/',views.upload_result, name='upload-result'),
    path('results/', views.get_resultados, name='get-results'),

    path('sesiones/', views.create_session, name='create_session'),      
    path('actividades/', views.create_activity, name='create_activity'),   
    path('actividades/usuario/', views.get_activities_by_user, name='get_activities_by_user'),

    path('courses/<int:course_id>/sessions/', views.get_sessions_by_course, name='get_sessions_by_course'),  
    path('crearitems/', views.create_item, name='create_item'),

    path('subir-tarea/', views.subir_tarea, name='subir_tarea'),
    path('analizar-tarea/', views.analizar_tarea, name='sanalizar-tarea'),


]