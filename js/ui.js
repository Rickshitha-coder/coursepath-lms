/* ui.js — navbar rendering, toasts, small view helpers shared by every page. */

const UI = (() => {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return new Date(iso).toLocaleDateString();
  }

  function initials(name) {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  function toast(message) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function renderNavbar(activePage) {
    const mount = document.getElementById('navbar-mount');
    if (!mount) return;
    const user = Api.currentUser();

    const linksLoggedOut = `
      <a href="index.html" data-page="index">Home</a>
      <a href="browse-courses.html" data-page="browse-courses">Courses</a>
      <a href="login.html" data-page="login">Log in</a>`;

    const studentLinks = `
      <a href="student-dashboard.html" data-page="student-dashboard">Dashboard</a>
      <a href="browse-courses.html" data-page="browse-courses">Browse</a>
      <a href="my-courses.html" data-page="my-courses">My courses</a>
      <a href="progress.html" data-page="progress">Progress</a>
      <a href="notifications.html" data-page="notifications">Notifications${Api.unreadCount(user ? user.id : '') ? ' •' : ''}</a>`;

    const adminLinks = `
      <a href="admin-dashboard.html" data-page="admin-dashboard">Dashboard</a>
      <a href="admin-courses.html" data-page="admin-courses">Courses</a>
      <a href="admin-students.html" data-page="admin-students">Students</a>
      <a href="notifications.html" data-page="notifications">Notifications</a>`;

    const linksHTML = !user ? linksLoggedOut : (user.role === 'admin' ? adminLinks : studentLinks);

    mount.innerHTML = `
      <nav class="topnav">
        <div class="container">
          <a href="${user ? (user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html') : 'index.html'}" class="brand">
            <span class="brand-mark">C</span>
            <span class="brand-name">Coursepath</span>
          </a>
          <button class="navtoggle" id="navtoggle" aria-label="Toggle menu">&#9776;</button>
          <ul class="navlinks" id="navlinks">${linksHTML}</ul>
          <div class="nav-user">
            ${user ? `
              <div class="nav-avatar" title="${escapeHtml(user.name)}">${initials(user.name)}</div>
              <button class="btn-ghost-nav" id="logout-btn">Log out</button>
            ` : `<a href="register.html" class="btn btn-amber btn-sm">Get started</a>`}
          </div>
        </div>
      </nav>`;

    const links = mount.querySelectorAll('.navlinks a');
    links.forEach(a => { if (a.dataset.page === activePage) a.classList.add('active'); });

    const toggle = document.getElementById('navtoggle');
    if (toggle) toggle.addEventListener('click', () => document.getElementById('navlinks').classList.toggle('open'));

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', Api.logout);
  }

  function renderFooter() {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;
    const year = new Date().getFullYear();
    mount.innerHTML = `
      <footer class="sitefoot">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="brand"><span class="brand-mark">C</span><span class="brand-name" style="color:#fff;">Coursepath</span></a>
              <p>A student course management and learning progress tracking system — browse courses, learn module by module, and keep every certificate in one place.</p>
              <div class="footer-social">
                <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">&#120143;</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
                <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub">&#9679;</a>
                <a href="mailto:hello@coursepath.edu" aria-label="Email">&#9993;</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Learn</h4>
              <ul>
                <li><a href="browse-courses.html">Browse courses</a></li>
                <li><a href="register.html">Create an account</a></li>
                <li><a href="my-courses.html">My courses</a></li>
                <li><a href="progress.html">Track progress</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Administer</h4>
              <ul>
                <li><a href="admin-dashboard.html">Admin dashboard</a></li>
                <li><a href="admin-courses.html">Manage courses</a></li>
                <li><a href="admin-students.html">Manage students</a></li>
                <li><a href="add-course.html">Add a course</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="forgot-password.html">Reset password</a></li>
                <li><a href="notifications.html">Notifications</a></li>
                <li><a href="mailto:support@coursepath.edu">Contact support</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener">Report an issue</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Project</h4>
              <ul>
                <li><a href="https://developer.mozilla.org/en-US/docs/Web" target="_blank" rel="noopener">Web dev docs</a></li>
                <li><a href="https://react.dev/learn" target="_blank" rel="noopener">React docs</a></li>
                <li><a href="https://nodejs.org/en/docs" target="_blank" rel="noopener">Node.js docs</a></li>
                <li><a href="https://www.mongodb.com/docs/manual/" target="_blank" rel="noopener">MongoDB docs</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${year} Coursepath — Student Course Management &amp; Learning Progress Tracking System.</span>
            <div class="legal-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  function chainMini(total, done) {
    let html = '<div class="chain">';
    for (let i = 0; i < total; i++) {
      html += `<span class="node ${i < done ? 'done' : ''}"></span>`;
      if (i < total - 1) html += `<span class="seg ${i < done - 1 ? 'done' : ''}"></span>`;
    }
    return html + '</div>';
  }

  return { escapeHtml, timeAgo, initials, toast, renderNavbar, renderFooter, chainMini };
})();

document.addEventListener('DOMContentLoaded', () => {
  UI.renderNavbar(document.body.dataset.page);
  UI.renderFooter();
});
