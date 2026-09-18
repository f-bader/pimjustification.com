import { justifications } from './justifications.js';
import { createPicker } from './shuffle.js';

const levels = [
  ['Off', 'Perfectly reasonable. Suspiciously professional.'],
  ['Subtle', 'A little honesty between the lines.'],
  ['Dry', 'For the record, this is still a reason.'],
  ['Pointed', 'The audit log is getting a personality.'],
  ['Heavy', 'Perhaps read it twice before pasting.'],
  ['Fully sarcastic', 'Your inner monologue has entered the chat.'],
];
const pick = createPicker(justifications);
const slider = document.querySelector('#sarcasm');
const text = document.querySelector('#justification');
const status = document.querySelector('#status');
const copyLabel = document.querySelector('#copy-label');
let revision = 0;
let copyAttempt = 0;
let feedbackTimer;

function showJustification() {
  const level = Number(slider.value);
  const [label, hint] = levels[level];
  revision++;
  clearTimeout(feedbackTimer);
  document.querySelector('#level-number').textContent = level;
  document.querySelector('#level-label').textContent = label;
  document.querySelector('#level-hint').textContent = hint;
  slider.setAttribute('aria-valuetext', `${level} of 5: ${label}`);
  text.textContent = pick(level);
  status.textContent = '';
  copyLabel.textContent = 'Copy justification';
}

slider.addEventListener('input', showJustification);
document.querySelector('#another').addEventListener('click', showJustification);
document.querySelector('#copy').addEventListener('click', async () => {
  const copiedRevision = revision;
  const attempt = ++copyAttempt;
  const value = text.textContent;
  clearTimeout(feedbackTimer);
  try {
    await navigator.clipboard.writeText(value);
    if (revision !== copiedRevision || attempt !== copyAttempt) return;
    copyLabel.textContent = 'Copied!';
    status.textContent = 'Copied to clipboard. Make good choices.';
    feedbackTimer = setTimeout(() => {
      copyLabel.textContent = 'Copy justification';
      status.textContent = '';
    }, 3000);
  } catch {
    if (revision !== copiedRevision || attempt !== copyAttempt) return;
    text.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    selection?.removeAllRanges();
    selection?.addRange(range);
    copyLabel.textContent = 'Copy justification';
    status.textContent = 'Automatic copy is unavailable. Select the justification and press Ctrl+C or ⌘C, or touch and hold to copy.';
  }
});

// Explicitly reset: browsers may restore form values on a normal reload.
slider.value = '0';
document.querySelector('#generator').hidden = false;
showJustification();
