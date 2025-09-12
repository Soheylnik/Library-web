from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from products.models import Book
from .models import UserProfile, FavoriteBook
import json

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('core:index')
        else:
            messages.error(request, 'نام کاربری یا رمز عبور اشتباه است')
    return render(request, 'accounts/login.html')

def logout_view(request):
    logout(request)
    return redirect('core:index')

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            try:
                user = form.save()
                UserProfile.objects.create(user=user)
                messages.success(request, 'ثبت نام با موفقیت انجام شد. لطفاً وارد شوید.')
                return redirect('accounts:login')
            except Exception as e:
                messages.error(request, f'خطا در ایجاد حساب کاربری: {str(e)}')
        else:
            messages.error(request, 'لطفاً اطلاعات را صحیح وارد کنید.')
    else:
        form = UserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})

@login_required
def profile_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        profile.phone = request.POST.get('phone', '')
        profile.address = request.POST.get('address', '')
        profile.save()
        messages.success(request, 'پروفایل با موفقیت به‌روزرسانی شد')
    return render(request, 'accounts/profile.html', {'profile': profile})

@login_required
def favorites_view(request):
    favorite_books = FavoriteBook.objects.filter(user=request.user).select_related('book')
    return render(request, 'accounts/favorites.html', {'favorite_books': favorite_books})

@login_required
@require_POST
def toggle_favorite(request):
    try:
        data = json.loads(request.body)
        book_id = data.get('book_id')
        book = Book.objects.get(id=book_id)
        
        favorite, created = FavoriteBook.objects.get_or_create(
            user=request.user,
            book=book
        )
        
        if not created:
            favorite.delete()
            return JsonResponse({'status': 'removed', 'message': 'کتاب از علاقه‌مندی‌ها حذف شد'})
        else:
            return JsonResponse({'status': 'added', 'message': 'کتاب به علاقه‌مندی‌ها اضافه شد'})
    except Book.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'کتاب یافت نشد'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': 'خطا در پردازش درخواست'})