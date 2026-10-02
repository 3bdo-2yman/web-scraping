const { chromium } = require('playwright');

const BASE = 'https://example.odoo.com';
const LOGIN = 'your_email';
const PASSWORD = 'your_password';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 1) تسجيل الدخول (زي ما كان)
  await page.goto(`${BASE}/web/login`);
  await page.fill('input[name="login"]', LOGIN);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/odoo/);

  // 2) نطلب المنتجات من Odoo مباشرة
  const res = await page.request.post(
    `${BASE}/web/dataset/call_kw/product.template/search_read`,
    {
      data: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'product.template',
          method: 'search_read',
          args: [[]],
          kwargs: {
            fields: ['name', 'list_price', 'qty_available'],
            limit: 0,
          },
        },
      },
    }
  );

  const data = await res.json();

  if (data.error) {
    throw new Error(JSON.stringify(data.error));
  }

  console.log(data.result);
  await browser.close();
})();
