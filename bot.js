require('dotenv').config();

const { Telegraf, Markup, session } = require('telegraf');
const cron = require('node-cron');
const { infoText, pricesText } = require('./data/info.js');
const {
  getAvailableSlots,
  reserveSlot,
  addSlot,
  removeSlot,
  listAllSlots,
  getUserBookings,
  cancelBooking,
  getUpcomingBookings,
  getAllBookedSlots,
} = require('./data/slots.js');
const {
  initCalendar,
  createCalendarEvent,
  deleteCalendarEvent,
  isCalendarEnabled,
} = require('./data/calendar.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  // Явная ошибка при отсутствии токена
  console.error('BOT_TOKEN не задан. Установите переменную окружения BOT_TOKEN.');
  process.exit(1);
}

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID ? Number(process.env.ADMIN_CHAT_ID) : undefined;
const TIMEZONE = process.env.TZ || 'Europe/Moscow';

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

// Инициализация Google Calendar
initCalendar();

// Резервная in-memory сессия на случай, если стандартная session() недоступна на некоторых типах апдейтов
const inMemorySessions = new Map();
bot.use(async (ctx, next) => {
  if (ctx.session === undefined) {
    const key = (ctx.chat && ctx.chat.id) || (ctx.from && ctx.from.id);
    if (key) {
      if (!inMemorySessions.has(key)) inMemorySessions.set(key, {});
      ctx.session = inMemorySessions.get(key);
      await next();
      inMemorySessions.set(key, ctx.session || {});
      return;
    }
  }
  return next();
});

const toLocalTimeString = (isoString) => {
  return new Date(isoString).toLocaleString('ru-RU', {
    timeZone: TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildMainMenu = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('ℹ️ Обучение', 'INFO')],
    [Markup.button.callback('💰 Стоимость', 'PRICES')],
    [Markup.button.callback('📅 Свободные даты', 'SLOTS')],
    [Markup.button.callback('📝 Записаться', 'BOOK')],
    [Markup.button.callback('📋 Мои записи', 'MYBOOKINGS')],
    [Markup.button.callback('❓ Задать вопрос', 'ASK')],
  ]);

const sendSlotsList = async (ctx) => {
  const available = getAvailableSlots();
  if (available.length === 0) {
    return ctx.reply('Свободных слотов пока нет. Напишите /ask для индивидуальной договоренности.');
  }
  const lines = available.map((s) => `• ${toLocalTimeString(s.startAt)} — свободно`);
  return ctx.reply(`Ближайшие слоты (время: ${TIMEZONE}):\n\n${lines.join('\n')}`);
};

const sendBookingKeyboard = async (ctx) => {
  const available = getAvailableSlots();
  if (available.length === 0) {
    return ctx.reply('Свободных слотов нет. Попробуйте позже или задайте вопрос через /ask.');
  }
  const keyboard = available.map((s) => [
    Markup.button.callback(`${toLocalTimeString(s.startAt)}`, `BOOK_SLOT:${s.id}`),
  ]);
  return ctx.reply('Выберите слот:', Markup.inlineKeyboard(keyboard));
};

bot.telegram.setMyCommands([
  { command: 'start', description: 'Главное меню' },
  { command: 'info', description: 'Информация об обучении' },
  { command: 'prices', description: 'Стоимость занятий' },
  { command: 'slots', description: 'Свободные даты' },
  { command: 'book', description: 'Записаться на занятие' },
  { command: 'mybookings', description: 'Мои записи' },
  { command: 'ask', description: 'Задать вопрос репетитору' },
  { command: 'stats', description: 'Статистика (только админ)' },
  { command: 'cancel', description: 'Отмена текущего действия' },
]).catch(() => {});

bot.start(async (ctx) => {
  await ctx.reply(
    'Привет! Я бот-ассистент репетитора по математике. Чем помочь?',
    buildMainMenu()
  );
});

bot.command('info', async (ctx) => {
  await ctx.reply(infoText, buildMainMenu());
});

bot.command('prices', async (ctx) => {
  await ctx.reply(pricesText, buildMainMenu());
});

bot.command('slots', async (ctx) => {
  await sendSlotsList(ctx);
});

bot.command('book', async (ctx) => {
  await sendBookingKeyboard(ctx);
});

bot.command('ask', async (ctx) => {
  ctx.session.mode = 'awaiting_question';
  await ctx.reply('Напишите ваш вопрос одним сообщением. Для отмены — /cancel');
});

bot.command('cancel', async (ctx) => {
  ctx.session.mode = undefined;
  await ctx.reply('Отменено.', buildMainMenu());
});

