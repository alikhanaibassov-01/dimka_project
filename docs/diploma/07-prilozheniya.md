# ПРИЛОЖЕНИЯ

## Приложение А — Руководство пользователя

### А.1 Покупатель

1. Откройте сайт QazMarket.
2. Зарегистрируйтесь: «Войти» → «Регистрация» → email и пароль.
3. Заполните профиль: «Жеке кабинет» → фамилия, имя, телефон → «Сохранить».
4. Выберите товар в каталоге → «В корзину».
5. «Корзина» → «Оформить заказ».
6. Выберите **доставку** (укажите город и адрес) или **самовывоз** (пр. Аль-Фараби, 93).
7. Выберите **Kaspi** или **оплату при получении**.
8. Нажмите «Оформить заказ».
9. При Kaspi — переведите сумму по инструкции на экране или отсканируйте QR.

### А.2 Администратор

1. Откройте `/admin-login.html`.
2. Войдите (email и пароль из настроек Railway).
3. «Добавить товар» — заполните форму, загрузите фото.
4. «Редактировать товары» — изменение или удаление.
5. «Заказы» — подтверждение Kaspi-переводов кнопкой «Оплачено».

---

## Приложение Б — Листинги ключевых фрагментов кода

### Б.1 Схема создания заказа (server/routes/orders.js)

```javascript
const insertOrder = db.prepare(`
  INSERT INTO orders (
    user_id, customer_name, phone, city, address, comment,
    total, status, payment_status, payment_method, delivery_method
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)
`);
```

### Б.2 Хеширование пароля (server/routes/auth.js)

```javascript
const hash = bcrypt.hashSync(password, 10);
db.prepare(
  `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'client')`
).run(normalized, hash, normalized.split('@')[0]);
```

### Б.3 Middleware admin (server/middleware/auth.js)

```javascript
function requireAdmin(req, res, next) {
  if (!req.session?.userId || req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ только для администратора' });
  }
  next();
}
```

### Б.4 Обработка изображения (server/routes/upload.js)

```javascript
await sharp(req.file.buffer)
  .resize(800, 800, { fit: 'cover', position: 'centre' })
  .webp({ quality: 85 })
  .toFile(filepath);
```

### Б.5 i18n (public/js/i18n.js)

```javascript
t(key) {
  return I18n.strings[I18n.lang]?.[key] || I18n.strings.ru?.[key] || key;
}
```

---

## Приложение В — Скриншоты интерфейса

> Вставьте в Word скриншоты с production-сайта. Рекомендуемый список:

| № | Страница | URL |
|---|----------|-----|
| В.1 | Главная | / |
| В.2 | Каталог | /catalog.html |
| В.3 | Карточка товара | /product.html?id=1 |
| В.4 | Корзина | /cart.html |
| В.5 | Checkout — доставка | /checkout.html |
| В.6 | Checkout — самовывоз с картой | /checkout.html |
| В.7 | Успех заказа — Kaspi | /order-success.html?orderId=N |
| В.8 | Личный кабинет | /account.html |
| В.9 | Admin — товары | /manage-products.html |
| В.10 | Admin — заказы | /admin-orders.html |
| В.11 | Переключение языка (EN) | /catalog.html |

**Как сделать скриншоты:** откройте URL в Chrome → Cmd+Shift+4 (macOS) или DevTools → Capture full size screenshot.

---

## Приложение Г — Листинг API (краткий)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | /api/auth/register | — | Регистрация |
| POST | /api/auth/login | — | Вход |
| POST | /api/auth/logout | — | Выход |
| GET | /api/auth/me | — | Текущий пользователь |
| PATCH | /api/auth/profile | client | Профиль |
| GET | /api/categories | — | Категории |
| GET | /api/products | — | Каталог |
| GET | /api/products/:id | — | Товар |
| POST | /api/products | admin | Создать |
| PUT | /api/products/:id | admin | Обновить |
| DELETE | /api/products/:id | admin | Удалить |
| POST | /api/upload | admin | Фото |
| POST | /api/orders | — | Заказ |
| GET | /api/orders/mine | client | Мои заказы |
| GET | /api/orders/admin | admin | Все заказы |
| PATCH | /api/orders/:id/payment | admin | Статус оплаты |
