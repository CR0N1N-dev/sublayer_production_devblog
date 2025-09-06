// Глобальные переменные
let blogPosts = [];
let filteredPosts = [];
let currentSearchTerm = '';
let currentPage = 1;
const postsPerPage = 6;

// DOM элементы
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const blogGrid = document.getElementById('blog-grid');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');
const navLinks = document.querySelectorAll('.nav-link');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const searchResultsInfo = document.getElementById('search-results-info');
const noResults = document.getElementById('no-results');
const themeToggle = document.getElementById('theme-toggle');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializeSearch();
    initializePagination();
    loadBlogPosts();
    initializeScrollEffects();
    initializeModal();
});

// Управление темой
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
    
    // Обновляем фон заголовка сразу при смене темы
    updateHeaderBackground();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Добавляем анимацию переключения
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
}

// Поиск
function initializeSearch() {
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Добавляем обработчик для Enter
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}

function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    currentSearchTerm = searchTerm;
    currentPage = 1; // Сбрасываем на первую страницу при поиске
    
    // Показываем/скрываем кнопку очистки
    if (searchTerm) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }
    
    filterAndRenderPosts();
}

function clearSearch() {
    searchInput.value = '';
    currentSearchTerm = '';
    currentPage = 1; // Сбрасываем на первую страницу
    clearSearchBtn.style.display = 'none';
    searchResultsInfo.style.display = 'none';
    filterAndRenderPosts();
    searchInput.focus();
}

function filterPosts(searchTerm) {
    if (!searchTerm) {
        return [...blogPosts];
    }
    
    return blogPosts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchTerm);
        const contentMatch = post.content.toLowerCase().includes(searchTerm);
        const excerptMatch = post.excerpt.toLowerCase().includes(searchTerm);
        const tagsMatch = post.tags && post.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm)
        );
        
        return titleMatch || contentMatch || excerptMatch || tagsMatch;
    });
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Инициализация пагинации
function initializePagination() {
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
        }
    });
}

function filterAndRenderPosts() {
    // Сортируем посты по дате (новые сверху)
    blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredPosts = filterPosts(currentSearchTerm);
    
    // Обновляем информацию о результатах поиска
    updateSearchResultsInfo();
    
    // Рендерим отфильтрованные посты
    renderCurrentPage();
}

function updateSearchResultsInfo() {
    if (currentSearchTerm) {
        const resultsCount = filteredPosts.length;
        const totalCount = blogPosts.length;
        
        if (resultsCount === 0) {
            searchResultsInfo.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            searchResultsInfo.style.display = 'block';
            noResults.style.display = 'none';
            searchResultsInfo.textContent = `Найдено ${resultsCount} из ${totalCount} статей по запросу "${currentSearchTerm}"`;
        }
    } else {
        searchResultsInfo.style.display = 'none';
        noResults.style.display = 'none';
    }
}

function renderCurrentPage() {
    // Проверяем если нет постов для отображения
    if (filteredPosts.length === 0 && currentSearchTerm) {
        blogGrid.innerHTML = '';
        pagination.style.display = 'none';
        return;
    }
    
    if (filteredPosts.length === 0 && !currentSearchTerm) {
        blogGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Статьи пока не добавлены.</p>';
        pagination.style.display = 'none';
        return;
    }

    // Вычисляем индексы для текущей страницы
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    // Очищаем контейнер и добавляем посты для текущей страницы
    blogGrid.innerHTML = '';
    
    postsToShow.forEach((post, index) => {
        const blogCard = createBlogCard(post, startIndex + index);
        blogGrid.appendChild(blogCard);
    });

    // Обновляем пагинацию
    updatePagination();
    
    // Анимация появления карточек
    animateBlogCards();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    // Показываем пагинацию только если страниц больше одной
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Обновляем информацию о странице
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    
    // Обновляем состояние кнопок
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

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
        filteredPosts = [...blogPosts];
        filterAndRenderPosts();
    } catch (error) {
        console.error('Ошибка:', error);
        blogGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Не удалось загрузить статьи блога.</p>';
    }
}

// Создание карточки блога
function createBlogCard(post, index) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    // Применяем подсветку поиска к заголовку и описанию
    const highlightedTitle = highlightText(post.title, currentSearchTerm);
    const highlightedExcerpt = highlightText(post.excerpt, currentSearchTerm);
    
    // Подсвечиваем теги если есть совпадение
    let tagsHtml = '';
    if (post.tags) {
        const highlightedTags = post.tags.map(tag => 
            highlightText(tag, currentSearchTerm)
        );
        tagsHtml = `<span>🏷️ ${highlightedTags.join(', ')}</span>`;
    }
    
    card.innerHTML = `
        <h3>${highlightedTitle}</h3>
        <div class="blog-meta">
            <span>📅 ${formatDate(post.date)}</span>
            <span>⏱️ ${post.readTime} мин чтения</span>
            ${tagsHtml}
        </div>
        <p class="blog-excerpt">${highlightedExcerpt}</p>
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
    const highlightedTitle = highlightText(post.title, currentSearchTerm);
    const highlightedContent = highlightText(formatContent(post.content), currentSearchTerm);
    
    let tagsHtml = '';
    if (post.tags) {
        const highlightedTags = post.tags.map(tag => 
            highlightText(tag, currentSearchTerm)
        );
        tagsHtml = `<span>🏷️ ${highlightedTags.join(', ')}</span>`;
    }
    
    modalBody.innerHTML = `
        <h3>${highlightedTitle}</h3>
        <div class="blog-meta" style="margin-bottom: 2rem;">
            <span>📅 ${formatDate(post.date)}</span>
            <span>⏱️ ${post.readTime} мин чтения</span>
            ${tagsHtml}
        </div>
        <div style="line-height: 1.8; color: var(--text-secondary);">
            ${highlightedContent}
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обновление фона заголовка
function updateHeaderBackground() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (scrollY > 100) {
        header.style.background = isDarkTheme 
            ? 'rgba(17, 24, 39, 0.98)' 
            : 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = isDarkTheme 
            ? 'rgba(17, 24, 39, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}

// Эффекты при прокрутке
function initializeScrollEffects() {
    // Изменение прозрачности заголовка при прокрутке
    window.addEventListener('scroll', updateHeaderBackground);

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
        .replace(/`(.*?)`/g, '<code style="background: var(--search-bg); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
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

// Улучшенная обработка мобильного меню
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-right') && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        resetHamburger();
    }
});

// Debounce функция для оптимизации поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Применяем debounce к поиску для лучшей производительности
const debouncedSearch = debounce(handleSearch, 150);
searchInput.removeEventListener('input', handleSearch);
searchInput.addEventListener('input', debouncedSearch);
