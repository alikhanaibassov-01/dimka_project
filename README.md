# QazMarket — маркетплейс казахстанского производства

## Возможности

- Пустой каталог — вы сами добавляете товары
- Загрузка фото (авто-обрезка 800×800 px)
- Одинаковые карточки в каталоге
- Оплата Visa / Mastercard через Stripe Checkout
- Двуязычный интерфейс (қазақша / русский)

## Стек

HTML, CSS, Vanilla JS, Tailwind · Node.js, Express · SQLite · multer, sharp, Stripe

## Быстрый старт

```bash
npm install
npm run db:init      # пустая БД + категории
npm run build:css
cp .env.example .env # заполните Stripe ключи
npm run dev
```

Опционально демо-товары: `npm run db:seed`

## Добавление товаров

1. Откройте `/add-product.html`
2. Заполните форму и **загрузите фото**
3. Фото сохраняется в `public/uploads/`, обрезается до 800×800

## Stripe (тестовый режим)

1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys → скопируйте **Secret key** (`sk_test_...`)
3. В `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   BASE_URL=http://localhost:3000
   STRIPE_CURRENCY=kzt
   ```
4. Тестовая карта: `4242 4242 4242 4242`, любая дата и CVC

### Webhook (локально)

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Скопируйте `whsec_...` в `.env` как `STRIPE_WEBHOOK_SECRET`.

Без webhook статус оплаты обновится через `/api/payments/verify/:id` на странице успеха.

## Деплой на Railway

**Почему не Vercel:** SQLite и загрузка файлов требуют постоянного диска. Vercel serverless это не поддерживает без переделки на Postgres + облачное хранилище.

**Railway:**

1. Залейте проект на GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `BASE_URL=https://ваш-домен.up.railway.app`
   - `STRIPE_CURRENCY=kzt`
4. Volume (рекомендуется): mount `/app/data` и `/app/public/uploads`
5. После деплоя: `npm run db:init` через Railway shell (один раз)
6. Stripe Dashboard → Webhooks → URL: `https://ваш-домен/api/payments/webhook`

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/upload` | Загрузка фото |
| POST | `/api/products` | Добавить товар |
| GET | `/api/products` | Каталог |
| POST | `/api/payments/create-session` | Stripe Checkout |
| POST | `/api/payments/webhook` | Подтверждение оплаты |
| GET | `/api/payments/verify/:id` | Проверка статуса заказа |
# dimka_project
