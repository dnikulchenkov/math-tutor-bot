# Быстрый старт Math Tutor Bot

## Шаг 1: Установка Node.js

Убедитесь, что у вас установлен Node.js версии 18 или выше.

Проверить версию:
```bash
node --version
```

Скачать Node.js: https://nodejs.org/

## Шаг 2: Установка зависимостей

Перейдите в папку проекта и установите зависимости:
```bash
cd "/Users/grizz/Documents/CURSOR TRAINING/1 DAY/projects/math-tutor-bot"
npm install
```

## Шаг 3: Создание бота в Telegram

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота (будет выглядеть примерно так: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 4: Узнайте свой Telegram ID

1. Откройте [@userinfobot](https://t.me/userinfobot) в Telegram
2. Бот автоматически покажет ваш ID
3. Сохраните это число (например: `123456789`)

## Шаг 5: Настройка переменных окружения

Создайте файл `.env` в корне проекта:
```bash
cp math.env .env
```

Откройте файл `.env` и заполните:
```
BOT_TOKEN=ваш_токен_от_BotFather
ADMIN_CHAT_ID=ваш_telegram_id
TZ=Europe/Moscow
```

## Шаг 6: Запуск бота

```bash
npm start
```

Вы должны увидеть сообщение:
```
Bot started (polling)…
Автоматические напоминания активированы (проверка каждый час).
```

## Шаг 7: Тестирование

1. Откройте вашего бота в Telegram (по имени, которое вы дали в BotFather)
2. Отправьте команду `/start`
3. Попробуйте основные команды

## Опционально: Настройка Google Calendar

### 1. Создайте проект в Google Cloud

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект
3. Включите Google Calendar API:
   - API & Services → Library
   - Найдите "Google Calendar API"
   - Нажмите "Enable"

### 2. Создайте Service Account

1. IAM & Admin → Service Accounts
2. Нажмите "Create Service Account"
3. Введите имя (например, "math-tutor-bot")
4. Нажмите "Create and Continue"
5. Пропустите роли (Grant this service account access)
6. Нажмите "Done"

### 3. Создайте ключ

1. Нажмите на созданный Service Account
2. Keys → Add Key → Create new key
3. Выберите JSON
4. Файл скачается автоматически

### 4. Настройте календарь

1. Откройте Google Calendar (https://calendar.google.com)
2. Создайте новый календарь или используйте существующий
3. Настройки календаря → "Поделиться с определенными людьми"
4. Добавьте email вашего Service Account (из JSON файла, поле "client_email")
5. Права: "Внесение изменений в мероприятия"
6. Скопируйте ID календаря (в разделе "Интеграция календаря")

### 5. Обновите .env

Откройте JSON файл с ключом и скопируйте всё его содержимое в одну строку.

Добавьте в `.env`:
```
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_CALENDAR_CREDENTIALS={"type":"service_account","project_id":"...полностью весь JSON..."}
```

⚠️ **Важно:** JSON должен быть в одну строку без переносов!

### 6. Перезапустите бота

```bash
# Остановите бота (Ctrl+C)
npm start
```

Если всё настроено правильно, вы увидите:
```
Google Calendar подключен.
```

## Полезные команды

### Для тестирования

Добавить тестовый слот (замените дату на будущую):
```
/addslot 2025-10-25T15:00:00Z 55
```

Посмотреть все слоты:
```
/listslots
```

Посмотреть статистику:
```
/stats
```

## Деплой на Railway

1. Создайте репозиторий на GitHub
2. Запушьте код:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/ваш-username/math-tutor-bot.git
   git push -u origin main
   ```
3. Перейдите на https://railway.app
4. New Project → Deploy from GitHub
5. Выберите ваш репозиторий
6. В Variables добавьте все переменные из `.env`
7. Дождитесь деплоя

## Решение проблем

### Бот не отвечает
- Проверьте, что `BOT_TOKEN` правильный
- Убедитесь, что бот запущен
- Проверьте логи на ошибки

### Google Calendar не работает
- Проверьте, что Service Account добавлен в календарь
- Убедитесь, что JSON в `.env` корректный (без переносов строк)
- Проверьте логи: должно быть "Google Calendar подключен"

### Напоминания не отправляются
- Убедитесь, что бот запущен непрерывно
- Проверьте часовой пояс (`TZ`)
- Добавьте тестовый слот на завтра и подождите час

## Поддержка

Полная документация: `README.md`
Инструкция для пользователей: `USAGE.md`
История изменений: `CHANGELOG.md`

