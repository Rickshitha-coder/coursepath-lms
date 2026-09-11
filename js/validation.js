/* validation.js — reusable client-side validators for Login/Register/Course forms. */

const Validate = (() => {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[0-9]{7,15}$/;

  function showError(fieldEl, message) {
    fieldEl.classList.add('invalid');
    const err = fieldEl.querySelector('.error');
    if (err) err.textContent = message;
  }
  function clearError(fieldEl) { fieldEl.classList.remove('invalid'); }

  function required(value) { return value !== undefined && value !== null && String(value).trim().length > 0; }
  function email(value) { return EMAIL_RE.test(value); }
  function minLen(value, n) { return String(value || '').length >= n; }
  function phone(value) { return PHONE_RE.test(value); }
  function matches(a, b) { return a === b; }

  // Wires up a <form> so each .field validates on submit and clears its
  // error state as soon as the person edits it again.
  function attach(formEl, rules) {
    formEl.querySelectorAll('.field input, .field select, .field textarea').forEach(input => {
      input.addEventListener('input', () => clearError(input.closest('.field')));
    });
    formEl.addEventListener('submit', (e) => {
      let valid = true;
      for (const rule of rules) {
        const input = formEl.querySelector(rule.name === undefined ? rule.selector : `[name="${rule.name}"]`);
        const fieldEl = input.closest('.field');
        const ok = rule.test(input.value, formEl);
        if (!ok) { showError(fieldEl, rule.message); valid = false; } else { clearError(fieldEl); }
      }
      if (!valid) e.preventDefault();
      return valid;
    });
  }

  return { required, email, minLen, phone, matches, attach, showError, clearError };
})();
