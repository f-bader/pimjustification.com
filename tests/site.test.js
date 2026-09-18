import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { justifications } from '../site/justifications.js';
import { createPicker } from '../site/shuffle.js';

test('six levels contain 100 unique, complete, paste-ready reasons each', () => {
  assert.equal(justifications.length, 6);
  const all = justifications.flat();
  assert.equal(new Set(all.map(text => text.toLowerCase().trim())).size, 600);
  for (const level of justifications) {
    assert.equal(level.length, 100);
    for (const text of level) {
      assert.equal(text, text.trim());
      assert.ok(text.length >= 30 && text.length <= 250, text);
      assert.match(text, /[.!?]$/);
      assert.doesNotMatch(text, /[\n\r<>\[\]{}]/);
    }
  }
});

test('each level exhausts its collection without repeats over multiple cycles', () => {
  let seed = 42;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  const pick = createPicker(justifications, random);
  for (let level = 0; level < 6; level++) {
    let previous;
    for (let cycle = 0; cycle < 5; cycle++) {
      const seen = new Set();
      for (let draw = 0; draw < 100; draw++) {
        const value = pick(level);
        assert.notEqual(value, previous);
        assert.ok(justifications[level].includes(value));
        assert.ok(!seen.has(value));
        seen.add(value);
        previous = value;
      }
      assert.equal(seen.size, 100);
    }
  }
});

test('switching levels preserves the remaining independent collections', () => {
  const pick = createPicker(justifications);
  const seen = justifications.map(() => new Set());
  for (let draw = 0; draw < 100; draw++) {
    for (let level = 0; level < 6; level++) {
      const value = pick(level);
      assert.ok(!seen[level].has(value));
      seen[level].add(value);
    }
  }
});

test('a refill swaps away a forced boundary repeat', () => {
  let shuffle = 0;
  const pick = createPicker([['first', 'second']], () => shuffle++ % 2 ? 0.999 : 0);
  assert.deepEqual(Array.from({ length: 8 }, () => pick(0)), [
    'first', 'second', 'first', 'second', 'first', 'second', 'first', 'second',
  ]);
});

const appSource = (await readFile(new URL('../site/app.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?\n/gm, '');

// A small DOM/clipboard harness for behavior tests, not a layout engine.
function setup(clipboard = { writeText: async () => {} }) {
  const elements = new Map();
  let focused;
  let selected;
  const timers = new Map();
  let timerID = 0;
  function element(id) {
    if (!elements.has(id)) {
      const listeners = new Map();
      elements.set(id, {
        textContent: '', value: '5', hidden: true, attributes: {},
        addEventListener: (event, listener) => listeners.set(event, listener),
        setAttribute(name, value) { this.attributes[name] = value; },
        focus() { focused = id; },
        fire: event => listeners.get(event)(),
      });
    }
    return elements.get(id);
  }
  runInNewContext(appSource, {
    justifications, createPicker,
    document: {
      querySelector: element,
      createRange: () => ({ selectNodeContents: node => { selected = node; } }),
    },
    navigator: { clipboard },
    window: { getSelection: () => ({ removeAllRanges() {}, addRange() {} }) },
    setTimeout: callback => { timers.set(++timerID, callback); return timerID; },
    clearTimeout: id => timers.delete(id),
  });
  return {
    element,
    get focused() { return focused; },
    get selected() { return selected; },
    expireFeedback() { for (const callback of timers.values()) callback(); timers.clear(); },
  };
}

test('initialization overrides a restored slider value and shows level zero', () => {
  const { element } = setup();
  assert.equal(element('#sarcasm').value, '0');
  assert.equal(element('#level-label').textContent, 'Off');
  assert.equal(element('#generator').hidden, false);
  assert.ok(justifications[0].includes(element('#justification').textContent));
});

test('all slider levels update their text and accessible value; Another draws a new reason', () => {
  const { element } = setup();
  const labels = ['Off', 'Subtle', 'Dry', 'Pointed', 'Heavy', 'Fully sarcastic'];
  for (let level = 0; level < 6; level++) {
    element('#sarcasm').value = String(level);
    element('#sarcasm').fire('input');
    const first = element('#justification').textContent;
    assert.ok(justifications[level].includes(first));
    assert.equal(element('#level-label').textContent, labels[level]);
    assert.equal(element('#sarcasm').attributes['aria-valuetext'], `${level} of 5: ${labels[level]}`);
    element('#another').fire('click');
    assert.notEqual(element('#justification').textContent, first);
    assert.ok(justifications[level].includes(element('#justification').textContent));
  }
});

test('copy writes only the visible reason and feedback expires', async () => {
  let copied;
  const app = setup({ writeText: async value => { copied = value; } });
  await app.element('#copy').fire('click');
  assert.equal(copied, app.element('#justification').textContent);
  assert.equal(app.element('#copy-label').textContent, 'Copied!');
  assert.match(app.element('#status').textContent, /Copied to clipboard/);
  app.expireFeedback();
  assert.equal(app.element('#copy-label').textContent, 'Copy justification');
  assert.equal(app.element('#status').textContent, '');
});

test('unavailable or denied clipboard focuses and selects text for manual copying', async () => {
  for (const clipboard of [null, { writeText: async () => { throw new Error('Denied'); } }]) {
    const app = setup(clipboard);
    await app.element('#copy').fire('click');
    assert.equal(app.focused, '#justification');
    assert.equal(app.selected, app.element('#justification'));
    assert.match(app.element('#status').textContent, /Ctrl\+C or ⌘C/);
    assert.equal(app.element('#copy-label').textContent, 'Copy justification');
  }
});

test('a pending copy cannot apply feedback to a different justification', async () => {
  for (const fail of [false, true]) {
    let resolve;
    let reject;
    const app = setup({ writeText: () => new Promise((yes, no) => { resolve = yes; reject = no; }) });
    const pending = app.element('#copy').fire('click');
    app.element('#another').fire('click');
    if (fail) reject(new Error('Denied')); else resolve();
    await pending;
    assert.equal(app.element('#status').textContent, '');
    assert.equal(app.element('#copy-label').textContent, 'Copy justification');
    assert.equal(app.focused, undefined);
  }
});

test('only the newest copy attempt can update feedback', async () => {
  const attempts = [];
  const app = setup({ writeText: () => new Promise((resolve, reject) => attempts.push({ resolve, reject })) });
  const first = app.element('#copy').fire('click');
  const second = app.element('#copy').fire('click');
  attempts[1].resolve();
  await second;
  attempts[0].reject(new Error('Earlier request denied'));
  await first;
  assert.equal(app.element('#copy-label').textContent, 'Copied!');
  assert.equal(app.focused, undefined);
});

test('document keeps scripts, styles and icons local and supplies accessibility hooks', async () => {
  const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(asset.startsWith('./'), asset);
    if (asset !== './') await readFile(new URL(`../site/${asset}`, import.meta.url));
    assert.equal(new URL(asset, 'https://example.com/project/').origin, 'https://example.com');
  }
  assert.match(html, /<noscript>/);
  assert.match(html, /<label for="sarcasm">/);
  assert.match(html, /id="justification"[^>]*aria-live="polite"/);
  assert.match(html, /id="status"[^>]*role="status"/);
  assert.equal((html.match(/id="justification"/g) || []).length, 1);
});
