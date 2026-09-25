// Build the outbound email body (plain text + HTML) for a contact submission.
// Every field inserted into HTML is escaped; subject components are stripped
// of line breaks to prevent email header injection.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Ensure a value can never carry a CRLF into a header context.
function stripLineBreaks(value) {
  return String(value)
    .replace(/\r?\n|\r/g, ' ')
    .trim();
}

/**
 * @param {{ name: string, email: string, reason: string, message: string,
 *   referenceId: string }} input
 */
export function buildMessage(input) {
  const { name, email, reason, message, referenceId } = input;
  const subject = `[Red Brixen] Contact ${formatReason(reason)} #${referenceId}`;
  // Subject may only contain printable header-safe characters.
  const safeSubject = stripLineBreaks(subject).slice(0, 160);

  const text =
    `Reference: ${referenceId}\n\n` +
    `From: ${stripLineBreaks(name)} <${stripLineBreaks(email)}>\n` +
    `Reason: ${formatReason(reason)}\n\n` +
    `Message:\n${message}\n`;

  const html = [
    '<!doctype html><html><head><meta charset="utf-8">',
    `<title>${escapeHtml(safeSubject)}</title></head><body>`,
    `<h2>${escapeHtml(safeSubject)}</h2>`,
    '<table>',
    `<tr><th align="left">Reference</th><td>${escapeHtml(referenceId)}</td></tr>`,
    `<tr><th align="left">From</th><td>${escapeHtml(`${name} <${email}>`)}</td></tr>`,
    `<tr><th align="left">Reason</th><td>${escapeHtml(formatReason(reason))}</td></tr>`,
    '</table>',
    `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    '</body></html>',
  ].join('\n');

  return { subject: safeSubject, text, html };
}

function formatReason(reason) {
  return reason ? reason.replace(/-/g, ' ') : '';
}
