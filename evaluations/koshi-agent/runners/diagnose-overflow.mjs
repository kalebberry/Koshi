import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { buildTestPage } from './test-harness.mjs';

const trialHtml = `<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <figure kos-col-span="7" kos-ratio="16/9" style="background:#e0deda;min-height:200px;margin:0;" id="fig">
      <img src="/visual.webp" alt="Visual" />
    </figure>
    <header kos-col-span="5" style="padding:1.5rem;background:#fdfdfc;" id="hdr">
      <h2>Form Follows Proportion</h2>
      <p>Deriving modern interface harmony from classical lattice geometry.</p>
    </header>
  </div>
</section>`;

const fullHtml = buildTestPage({ html: trialHtml, condition: 'C', containerWidth: 360 });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fullHtml);
});
await new Promise(r => server.listen(4397, '127.0.0.1', r));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 400, height: 800 });
await page.goto('http://127.0.0.1:4397/');

const details = await page.evaluate(() => {
  return {
    bodyScrollWidth: document.body.scrollWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
});

console.log('With margin: 0 on figure:', details);

await browser.close();
server.close();