bot.command('mybookings', async (ctx) => {
  const bookings = getUserBookings(ctx.from.id);
  if (bookings.length === 0) {
    return ctx.reply('У вас пока нет активных записей.', buildMainMenu());
  }

  const keyboard = bookings.map((b) => [
    Markup.button.callback(
      `${toLocalTimeString(b.startAt)} - Отменить ❌`,
      `CANCEL_BOOKING:${b.id}`
    ),
  ]);
  
  await ctx.reply(
    'Ваши записи:\n\n' + 
    bookings.map((b) => `• ${toLocalTimeString(b.startAt)}`).join('\n'),
    Markup.inlineKeyboard(keyboard)
  );
});

bot.command('stats', async (ctx) => {
  // Проверяем, что это админ
  if (!ADMIN_CHAT_ID || ctx.from.id !== ADMIN_CHAT_ID) {
    return ctx.reply('У вас нет доступа к этой команде.');
  }

  const allSlots = listAllSlots();
  const bookedSlots = getAllBookedSlots();
  const availableSlots = getAvailableSlots();
  
  // Подсчет уникальных пользователей
  const uniqueUsers = new Set(bookedSlots.map((s) => s.bookedBy));
  
  // Подсчет прошедших и будущих занятий
  const now = new Date();
  const pastBookings = bookedSlots.filter((s) => new Date(s.startAt) < now);
  const futureBookings = bookedSlots.filter((s) => new Date(s.startAt) >= now);

  const statsMessage = 
    `📊 Статистика бота\n\n` +
    `👥 Уникальных пользователей: ${uniqueUsers.size}\n` +
    `📅 Всего слотов: ${allSlots.length}\n` +
    `✅ Забронировано: ${bookedSlots.length}\n` +
    `🆓 Свободно: ${availableSlots.length}\n\n` +
    `⏮ Прошедших занятий: ${pastBookings.length}\n` +
    `⏭ Предстоящих занятий: ${futureBookings.length}\n\n` +
    `🔗 Google Calendar: ${isCalendarEnabled() ? 'Подключен ✅' : 'Не подключен ❌'}`;

  await ctx.reply(statsMessage);
});

bot.action('INFO', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  await ctx.reply(infoText, buildMainMenu());
});

bot.action('PRICES', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  await ctx.reply(pricesText, buildMainMenu());
});

bot.action('SLOTS', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  await sendSlotsList(ctx);
});

bot.action('BOOK', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  await sendBookingKeyboard(ctx);
});

bot.action('ASK', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  ctx.session.mode = 'awaiting_question';
  await ctx.reply('Напишите ваш вопрос одним сообщением. Для отмены — /cancel');
});

bot.action('MYBOOKINGS', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const bookings = getUserBookings(ctx.from.id);
  if (bookings.length === 0) {
    return ctx.reply('У вас пока нет активных записей.', buildMainMenu());
  }

  const keyboard = bookings.map((b) => [
    Markup.button.callback(
      `${toLocalTimeString(b.startAt)} - Отменить ❌`,
      `CANCEL_BOOKING:${b.id}`
    ),
  ]);
  
  await ctx.reply(
    'Ваши записи:\n\n' + 
    bookings.map((b) => `• ${toLocalTimeString(b.startAt)}`).join('\n'),
    Markup.inlineKeyboard(keyboard)
  );
});

bot.action(/BOOK_SLOT:(.+)/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const slotId = ctx.match[1];
  const user = ctx.from;
  const userName = user.first_name || 'Пользователь';
  const userContact = user.username ? `@${user.username}` : `ID: ${user.id}`;

  // Создаем событие в Google Calendar (если настроено)
  let calendarEventId = undefined;
  if (isCalendarEnabled()) {
    const slotForCalendar = getAvailableSlots().find((s) => s.id === slotId);
    if (slotForCalendar) {
      calendarEventId = await createCalendarEvent(slotForCalendar, userName, userContact);
    }
  }

  const booked = reserveSlot(slotId, user.id, userName, userContact, calendarEventId);
  if (!booked) {
    // Если не удалось забронировать, удаляем событие из календаря
    if (calendarEventId) {
      await deleteCalendarEvent(calendarEventId);
    }
    return ctx.reply('Увы, этот слот уже недоступен. Попробуйте другой.');
  }

  const adminMessage =
    `✅ Новая бронь:\n` +
    `Пользователь: ${userName} ${userContact}\n` +
    `Слот: ${toLocalTimeString(booked.startAt)}` +
    (calendarEventId ? '\n📅 Добавлено в календарь' : '');
  
  if (ADMIN_CHAT_ID) {
    await ctx.telegram.sendMessage(ADMIN_CHAT_ID, adminMessage).catch(() => {});
  }
  
  await ctx.reply(
    `✅ Готово! Вы записаны на ${toLocalTimeString(booked.startAt)}.\n\n` +
    `Я пришлю напоминание за день до занятия.`
  );
});

