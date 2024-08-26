from rest_framework import serializers
from .models import User, Course, TrainingSession, Result, Activity, Item, Task
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.password = make_password(password)
        return super().update(instance, validated_data)

class UserSerializer2(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'username', 'rol', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
    
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'activity', 'order_in_activity', 'value']
        read_only_fields = ['id']

    def validate(self, data):
        activity = data['activity']
        if activity.type == Activity.TEXT_COMPLETE:
            existing_items_count = Item.objects.filter(activity=activity).count()
            if existing_items_count >= 1:
                raise serializers.ValidationError('No se puede agregar más de un ítem a una actividad de tipo "Texto Completo".')
        return data

class ActivitySerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = ['id', 'name', 'instruction', 'description', 'type', 'items', 'user', 'order_in_session']



class ResultSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)  
    class Meta:
        model = Result
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},  

        }
class TrainingSessionSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)
    results = ResultSerializer(read_only=True)
    completed_activities = serializers.IntegerField(source='get_completed_activities_count', read_only=True)
    total_activities = serializers.IntegerField(source='get_total_activities_count', read_only=True)

    class Meta:
        model = TrainingSession
        fields = [
            'id',
            'name',
            'session_id',
            'description',
            'status',
            'activities',
            'results',
            'completed_activities',
            'total_activities',
            'created_user',
            'modified_user',
            'created_datetime',
            'modified_datetime'
        ]
        read_only_fields = [
            'created_datetime',
            'modified_datetime'
        ]