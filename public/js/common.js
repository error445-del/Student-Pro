// Auth check - call on every page except login
async function checkAuth() {
  try {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (!data.success) {
      window.location.href = '/login.html';
      return false;
    }
    // Set user name in top bar if element exists
    const userEl = document.getElementById('current-user');
    if (userEl) userEl.textContent = data.data.username;
    return true;
  } catch {
    window.location.href = '/login.html';
    return false;
  }
}

// Logout
async function logout() {
  await fetch('/api/logout');
  window.location.href = '/login.html';
}

// Toast notification
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Modal helpers
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Compute grade from marks
function computeGrade(marks) {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B+';
  if (marks >= 60) return 'B';
  return 'C';
}

// Active sidebar link
function setActiveNav() {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === current) link.classList.add('active');
  });
}

// Sidebar toggle
function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    const closeSidebar = () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      backdrop.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a.nav-item:not(#logout-btn)').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeSidebar();
    });
  }
  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  }
}

// On DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initSidebar();
});
