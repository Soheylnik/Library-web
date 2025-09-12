from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.index, name='index'),
    path('shop/', views.shop, name='shop'),
    path('book-management/', views.book_management, name='book_management'),
    path('book-add/', views.book_add, name='book_add'),
    path('book-edit/<int:book_id>/', views.book_edit, name='book_edit'),
    path('book-delete/<int:book_id>/', views.book_delete, name='book_delete'),
    path('book-delete-filtered/', views.book_delete_filtered, name='book_delete_filtered'),
]


