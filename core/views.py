from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from products.models import Book, Author, Publisher, Genre
from products.forms import BookForm


def index(request):
    books = Book.objects.all()
    return render(request, 'core/index.html',{'books':books})

def shop(request):
    books = Book.objects.all()
    
    search_query = request.GET.get('search', '')
    if search_query:
        books = books.filter(
            Q(title__icontains=search_query) | 
            Q(author__first_name__icontains=search_query) |
            Q(author__last_name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(publisher__name__icontains=search_query)
        )
    
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        books = books.filter(price__gte=min_price)
    if max_price:
        books = books.filter(price__lte=max_price)
    
    genre_filter = request.GET.get('genre')
    if genre_filter:
        books = books.filter(genre__name=genre_filter)
    
    sort_by = request.GET.get('sort', 'title')
    if sort_by == 'price_asc':
        books = books.order_by('price')
    elif sort_by == 'price_desc':
        books = books.order_by('-price')
    elif sort_by == 'date_asc':
        books = books.order_by('publication_date')
    elif sort_by == 'date_desc':
        books = books.order_by('-publication_date')
    else:
        books = books.order_by('title')
    
    genres = Genre.objects.all()
    
    context = {
        'books': books,
        'genres': genres,
        'search_query': search_query,
        'min_price': min_price,
        'max_price': max_price,
        'genre_filter': genre_filter,
        'sort_by': sort_by,
    }
    return render(request, 'core/shop.html', context)

@login_required
def book_management(request):
    """صفحه مدیریت کتاب‌ها"""
    books = Book.objects.all()
    
   
    search_query = request.GET.get('search', '')
    if search_query:
        books = books.filter(
            Q(title__icontains=search_query) | 
            Q(author__first_name__icontains=search_query) |
            Q(author__last_name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(publisher__name__icontains=search_query)
        )
        request.session['last_search'] = search_query
    
  
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        books = books.filter(price__gte=min_price)
        request.session['last_min_price'] = min_price
    if max_price:
        books = books.filter(price__lte=max_price)
        request.session['last_max_price'] = max_price
    
   
    genre_filter = request.GET.get('genre')
    if genre_filter:
        books = books.filter(genre__name=genre_filter)
        request.session['last_genre'] = genre_filter
    
   
    sort_by = request.GET.get('sort', 'title')
    if sort_by == 'price_asc':
        books = books.order_by('price')
    elif sort_by == 'price_desc':
        books = books.order_by('-price')
    elif sort_by == 'date_asc':
        books = books.order_by('publication_date')
    elif sort_by == 'date_desc':
        books = books.order_by('-publication_date')
    else:
        books = books.order_by('title')
    
    genres = Genre.objects.all()
    
    context = {
        'books': books,
        'genres': genres,
        'search_query': search_query,
        'min_price': min_price,
        'max_price': max_price,
        'genre_filter': genre_filter,
        'sort_by': sort_by,
    }
    
    return render(request, 'core/book_management.html', context)

@login_required
def book_add(request):
    """افزودن کتاب جدید"""
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES)
        if form.is_valid():
            book = form.save()
            messages.success(request, f'کتاب "{book.title}" با موفقیت اضافه شد.')
            return redirect('core:book_management')
        else:
            
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = BookForm()
    
    return render(request, 'core/book_form.html', {'form': form, 'title': 'افزودن کتاب جدید'})

@login_required
def book_edit(request, book_id):
    """ویرایش کتاب"""
    book = get_object_or_404(Book, id=book_id)
    
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            book = form.save()
            messages.success(request, f'کتاب "{book.title}" با موفقیت ویرایش شد.')
            return redirect('core:book_management')
        else:
            
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = BookForm(instance=book)
    
    return render(request, 'core/book_form.html', {'form': form, 'title': 'ویرایش کتاب', 'book': book})

@login_required
def book_delete(request, book_id):
    """حذف کتاب"""
    book = get_object_or_404(Book, id=book_id)
    
    if request.method == 'POST':
        book.delete()
        messages.success(request, 'کتاب با موفقیت حذف شد.')
        return redirect('core:book_management')
    
    return render(request, 'core/book_delete_confirm.html', {'book': book})

@login_required
def book_delete_filtered(request):
    """حذف کتاب‌های فیلتر شده"""
    if request.method == 'POST':
     
        search_query = request.session.get('last_search', '')
        min_price = request.session.get('last_min_price')
        max_price = request.session.get('last_max_price')
        genre_filter = request.session.get('last_genre')
        
        books = Book.objects.all()
        
        if search_query:
            books = books.filter(
                Q(title__icontains=search_query) | 
                Q(author__first_name__icontains=search_query) |
                Q(author__last_name__icontains=search_query)
            )
        
        if min_price:
            books = books.filter(price__gte=min_price)
        if max_price:
            books = books.filter(price__lte=max_price)
        if genre_filter:
            books = books.filter(genre__name=genre_filter)
        
        deleted_count = books.count()
        books.delete()
        
        messages.success(request, f'{deleted_count} کتاب با موفقیت حذف شدند.')
        return redirect('core:book_management')
    
    return redirect('core:book_management')

