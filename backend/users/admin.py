from django.contrib import admin


from users.models import User, Course, TrainingSession, Result, Activity, Item, Task

admin.site.register(User) 
admin.site.register(Course)
admin.site.register(TrainingSession)
admin.site.register(Result)
admin.site.register(Activity)
admin.site.register(Item)
admin.site.register(Task)



