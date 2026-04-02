// Своё API на localStorage

// Ключ для хранения в браузере
const KEY = 'my_posts';

// При первом запуске добавляем примеры
if (!localStorage.getItem(KEY)) {
  const startPosts = [
    { id: 1, title: 'Мой первый пост', body: 'Привет! Это мой первый пост.' },
    { id: 2, title: 'Как дела?', body: 'Учусь работать с localStorage.' },
    { id: 3, title: 'Планы на сегодня', body: 'Сделать домашку и выучить JavaScript.' }
  ];
  localStorage.setItem(KEY, JSON.stringify(startPosts));
}

// Получить все посты
function getPosts() {
  const data = localStorage.getItem(KEY);
  return JSON.parse(data);
}

// Сохранить посты
function savePosts(posts) {
  localStorage.setItem(KEY, JSON.stringify(posts));
}

// Добавить пост
function addPost(title, body) {
  const posts = getPosts();
  const newId = posts.length > 0 ? posts[posts.length - 1].id + 1 : 1;
  posts.push({ id: newId, title: title, body: body });
  savePosts(posts);
}

// Удалить пост
function deletePost(id) {
  let posts = getPosts();
  posts = posts.filter(post => post.id !== id);
  savePosts(posts);
}

// Обновить пост
function updatePost(id, newTitle, newBody) {
  const posts = getPosts();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === id) {
      posts[i].title = newTitle;
      posts[i].body = newBody;
      break;
    }
  }
  savePosts(posts);
}

// Очистить всё
function clearAll() {
  savePosts([]);
}

// Работа с интерфейсом

let postsArray = [];
let editingId = null; // id поста который редактируем (null = добавляем новый)

const container = document.getElementById('cards');
const searchInput = document.getElementById('search');
const loadBtn = document.getElementById('btnLoad');
const resetBtn = document.getElementById('btnReset');
const clearBtn = document.getElementById('btnClear');
const loadingSpan = document.getElementById('loading');
const errorSpan = document.getElementById('error');

// Элементы формы
const form = document.getElementById('postForm');
const formTitle = document.getElementById('formTitle');
const formBody = document.getElementById('formBody');
const formSubmitBtn = document.getElementById('formSubmitBtn');
const formCancelBtn = document.getElementById('formCancelBtn');

// Показать/скрыть форму
function showForm(isEdit = false) {
  form.hidden = false;
  if (isEdit) {
    formSubmitBtn.textContent = 'Сохранить изменения';
  } else {
    formSubmitBtn.textContent = 'Добавить пост';
    formTitle.value = '';
    formBody.value = '';
    editingId = null;
  }
}

function hideForm() {
  form.hidden = true;
  formTitle.value = '';
  formBody.value = '';
  editingId = null;
  errorSpan.hidden = true;
}

// Функция для добавления/обновления поста
function savePost(title, body) {
  if (editingId !== null) {
    // Редактируем существующий пост
    updatePost(editingId, title, body);
    editingId = null;
  } else {
    // Добавляем новый пост
    addPost(title, body);
  }
  hideForm();
  loadPosts(); // Перезагружаем список
}

// Обработчик отправки формы
function onFormSubmit(event) {
  event.preventDefault();
  
  const title = formTitle.value.trim();
  const body = formBody.value.trim();
  
  if (title === '' || body === '') {
    errorSpan.hidden = false;
    errorSpan.textContent = 'Заполните заголовок и текст';
    return;
  }
  
  errorSpan.hidden = true;
  savePost(title, body);
}

// Отмена редактирования
function onFormCancel() {
  hideForm();
  errorSpan.hidden = true;
}

// Показать форму для редактирования поста
function editPost(id, oldTitle, oldBody) {
  editingId = id;
  formTitle.value = oldTitle;
  formBody.value = oldBody;
  showForm(true);
}

// Показать карточки
function showCards(posts) {
  container.innerHTML = '';
  
  if (posts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #888;">Нет постов :(</p>';
    return;
  }
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    
    const card = document.createElement('div');
    card.className = 'card';
    
    const title = document.createElement('h2');
    title.textContent = post.title;
    
    const text = document.createElement('p');
    text.textContent = post.body;
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Редактировать';
    editBtn.className = 'btn-card';
    editBtn.onclick = function() {
      editPost(post.id, post.title, post.body);
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.className = 'btn-card btn-delete';
    deleteBtn.onclick = function() {
      if (confirm('Удалить пост?')) {
        deletePost(post.id);
        loadPosts();
      }
    };
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'card-actions';
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(btnContainer);
    container.appendChild(card);
  }
}

// Фильтр по поиску
function filterPosts() {
  const query = searchInput.value.toLowerCase().trim();
  if (query === '') {
    return postsArray;
  }
  
  const filtered = [];
  for (let i = 0; i < postsArray.length; i++) {
    const post = postsArray[i];
    // Ищем и в заголовке, и в тексте поста
    if (post.title.toLowerCase().indexOf(query) !== -1 || 
        post.body.toLowerCase().indexOf(query) !== -1) {
      filtered.push(post);
    }
  }
  return filtered;
}

// Загрузить посты
function loadPosts() {
  loadingSpan.hidden = false;
  errorSpan.hidden = true;
  
  try {
    postsArray = getPosts();
    const filtered = filterPosts();
    showCards(filtered);
  } catch (err) {
    errorSpan.hidden = false;
    errorSpan.textContent = 'Ошибка загрузки: ' + err.message;
  }
  
  loadingSpan.hidden = true;
}

// Сброс поиска
function resetSearch() {
  searchInput.value = '';
  loadPosts();
}

// Очистить все посты
function clearPosts() {
  if (confirm('Точно удалить всё?')) {
    clearAll();
    loadPosts();
  }
}

// Слушатели кнопок
loadBtn.onclick = loadPosts;
resetBtn.onclick = resetSearch;
clearBtn.onclick = clearPosts;
form.onsubmit = onFormSubmit;
formCancelBtn.onclick = onFormCancel;

// Поиск в реальном времени
searchInput.oninput = function() {
  loadPosts(); // Перезагружаем с новым поисковым запросом
};

// Кнопка "Добавить пост" теперь показывает форму
const addBtn = document.getElementById('btnAdd');
addBtn.onclick = function() {
  showForm(false);
};

// Загружаем при старте
loadPosts();