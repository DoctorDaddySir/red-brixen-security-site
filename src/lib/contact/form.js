// Client-side contact form behavior. Pure vanilla JS; no framework.
// Progressive enhancement over a real <form>: if JS is disabled the form
// still submits to the endpoint (server returns JSON). With JS it gets live
// validation, state management, and friendly status messaging.
//
// IMPORTANT: browser validation here is UX only. The server is the source of
// truth and re-validates everything.
import {
  FIELD_LIMITS,
  REASON_VALUES,
  ERROR_MESSAGES,
  DEFAULT_ENDPOINT,
} from './constants.js';

const FORM_SELECTOR = '#contact-form';
const STATUS_SELECTOR = '#form-status';
const FIELD_CLASS = '.contact-field';
const ERROR_CLASS = '.field-error';

const STATES = {
  IDLE: 'idle',
  SENDING: 'sending',
  SUCCESS: 'success',
  ERROR: 'error',
};

export function endpointFromForm(form) {
  return form.getAttribute('data-endpoint') || DEFAULT_ENDPOINT;
}

function setStatus(form, text, type) {
  const status = form.querySelector(STATUS_SELECTOR);
  if (!status) return;
  status.textContent = text || '';
  status.className = type ? 'status-' + type : '';
}

function setFieldErrors(form, errors) {
  clearFieldErrors(form);
  let firstInvalid = null;
  Object.entries(errors).forEach(([field, messages]) => {
    if (field === '__form') {
      setStatus(form, messages[0] || ERROR_MESSAGES.server, 'error');
      return;
    }
    const wrapper = form.querySelector(
      FIELD_CLASS + '[data-field="' + field + '"]',
    );
    if (!wrapper) return;
    const message =
      wrapper.querySelector(ERROR_CLASS) || document.createElement('span');
    message.className = ERROR_CLASS;
    message.textContent = messages[0];
    message.id = 'error-' + field;
    wrapper.appendChild(message);
    wrapper.setAttribute('aria-invalid', 'true');
    const input = wrapper.querySelector('input, select, textarea');
    if (input) {
      input.setAttribute('aria-describedby', 'error-' + field);
      if (!firstInvalid) firstInvalid = input;
    }
  });
  if (firstInvalid) firstInvalid.focus();
}

function clearFieldErrors(form) {
  form.querySelectorAll(ERROR_CLASS).forEach((node) => node.remove());
  form
    .querySelectorAll(FIELD_CLASS + '[aria-invalid="true"]')
    .forEach((wrapper) => {
      wrapper.setAttribute('aria-invalid', 'false');
    });
  form
    .querySelectorAll(
      'input[aria-describedby], select[aria-describedby], textarea[aria-describedby]',
    )
    .forEach((input) => input.removeAttribute('aria-describedby'));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function collectFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = typeof value === 'string' ? value : String(value);
  });
  return data;
}

// Mirror the server rules for fast UX feedback.
function validateUI(form) {
  const data = collectFormData(form);
  const errors = {};

  if (!data.name) errors.name = [ERROR_MESSAGES.required];
  else if (data.name.length > FIELD_LIMITS.name.max)
    errors.name = [ERROR_MESSAGES.length(FIELD_LIMITS.name.max)];

  if (!data.email) errors.email = [ERROR_MESSAGES.required];
  else if (data.email.length > FIELD_LIMITS.email.max)
    errors.email = [ERROR_MESSAGES.length(FIELD_LIMITS.email.max)];
  else if (!isValidEmail(data.email)) errors.email = [ERROR_MESSAGES.email];

  if (!data.reason) errors.reason = [ERROR_MESSAGES.required];
  else if (!REASON_VALUES.includes(data.reason))
    errors.reason = [ERROR_MESSAGES.reason];

  if (!data.message) errors.message = [ERROR_MESSAGES.required];
  else if (data.message.length > FIELD_LIMITS.message.max)
    errors.message = [ERROR_MESSAGES.length(FIELD_LIMITS.message.max)];

  return { ok: Object.keys(errors).length === 0, errors };
}

export function initContactForm(formElement) {
  const form = formElement || document.querySelector(FORM_SELECTOR);
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);

    const { ok, errors } = validateUI(form);
    if (!ok) {
      setFieldErrors(form, errors);
      return;
    }

    form.dataset.state = STATES.SENDING;
    setStatus(form, 'Sending...', 'busy');
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;

    const url = endpointFromForm(form);
    const payload = collectFormData(form);
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      finishError(form);
      return;
    }

    let result;
    try {
      result = await response.json();
    } catch {
      finishError(form);
      return;
    }

    if (response.ok && result.ok) {
      form.reset();
      form.dataset.state = STATES.SUCCESS;
      const ref = result.referenceId
        ? ' Message sent. Reference: ' + result.referenceId
        : ' Message sent.';
      setStatus(form, ref, 'success');
    } else if (response.status === 400 && result.errors) {
      setFieldErrors(form, result.errors);
      form.dataset.state = STATES.ERROR;
    } else if (response.status === 429) {
      finishError(form, ERROR_MESSAGES.rateLimit);
    } else {
      finishError(form, result.message);
    }
  });
}

function finishError(form, message) {
  form.dataset.state = STATES.ERROR;
  setStatus(form, message || ERROR_MESSAGES.server, 'error');
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = false;
}

// Auto-initialize on page load (the page is server-rendered with client:load).
if (typeof document !== 'undefined') {
  const ready = () => initContactForm();
  if (document.readyState !== 'loading') ready();
  else document.addEventListener('DOMContentLoaded', ready);
}
