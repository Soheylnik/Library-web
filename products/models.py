
from django.contrib.auth.models import User
from django.db import models

class Book (models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey('Author',on_delete=models.PROTECT ,null=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=3)
    pages = models.IntegerField()
    publisher = models.ForeignKey('Publisher',on_delete=models.SET_NULL, null=True, blank=True)
    publication_date = models.DateField()
    genre = models.ManyToManyField('Genre')
    quantity = models.IntegerField()
    image = models.ImageField(upload_to='Books/', null=True, blank=True)
    
    def __str__(self):
        return self.title 
    
    
class Author (models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    bio = models.TextField()
    birth_date = models.DateField()
    
    def __str__(self):
        return self.first_name + ' ' + self.last_name

class Publisher (models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    

class Genre (models.Model):
    name = models.CharField(max_length=100,null=True, blank=True)
    
    def __str__(self):
        return self.name
