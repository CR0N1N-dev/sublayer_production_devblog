// Глобальные переменные
let blogPosts = [];

// DOM элементы
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const blogGrid = document.getElementById('blog-grid');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');
const navLinks = document.querySelectorAll('.nav-link');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadBlogPosts();
    initializeScrollEffects();
    initializeModal();
});

// Навигация
function initializeNavigation() {
    // Мобильное меню
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        animateHamburger();
    });

    // Плавная прокрутка для навигационных ссылок
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Закрыть мобильное меню
                navMenu.classList.remove('active');
                resetHamburger();
            }
        });
    });
}

// Анимация гамбургер-меню
function animateHamburger() {
    const spans = navToggle.querySelectorAll('span');
    navToggle.classList.toggle('active');
    
    if (navToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        resetHamburger();
    }
}

function resetHamburger() {
    const spans = navToggle.querySelectorAll('span');
    navToggle.classList.remove('active');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
}

// Загрузка статей блога
async function loadBlogPosts() {
    try {
        const response = await fetch('blog-data.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных блога');
        }
        
        blogPosts = await response.json();
        renderBlogPosts();
    } catch (error) {
        console.error('Ошибка:', error);
        blogGrid.innerHTML = '<p style=\"text-align: center; color: #6b7280; grid-column: 1 / -1;\">Не удалось загрузить статьи блога.</p>';
    }
}

// Отображение статей блога
function renderBlogPosts() {
    if (!blogPosts || blogPosts.length === 0) {
        blogGrid.innerHTML = '<p style=\"text-align: center; color: #6b7280; grid-column: 1 / -1;\">Статьи пока не добавлены.</p>';
        return;
    }

    blogGrid.innerHTML = '';
    
    blogPosts.forEach((post, index) => {
        const blogCard = createBlogCard(post, index);
        blogGrid.appendChild(blogCard);
    });

    // Анимация появления карточек
    animateBlogCards();
}

// Создание карточки блога
function createBlogCard(post, index) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    card.innerHTML = `
        <h3>${post.title}</h3>
        <div class="blog-meta">
            <span>📅 ${formatDate(post.date)}</span>
            <span>⏱️ ${post.readTime} мин чтения</span>
            ${post.tags ? `<span>🏷️ ${post.tags.join(', ')}</span>` : ''}
        </div>
        <p class="blog-excerpt">${post.excerpt}</p>
        <a href="#" class="read-more" data-post-id="${index}">
            Читать полностью →
        </a>
    `;

    // Добавить обработчик клика
    card.addEventListener('click', function(e) {
        if (e.target.classList.contains('read-more')) {
            e.preventDefault();
            openModal(post);
        }
    });

    return card;
}

// Анимация появления карточек блога
function animateBlogCards() {
    const cards = document.querySelectorAll('.blog-card');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Модальное окно
function initializeModal() {
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function openModal(post) {
    modalBody.innerHTML = `
        <h3>${post.title}</h3>
        <div class="blog-meta" style="margin-bottom: 2rem;">
            <span>📅 ${formatDate(post.date)}</span>
            <span>⏱️ ${post.readTime} мин чтения</span>
            ${post.tags ? `<span>🏷️ ${post.tags.join(', ')}</span>` : ''}
        </div>
        <div style="line-height: 1.8; color: #374151;">
            ${formatContent(post.content)}
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Эффекты при прокрутке
function initializeScrollEffects() {
    // Изменение прозрачности заголовка при прокрутке
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Анимация элементов при появлении в области видимости
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);

    // Наблюдать за секциями
    const sections = document.querySelectorAll('.section-title, .about-content');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        observer.observe(section);
    });
}

// Вспомогательные функции
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatContent(content) {
    // Простая обработка markdown-подобного контента
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

// Плавная анимация для floating элементов
function animateFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        const randomDelay = Math.random() * 2000;
        const randomDuration = 4000 + Math.random() * 4000;
        
        setTimeout(() => {
            element.style.animation = `float ${randomDuration}ms ease-in-out infinite`;
        }, randomDelay);
    });
}

// Добавление интерактивности к кнопкам
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.hero-button, .read-more');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Инициализация анимаций
document.addEventListener('DOMContentLoaded', function() {
    animateFloatingElements();
});
