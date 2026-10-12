const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('www/theme.css', 'utf8');
const js = fs.readFileSync('www/app.js', 'utf8');

assert.match(html, /<title>SmartSense/);
assert.match(html, /theme\.css/);
assert.match(html, /app\.js/);
assert.match(html, /#542536/i, 'HTML theme color should use Merlot');
assert.match(css, /#542536/i, 'Merlot brand color missing');
assert.match(css, /#AFCBE3/i, 'Powder Blue brand color missing');
assert.match(css, /#F7F4EF/i, 'Alabaster brand color missing');
for (const feature of ['view-overview', 'view-inventory', 'view-sales', 'view-insights', 'view-settings', 'inventoryRows', 'salesRows', 'settingsForm']) {
  assert.ok(html.includes(feature), 'Missing app feature: ' + feature);
}
assert.match(js, /localStorage/, 'Expected local browser persistence');
assert.match(js, /addEventListener/, 'Expected interactive event handlers');
assert.match(js, /export/i, 'Expected data export functionality');
console.log('SmartSense smoke tests passed: app shell, brand palette, core views, persistence and interactions.');
