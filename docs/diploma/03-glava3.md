# 3 РЕАЛИЗАЦИЯ ВЕБ-МАРКЕТПЛЕЙСА QAZMARKET

## 3.1 Используемые технологии и средства разработки

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| Frontend | HTML5, Tailwind CSS 3 | Разметка и стили |
| Frontend | Vanilla JavaScript (ES6+) | Логика клиента |
| Backend | Node.js 20+, Express 4 | HTTP-сервер, REST API |
| БД | SQLite, better-sqlite3 | Хранение данных |
| Auth | bcryptjs, express-session | Пароли и сессии |
| Upload | multer, sharp | Загрузка и ресайз фото → WebP 800×800 |
| Deploy | Railway, GitHub | CI/CD и хостинг |
| IDE | Cursor / VS Code | Разработка |

**Структура репозитория:**

```
dimka/
├── data/           # schema.sql, categories.sql, marketplace.db
├── public/         # HTML, JS, CSS, locales, uploads
├── server/         # Express, routes, middleware
├── docs/diploma/   # Текст дипломной работы
└── package.json
```

## 3.2 Реализация серверной части и REST API

Точка входа — `server/index.js`. При старте вызывается `ensureDb()` из `server/setup-db.js`: создаётся БД, выполняются миграции, seed администратора.

```javascript
// server/index.js (фрагмент)
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, ... }));
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use(express.static('public'));
```

Middleware `requireAdmin` (`server/middleware/auth.js`) защищает маршруты создания/изменения/удаления товаров и загрузки фото.

Обработка ошибок централизована в `server/middleware/errorHandler.js`.

## 3.3 Реализация каталога товаров, фильтрации и карточки продукта

**API:** `GET /api/products?category=&region=&q=&minPrice=&maxPrice=&sort=&page=&limit=`

Реализация в `server/routes/products.js`:
- фильтр `deleted = 0` и `in_stock = 1` для публичного каталога;
- поиск по `name_kk`, `name_ru`, `name_en`;
- пагинация (page, limit до 50).

**Клиент:** `public/js/catalog.js` — форма фильтров, сетка карточек через `products-ui.js`. Карточка: фото `object-cover`, название на текущем языке (`productName()` в `api.js`), цена в тенге.

**Страница товара:** `public/product.html` — детальное описание, производитель, регион, кнопка «В корзину».

> **Скриншот для диплома:** каталог с фильтрами и карточками товаров (`/catalog.html`).

## 3.4 Реализация корзины и оформления заказа

**Корзина** хранится в `localStorage` (`public/js/cart.js`):

```javascript
// Структура элемента корзины
{ productId: number, qty: number }
```

**Checkout** (`public/checkout.html`, `public/js/checkout.js`):
- поля: фамилия, имя, телефон (prefill из профиля);
- radio: доставка / самовывоз;
- radio: Kaspi / оплата при получении;
- при самовывозе скрываются поля адреса, показывается карта (`renderPickupMap`).

**Создание заказа:** `POST /api/orders` — транзакция SQLite: insert в `orders` и `order_items`, валидация телефона и наличия товаров.

> **Скриншот:** форма checkout с выбранным самовывозом и картой.

## 3.5 Реализация регистрации, авторизации и личного кабинета

**Регистрация** (`POST /api/auth/register`): email + пароль (min 6 символов), роль `client`.

**Вход** (`POST /api/auth/login`): bcrypt.compareSync, установка `req.session.userId` и `req.session.role`.

**Профиль** (`PATCH /api/auth/profile`, `requireAuth`):

```javascript
// Поля: firstName, lastName, phone
// name = lastName + ' ' + firstName
```

**Личный кабинет** (`public/account.html`): форма профиля + список заказов `GET /api/orders/mine`.

**Админ** создаётся в `server/setup-db.js` из переменных `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

> **Скриншот:** личный кабинет с заполненным профилем и списком заказов.

## 3.6 Реализация административной панели

| Функция | Страница | API |
|---------|----------|-----|
| Список товаров | manage-products.html | GET /api/products?all=1 |
| Добавление | add-product.html | POST /api/products |
| Редактирование | edit-product.html?id= | PUT /api/products/:id |
| Удаление | кнопка в списке | DELETE /api/products/:id |
| Заказы | admin-orders.html | GET /api/orders/admin |
| Подтверждение Kaspi | кнопка «Оплачено» | PATCH /api/orders/:id/payment |

Клиентская защита: `requireAdminUser()` в `auth-pages.js` редиректит на `/admin-login.html` при отсутствии роли admin.

## 3.7 Реализация загрузки и обработки изображений товаров

`POST /api/upload` (`server/routes/upload.js`):

1. multer принимает файл в memory (до 5 MB, JPEG/PNG/WebP);
2. sharp ресайзит до 800×800 px, fit: cover;
3. сохраняет как WebP в `public/uploads/product-{timestamp}.webp`;
4. возвращает `{ imageUrl: "/uploads/..." }`.

Единый размер обеспечивает одинаковые карточки в каталоге (`aspect-square object-cover`).

## 3.8 Реализация оплаты через Kaspi и оплаты при получении

Stripe **не используется** (недоступен в РК). Реализованы:

**Kaspi (`payment_method: 'kaspi'`):**
- `payment_status: 'awaiting_kaspi'`
- на `order-success.html`: номер `KASPI_PHONE`, сумма, комментарий `QazMarket #id`
- QR-код на `https://kaspi.kz` (генерация через api.qrserver.com)
- админ подтверждает оплату → `payment_status: 'paid'`

**COD (`payment_method: 'cod'`):**
- `payment_status: 'cod'`
- сообщение «Оплата при получении»

Код: `server/routes/orders.js`, `public/js/order-success.js`, `public/js/pickup-map.js` (renderKaspiQr).

> **Скриншот:** страница успеха с инструкцией Kaspi и QR.

## 3.9 Реализация самовывоза и отображения точки выдачи на карте

При `delivery_method: 'pickup'`:
- в заказ записывается адрес «пр. Аль-Фараби, 93 (самовывоз)», город «Алматы»;
- на checkout и order-success показывается блок карты (`public/js/pickup-map.js`);
- embed-карта OpenStreetMap с меткой в координатах точки 2GIS;
- кнопка «Открыть в 2GIS» → `https://go.2gis.com/Pr8me`.

Переключение доставка/самовывоз: `toggleDeliveryMode()` в `checkout.js`.

> **Скриншот:** checkout с картой и кнопкой 2GIS.

## 3.10 Развёртывание приложения на платформе Railway

1. Код на GitHub (`dimka_project`)
2. Railway: New Project → Deploy from GitHub
3. Variables: `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `KASPI_PHONE`, `BASE_URL`
4. Start command: `npm start`
5. Volume (рекомендуется): `/app/data`, `/app/public/uploads`

Production URL: `https://dimkaproject-production.up.railway.app`

`ensureDb()` при каждом старте проверяет наличие таблиц и выполняет миграции — не требуется ручной `db:init` на сервере.

## 3.11 Перспективы дальнейшего развития проекта

1. **Kaspi Merchant API** — полноценная интеграция оплаты с webhook
2. **PostgreSQL** — для высокой нагрузки и репликации
3. **Облачное хранилище** (S3, Cloudinary) для фото вместо локального диска
4. **Push-уведомления** и SMS о статусе заказа
5. **Рейтинги и отзывы** на товары
6. **Личный кабинет производителя** — отдельная роль seller
7. **PWA** — установка как приложение на телефон
8. **Интеграция Kazpost / CDEK** для трекинга доставки
