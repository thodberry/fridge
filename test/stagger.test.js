'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

function animationDelay(selector) {
  const start = css.indexOf(selector + ' {');
  assert.notEqual(start, -1, `missing rule: ${selector}`);

  const end = css.indexOf('}', start);
  const rule = css.slice(start, end);
  const match = rule.match(/animation-delay:\s*([^;]+);/);

  assert.ok(match, `missing animation-delay in ${selector}`);
  return match[1];
}

test('gallery images fade in from first to last', () => {
  assert.match(
    html,
    /<main id="gallery"[\s\S]*?<div class="dance-banner">[\s\S]*?<div class="img-wrap">/,
    'the banner fixture must precede the image wrappers'
  );

  const expected = ['0s', '0.2s', '0.4s', '0.6s'];

  expected.forEach((delay, index) => {
    const child = index + 2;
    assert.equal(
      animationDelay(`.gallery.show .img-wrap:nth-child(${child}) img`),
      delay
    );
  });
});