bot.action(/CANCEL_BOOKING:(.+)/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const slotId = ctx.match[1];
  const result = cancelBooking(slotId, ctx.from.id);
  
  if (!result) {
    return ctx.reply('Не удалось отменить бронь. Возможно, она уже была отменена.');
  }

  // Удаляем событие из Google Calendar
  if (result.calendarEventId) {
    await deleteCalendarEvent(result.calendarEventId);
  }

  // Уведомляем админа
  if (ADMIN_CHAT_ID) {
    const adminMessage =
      `❌ Отмена брони:\n` +
      `Пользователь: ${result.slot.userName} ${result.slot.userContact}\n` +
      `Слот: ${toLocalTimeString(result.slot.startAt)}`;
    await ctx.telegram.sendMessage(ADMIN_CHAT_ID, adminMessage).catch(() => {});
  }

  await ctx.reply(
    `❌ Бронь отменена: ${toLocalTimeString(result.slot.startAt)}\n\n` +
    `Слот снова доступен для записи.`,
    buildMainMenu()
  );
});

bot.on('text', async (ctx) => {
  if (ctx.session.mode !== 'awaiting_question') return;
  const user = ctx.from;
  const messageForAdmin =
    `Вопрос от ${user.first_name || ''} @${user.username || ''} (id: ${user.id}):\n\n${ctx.message.text}`;
  if (ADMIN_CHAT_ID) {
    await ctx.telegram.sendMessage(ADMIN_CHAT_ID, messageForAdmin).catch(() => {});
  }
  ctx.session.mode = undefined;
  await ctx.reply('Спасибо! Ваш вопрос отправлен. Ответ поступит в личные сообщения.', buildMainMenu());
});

// Примитивные админ-команды (опционально). Доступ без проверки — аккуратно.
bot.command('addslot', async (ctx) => {
  // Формат: /addslot 2025-10-25T12:00:00Z 55
  const parts = ctx.message.text.split(/\s+/);
  const iso = parts[1];
  const duration = Number(parts[2] || 55);
  if (!iso) return ctx.reply('Использование: /addslot 2025-10-25T12:00:00Z 55');
  const created = addSlot(iso, duration);
  if (!created) return ctx.reply('Не удалось добавить слот. Проверьте формат даты.');
  await ctx.reply(`Слот добавлен: ${toLocalTimeString(created.startAt)} (${duration} мин)`);
});

bot.command('removeslot', async (ctx) => {
  // Формат: /removeslot s1
  const parts = ctx.message.text.split(/\s+/);
  const id = parts[1];
  if (!id) return ctx.reply('Использование: /removeslot <slotId>');
  const ok = removeSlot(id);
  await ctx.reply(ok ? 'Слот удалён.' : 'Слот не найден.');
});

bot.command('listslots', async (ctx) => {
  const all = listAllSlots();
  if (all.length === 0) return ctx.reply('Слотов нет.');
  const lines = all.map((s) => `• ${s.id}: ${toLocalTimeString(s.startAt)} — ${s.isBooked ? 'занят' : 'свободен'}`);
  await ctx.reply(lines.join('\n'));
});

// Автоматические напоминания за день до занятия
// Запускается каждый час
cron.schedule('0 * * * *', async () => {
  console.log('Проверка напоминаний...');
  const upcomingBookings = getUpcomingBookings(24);
  
  for (const booking of upcomingBookings) {
    if (!booking.bookedBy) continue;
    
    const reminderMessage =
      `🔔 Напоминание!\n\n` +
      `Завтра у вас занятие по математике:\n` +
      `📅 ${toLocalTimeString(booking.startAt)}\n\n` +
      `Не забудьте подготовить вопросы и материалы. До встречи!`;
    
    try {
      await bot.telegram.sendMessage(booking.bookedBy, reminderMessage);
      console.log(`Напоминание отправлено пользователю ${booking.bookedBy}`);
    } catch (error) {
      console.error(`Ошибка отправки напоминания пользователю ${booking.bookedBy}:`, error.message);
    }
  }
});

bot.launch({ dropPendingUpdates: true }).then(() => {
  console.log('Bot started (polling)…');
  console.log('Автоматические напоминания активированы (проверка каждый час).');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


