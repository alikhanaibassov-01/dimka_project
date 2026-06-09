# QazMarket — маркетплейс казахстанского производства

## Возможности

- Пустой каталог — вы сами добавляете товары
- Загрузка фото (авто-обрезка 800×800 px)
- Оплата **Kaspi** (перевод) и **при получении** — реалистично для Казахстана
- Три языка: қазақша / русский / English
- Регистрация покупателей и отдельный вход администратора
- Управление товарами: добавление, редактирование, удаление

## Стек

HTML, CSS, Vanilla JS, Tailwind · Node.js, Express · SQLite · bcrypt, express-session

## Быстрый старт

```bash
npm install
npm run build:css
cp .env.example .env
npm run dev          # БД создаётся автоматически при старте
```

Полный сброс БД: `npm run db:init`. Опционально демо-товары: `npm run db:seed`

## Вход

| Роль | URL | По умолчанию |
|------|-----|--------------|
| Покупатель | `/register.html`, `/login.html` | регистрация свободная |
| Админ | `/admin-login.html` | `admin@qazmarket.kz` / `admin123` |

Смените `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `.env` на Railway.

## Оплата (Kaspi + COD)

Stripe в Казахстане недоступен для merchant-аккаунтов. Вместо этого:

1. **Kaspi** — после заказа показывается номер для перевода и комментарий `QazMarket #123`
2. **При получении** — оплата курьеру

Настройте в `.env`:

```
KASPI_PHONE=+77001234567
KASPI_RECIPIENT=QazMarket
```

Админ подтверждает Kaspi-переводы на `/admin-orders.html`.

## Деплой на Railway

1. Залейте проект на GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Variables: `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `KASPI_PHONE`, `BASE_URL`
4. Volume: `/app/data` и `/app/public/uploads`

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация клиента |
| POST | `/api/auth/login` | Вход |
| POST | `/api/orders` | Оформить заказ |
| GET | `/api/orders/mine` | Мои заказы (клиент) |
| GET | `/api/orders/admin` | Все заказы (админ) |
| DELETE | `/api/products/:id` | Удалить товар (админ) |
