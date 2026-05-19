/* =====================================================
   TaskFlow — app.js
   Pure vanilla JS. No frameworks. No build step.
   localStorage key "taskflow_db" → { users[], todos[] }
   localStorage key "currentUser" → { id, name, email }
   ===================================================== */

// ── DB Layer ─────────────────────────────────────────────

const DB_KEY = 'taskflow_db';

function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : { users: [], todos: [] };
  } catch {
    return { users: [], todos: [] };
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ── Session Layer ─────────────────────────────────────────

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// ── Screen Management ─────────────────────────────────────

const SCREENS = ['login', 'register', 'dashboard'];

function showScreen(name) {
  SCREENS.forEach(id => {
    const el = document.getElementById(`screen-${id}`);
    el.classList.remove('active');
  });
  clearAllErrors();
  const target = document.getElementById(`screen-${name}`);
  target.classList.add('active');
  // Re-trigger fade-up on children
  target.querySelectorAll('.fade-up').forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

// ── Error Helpers ─────────────────────────────────────────

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function hideErr(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('show');
}

function setFieldError(inputEl, hasError) {
  if (!inputEl) return;
  inputEl.classList.toggle('has-error', hasError);
}

function clearAllErrors() {
  const errorIds = [
    'login-email-err', 'login-password-err', 'login-global-err',
    'reg-name-err', 'reg-email-err', 'reg-password-err', 'reg-global-err',
    'todo-title-err',
  ];
  errorIds.forEach(hideErr);
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

function shakeForm(formId) {
  const wrapper = document.getElementById(formId)?.closest('.card') ||
    document.getElementById(formId)?.closest('.add-panel');
  if (!wrapper) return;
  wrapper.classList.remove('shake');
  void wrapper.offsetWidth;
  wrapper.classList.add('shake');
}

// ── Validation ────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Login ─────────────────────────────────────────────────

document.getElementById('form-login').addEventListener('submit', e => {
  e.preventDefault();
  clearAllErrors();

  const emailEl = document.getElementById('login-email');
  const passEl = document.getElementById('login-password');
  const email = emailEl.value.trim();
  const pass = passEl.value;
  let valid = true;

  if (!email) {
    showErr('login-email-err', 'O e-mail é obrigatório.');
    setFieldError(emailEl, true);
    valid = false;
  } else if (!isValidEmail(email)) {
    showErr('login-email-err', 'Informe um e-mail válido.');
    setFieldError(emailEl, true);
    valid = false;
  }

  if (!pass) {
    showErr('login-password-err', 'A senha é obrigatória.');
    setFieldError(passEl, true);
    valid = false;
  }

  if (!valid) { shakeForm('form-login'); return; }

  const db = getDB();
  const user = db.users.find(u => u.email === email);

  if (!user) {
    showErr('login-global-err', 'E-mail não encontrado. Verifique ou cadastre-se.');
    setFieldError(emailEl, true);
    shakeForm('form-login');
    return;
  }

  if (user.password !== pass) {
    showErr('login-global-err', 'Senha incorreta. Tente novamente.');
    setFieldError(passEl, true);
    shakeForm('form-login');
    return;
  }

  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  emailEl.value = '';
  passEl.value = '';
  loadDashboard();
  showScreen('dashboard');
});

// ── Register ──────────────────────────────────────────────

document.getElementById('form-register').addEventListener('submit', e => {
  e.preventDefault();
  clearAllErrors();

  const nameEl = document.getElementById('reg-name');
  const emailEl = document.getElementById('reg-email');
  const passEl = document.getElementById('reg-password');
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const pass = passEl.value;
  let valid = true;

  if (!name) {
    showErr('reg-name-err', 'O nome é obrigatório.');
    setFieldError(nameEl, true);
    valid = false;
  }

  if (!email) {
    showErr('reg-email-err', 'O e-mail é obrigatório.');
    setFieldError(emailEl, true);
    valid = false;
  } else if (!isValidEmail(email)) {
    showErr('reg-email-err', 'Informe um e-mail válido.');
    setFieldError(emailEl, true);
    valid = false;
  }

  if (!pass) {
    showErr('reg-password-err', 'A senha é obrigatória.');
    setFieldError(passEl, true);
    valid = false;
  } else if (pass.length < 6) {
    showErr('reg-password-err', 'A senha deve ter pelo menos 6 caracteres.');
    setFieldError(passEl, true);
    valid = false;
  }

  if (!valid) { shakeForm('form-register'); return; }

  const db = getDB();

  if (db.users.find(u => u.email === email)) {
    showErr('reg-global-err', 'Este e-mail já está cadastrado. Faça login.');
    setFieldError(emailEl, true);
    shakeForm('form-register');
    return;
  }

  const newUser = {
    id: String(Date.now()),
    name,
    email,
    password: pass,
  };

  db.users.push(newUser);
  saveDB(db);

  nameEl.value = '';
  emailEl.value = '';
  passEl.value = '';

  setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
  loadDashboard();
  showScreen('dashboard');
});

// ── Logout ────────────────────────────────────────────────

document.getElementById('btn-logout').addEventListener('click', () => {
  clearCurrentUser();
  showScreen('login');
});

// ── Screen switches ───────────────────────────────────────

document.getElementById('go-register').addEventListener('click', () => showScreen('register'));
document.getElementById('go-login').addEventListener('click', () => showScreen('login'));

// ── Dashboard ─────────────────────────────────────────────

function loadDashboard() {
  const user = getCurrentUser();
  if (!user) { showScreen('login'); return; }

  const firstName = user.name.split(' ')[0];
  document.getElementById('dash-greeting').textContent = `Olá, ${firstName} 👋`;

  renderTodos();
}

// ── Add Todo ──────────────────────────────────────────────

document.getElementById('form-todo').addEventListener('submit', e => {
  e.preventDefault();
  clearAllErrors();

  const titleEl = document.getElementById('todo-title');
  const typeEl = document.getElementById('todo-type');
  const descEl = document.getElementById('todo-desc');
  const title = titleEl.value.trim();
  const type = typeEl.value;
  const desc = descEl.value.trim();

  if (!title) {
    showErr('todo-title-err', 'O título da tarefa é obrigatório.');
    setFieldError(titleEl, true);
    shakeForm('form-todo');
    return;
  }

  const user = getCurrentUser();
  const db = getDB();
  const now = Date.now();

  db.todos.push({
    id: String(now),
    userId: user.email,          // filter key = email
    title,
    type,
    description: desc,
    done: false,
    createdAt: now,
  });

  saveDB(db);

  titleEl.value = '';
  typeEl.value = 'work';
  descEl.value = '';

  renderTodos();

  // Scroll to list
  document.getElementById('todo-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Render Todos ──────────────────────────────────────────

function renderTodos() {
  const user = getCurrentUser();
  const db = getDB();
  const listEl = document.getElementById('todo-list');
  const emptyEl = document.getElementById('empty-state');

  // Filter by user, sort: pending first (by createdAt desc), done last
  const userTodos = db.todos
    .filter(t => t.userId === user.email)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1; // done → end
      return b.createdAt - a.createdAt;
    });

  listEl.innerHTML = '';

  if (userTodos.length === 0) {
    emptyEl.classList.add('show');
    return;
  }

  emptyEl.classList.remove('show');

  userTodos.forEach(todo => {
    listEl.appendChild(buildTodoCard(todo));
  });
}

// ── Build Todo Card ───────────────────────────────────────

const TYPE_META = {
  work: { label: 'Trabalho', cls: 'badge-work' },
  personal: { label: 'Pessoal', cls: 'badge-personal' },
  study: { label: 'Estudos', cls: 'badge-study' },
};

function buildTodoCard(todo) {
  const meta = TYPE_META[todo.type] || TYPE_META.work;

  const card = document.createElement('div');
  card.className = `todo-card${todo.done ? ' is-done' : ''}`;
  card.dataset.id = todo.id;

  const descHtml = todo.description
    ? `<p class="todo-desc">${escapeHtml(todo.description)}</p>`
    : '';

  const doneBtnAttr = todo.done ? 'disabled' : '';
  const doneBtnLabel = todo.done
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Concluída`
    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Concluir`;

  card.innerHTML = `
    <div class="todo-top">
      <div class="todo-info">
        <div style="display:flex;align-items:center;gap:.625rem;flex-wrap:wrap;margin-bottom:.25rem;">
          <span class="badge ${meta.cls}">${meta.label}</span>
          <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
        </div>
        ${descHtml}
      </div>
    </div>
    <div class="todo-actions">
      <button class="btn-done" data-action="done" ${doneBtnAttr}>${doneBtnLabel}</button>
      <button class="btn-del"  data-action="delete">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
        </svg>
        Excluir
      </button>
    </div>
  `;

  return card;
}

// ── Todo List Event Delegation ────────────────────────────

document.getElementById('todo-list').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const card = btn.closest('.todo-card');
  const todoId = card?.dataset.id;
  if (!todoId) return;

  const action = btn.dataset.action;
  const db = getDB();
  const idx = db.todos.findIndex(t => t.id === todoId);
  if (idx === -1) return;

  if (action === 'done') {
    db.todos[idx].done = true;
    saveDB(db);
    renderTodos();
  }

  if (action === 'delete') {
    card.classList.add('exiting');
    setTimeout(() => {
      db.todos.splice(idx, 1);
      saveDB(db);
      renderTodos();
    }, 220);
  }
});

// ── Utility ───────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Init ──────────────────────────────────────────────────

(function init() {
  const user = getCurrentUser();
  if (user) {
    loadDashboard();
    showScreen('dashboard');
  } else {
    showScreen('login');
  }
})();
