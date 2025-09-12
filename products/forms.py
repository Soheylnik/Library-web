from django import forms
from .models import Book, Author, Publisher, Genre

class BookForm(forms.ModelForm):

    new_author = forms.CharField(
        required=False,
        label='نویسنده جدید (اختیاری)',
        widget=forms.TextInput(attrs={
            'placeholder': 'نام و نام خانوادگی نویسنده جدید (مثال: احمد محمدی)',
            'style': 'padding: 12px 15px; width: 100%; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; margin-top: 10px; color: #495057; background-color: white;'
        })
    )
    
    new_publisher = forms.CharField(
        required=False,
        label='ناشر جدید (اختیاری)',
        widget=forms.TextInput(attrs={
            'placeholder': 'نام ناشر جدید را وارد کنید',
            'style': 'padding: 12px 15px; width: 100%; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; margin-top: 10px; color: #495057; background-color: white;'
        })
    )
    
    new_genre = forms.CharField(
        required=False,
        label='ژانر جدید (اختیاری)',
        widget=forms.TextInput(attrs={
            'placeholder': 'نام ژانر جدید را وارد کنید',
            'style': 'padding: 12px 15px; width: 100%; border: 2px solid #dee2e6; border-radius: 8px; font-size: 16px; margin-top: 10px; color: #495057; background-color: white;'
        })
    )

    class Meta:
        model = Book
        fields = ['title','author','description','pages','price','quantity','publication_date','publisher','genre','image']
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'عنوان کتاب را وارد کنید',
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; color: #495057; background-color: white;'
            }),
            'author': forms.Select(attrs={
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; background: white; transition: border-color 0.3s ease; color: #495057;'
            }),
            'description': forms.Textarea(attrs={
                'placeholder': 'توضیحات کتاب را وارد کنید',
                'rows': 4,
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; resize: vertical; color: #495057; background-color: white;'
            }),
            'pages': forms.NumberInput(attrs={
                'placeholder': 'تعداد صفحات',
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; color: #495057; background-color: white;'
            }),
            'price': forms.NumberInput(attrs={
                'placeholder': 'قیمت به تومان',
                'step': '0.001',
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; color: #495057; background-color: white;'
            }),
            'quantity': forms.NumberInput(attrs={
                'placeholder': 'تعداد موجودی',
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; color: #495057; background-color: white;'
            }),
            'publication_date': forms.DateInput(attrs={
                'type': 'date',
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; color: #495057; background-color: white;'
            }),
            'publisher': forms.Select(attrs={
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; background: white; transition: border-color 0.3s ease; color: #495057;'
            }),
            'genre': forms.CheckboxSelectMultiple(attrs={
                'style': 'margin-top: 10px;'
            }),
            'image': forms.FileInput(attrs={
                'accept': 'image/*',
                'style': 'padding: 12px 15px; width: 100%; border: 2px solid #e9ecef; border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; color: #495057; background-color: white;'
            })
        }
        labels = {
            'title': 'عنوان کتاب *',
            'author': 'نویسنده *',
            'description': 'توضیحات *',
            'pages': 'تعداد صفحات *',
            'price': 'قیمت (تومان) *',
            'quantity': 'موجودی *',
            'publication_date': 'تاریخ انتشار *',
            'publisher': 'ناشر',
            'genre': 'ژانرها (اختیاری)',
            'image': 'تصویر کتاب'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
     
        self.fields['author'].empty_label = "نویسنده را انتخاب کنید"
        self.fields['publisher'].empty_label = "ناشر را انتخاب کنید"
        
       
        self.fields['author'].choices = [('', 'نویسنده را انتخاب کنید')] + list(self.fields['author'].choices)[1:]
        self.fields['publisher'].choices = [('', 'ناشر را انتخاب کنید')] + list(self.fields['publisher'].choices)[1:]
        
    def clean_new_genre(self):
        """اعتبارسنجی ژانر جدید"""
        new_genre = self.cleaned_data.get('new_genre', '')
        if new_genre:
            new_genre = new_genre.strip()
            if len(new_genre) < 2:
                raise forms.ValidationError('نام ژانر باید حداقل 2 کاراکتر باشد.')
            if len(new_genre) > 100:
                raise forms.ValidationError('نام ژانر نمی‌تواند بیش از 100 کاراکتر باشد.')
        return new_genre

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['author'].empty_label = "نویسنده را انتخاب کنید"
        self.fields['publisher'].empty_label = "ناشر را انتخاب کنید"
        self.fields['author'].choices = [('', 'نویسنده را انتخاب کنید')] + list(self.fields['author'].choices)[1:]
        self.fields['publisher'].choices = [('', 'ناشر را انتخاب کنید')] + list(self.fields['publisher'].choices)[1:]
        
       
        self.fields['genre'].required = False
        
       
        if not hasattr(self, 'cleaned_data') or not self.cleaned_data:
            self.cleaned_data = {}
        if 'new_genre' not in self.cleaned_data:
            self.cleaned_data['new_genre'] = ''
        if 'new_author' not in self.cleaned_data:
            self.cleaned_data['new_author'] = ''
        if 'new_publisher' not in self.cleaned_data:
            self.cleaned_data['new_publisher'] = ''

    def save(self, commit=True):
        instance = super().save(commit=False)
        
       
        if self.cleaned_data.get('new_author'):
          
            author_name = self.cleaned_data['new_author'].strip()
            name_parts = author_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            author, created = Author.objects.get_or_create(
                first_name=first_name,
                last_name=last_name,
                defaults={
                    'bio': 'بیوگرافی نویسنده',
                    'birth_date': '1900-01-01'
                }
            )
            instance.author = author
        
       
        if self.cleaned_data.get('new_publisher'):
            publisher, created = Publisher.objects.get_or_create(
                name=self.cleaned_data['new_publisher']
            )
            instance.publisher = publisher
        
        if commit:
            instance.save()
            
          
            genres_to_add = []
            
            
            selected_genres = self.cleaned_data.get('genre')
            if selected_genres:
                genres_to_add.extend(selected_genres)
                print(f"ژانرهای انتخاب شده: {[g.name for g in selected_genres]}")
            
           
            new_genre_name = self.cleaned_data.get('new_genre', '')
            if new_genre_name:
                new_genre_name = new_genre_name.strip()
                if new_genre_name:  
                    genre, created = Genre.objects.get_or_create(
                        name=new_genre_name
                    )
                    print(f"ژانر جدید ایجاد/پیدا شد: {genre.name} (ایجاد شده: {created})")
                    
                    if genre not in genres_to_add:
                        genres_to_add.append(genre)
                        print(f"ژانر جدید به لیست اضافه شد: {genre.name}")
            
          
            if genres_to_add:
                instance.genre.set(genres_to_add)
                print(f"ژانرهای نهایی اضافه شده به کتاب '{instance.title}': {[g.name for g in genres_to_add]}")
            else:
                print(f"هیچ ژانری برای کتاب '{instance.title}' اضافه نشد")
            
           
            instance.save()
        
        return instance