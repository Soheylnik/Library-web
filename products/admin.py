from django.contrib import admin
from .models import Book, Author , Publisher, Genre

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'price')
    search_fields = ('title', 'author__first_name', 'author__last_name')
    ordering = ('title', 'author__last_name', 'price')

    list_filter = ('publisher', 'genre','author')
    list_per_page = 10
    
    
admin.site.register(Author)
admin.site.register(Publisher)
admin.site.register(Genre)