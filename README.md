# 🎓 Math Tutor Bot

<div align="center">

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Telegram](https://img.shields.io/badge/telegram-bot-blue?logo=telegram)
![Google Calendar](https://img.shields.io/badge/Google%20Calendar-integrated-4285F4?logo=googlecalendar)

**Telegram-бот для репетитора по математике с интеграцией Google Calendar**

[Возможности](#возможности) • [Установка](#установка) • [Документация](#документация) • [Деплой](#деплой)

</div>

---

## 📋 Описание

Math Tutor Bot - это полнофункциональный Telegram-бот для репетиторов, который автоматизирует процесс записи на занятия, управления расписанием и коммуникации с учениками.

### ✨ Основные возможности

#### 👨‍🎓 Для учеников
- 📅 Просмотр свободных слотов для записи
- ✅ Онлайн-бронирование занятий
- 📋 Управление своими записями
- ❌ Отмена брони в любое время
- 🔔 Автоматические напоминания за 24 часа до занятия
- ❓ Отправка вопросов репетитору

#### 👨‍🏫 Для репетитора
- 📊 Детальная статистика и аналитика
- 🔔 Уведомления о новых бронях и отменах
- 📅 Автоматическая синхронизация с Google Calendar
- ➕ Удобное управление слотами
- 💬 Получение вопросов от учеников

#### 🤖 Технические особенности
- 🗓️ Полная интеграция с Google Calendar API
- ⏰ Автоматические напоминания через cron
- 🔐 Безопасное хранение credentials
- 📱 Интуитивный интерфейс с inline-кнопками
- 🌍 Поддержка таймзон

---

## 🚀 Установка

### Предварительные требования

- Node.js >= 18.0.0
- Telegram Bot Token (получите у [@BotFather](https://t.me/BotFather))
- Google Service Account (опционально, для Calendar API)

### Быстрый старт

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/dnikulchenkov/math-tutor-bot.git
cd math-tutor-bot
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp math.env .env
```

Отредактируйте `.env`:
```env
BOT_TOKEN=ваш_токен_от_BotFather
ADMIN_CHAT_ID=ваш_telegram_id
TZ=Europe/Moscow

# Опционально: Google Calendar
GOOGLE_CALENDAR_ID=ваш_календарь_id
GOOGLE_CALENDAR_CREDENTIALS={"type":"service_account",...}
```

4. **Запустите бота**
```bash
npm start
```

---

## 📚 Документация

| Документ | Описание |
|----------|----------|
| [README.md](README.md) | Полная документация проекта |
| [QUICKSTART.md](QUICKSTART.md) | Пошаговое руководство по запуску |
| [USAGE.md](USAGE.md) | Инструкция для пользователей |
| [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md) | Настройка Google Calendar |
| [CHANGELOG.md](CHANGELOG.md) | История изменений |

---

## 🎮 Команды бота

### Для всех пользователей
- `/start` - Главное меню
- `/info` - Информация об обучении
- `/prices` - Стоимость занятий
- `/slots` - Свободные слоты
- `/book` - Записаться на занятие
- `/mybookings` - Мои записи
- `/ask` - Задать вопрос
- `/cancel` - Отмена действия

### Для администратора
- `/stats` - Статистика бота
- `/addslot` - Добавить слот
- `/removeslot` - Удалить слот
- `/listslots` - Список всех слотов

---

## 🔧 Технологии

- **Runtime:** Node.js >= 18
- **Bot Framework:** [Telegraf](https://github.com/telegraf/telegraf)
- **Calendar API:** [Google APIs](https://github.com/googleapis/google-api-nodejs-client)
- **Scheduling:** [node-cron](https://github.com/node-cron/node-cron)
- **Environment:** dotenv

---

## 🌐 Деплой

### Railway

1. Создайте аккаунт на [Railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения
4. Деплой запустится автоматически

### Heroku

```bash
heroku create math-tutor-bot
heroku config:set BOT_TOKEN=ваш_токен
heroku config:set ADMIN_CHAT_ID=ваш_id
git push heroku main
```

### VPS / Docker

Инструкции доступны в [README.md](README.md)

---

## 📊 Структура проекта

```
math-tutor-bot/
├── bot.js                    # Основная логика бота
├── data/
│   ├── calendar.js          # Google Calendar интеграция
│   ├── info.js              # Тексты информации
│   └── slots.js             # Управление слотами
├── index.html               # Лендинг проекта
├── styles.css               # Стили лендинга
├── package.json             # Зависимости
├── .env                     # Переменные окружения (не в git)
├── .gitignore              # Игнорируемые файлы
└── docs/
    ├── README.md
    ├── QUICKSTART.md
    ├── USAGE.md
    └── GOOGLE_CALENDAR_SETUP.md
```

---

## 🔐 Безопасность

⚠️ **Важно:**
- Никогда не коммитьте `.env` файл
- Храните Google Service Account credentials в безопасности
- Используйте переменные окружения для деплоя
- Регулярно обновляйте зависимости

---

## 🤝 Вклад в проект

Мы приветствуем ваш вклад! Если у вас есть идеи или вы нашли баг:

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📝 Roadmap

- [ ] База данных (PostgreSQL/MongoDB)
- [ ] Система отзывов
- [ ] Интеграция платежей (ЮKassa, Stripe)
- [ ] Веб-панель администратора
- [ ] Реферальная программа
- [ ] Групповые занятия
- [ ] Экспорт статистики

---

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

---

## 👨‍💻 Автор

**Dmitry Nikulchenkov**

- GitHub: [@dnikulchenkov](https://github.com/dnikulchenkov)
- Telegram: Свяжитесь через Issues

---

## 🙏 Благодарности

- [Telegraf](https://github.com/telegraf/telegraf) - за отличный фреймворк для Telegram ботов
- [Google APIs](https://github.com/googleapis/google-api-nodejs-client) - за Calendar API
- Сообществу разработчиков Telegram ботов

---

<div align="center">

**Если проект оказался полезным - поставьте ⭐**

Made with ❤️ and ☕

</div>

