const { google } = require('googleapis');

// Google Calendar API настройка
// Используется Service Account для автоматизации
let calendar = null;
let isCalendarEnabled = false;

const initCalendar = () => {
  try {
    const credentials = process.env.GOOGLE_CALENDAR_CREDENTIALS;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!credentials || !calendarId) {
      console.log('Google Calendar не настроен. Пропускаем интеграцию.');
      return false;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    calendar = google.calendar({ version: 'v3', auth });
    isCalendarEnabled = true;
    console.log('Google Calendar подключен.');
    return true;
  } catch (error) {
    console.error('Ошибка инициализации Google Calendar:', error.message);
    return false;
  }
};

const createCalendarEvent = async (slot, userName, userContact) => {
  if (!isCalendarEnabled) return null;

  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    const event = {
      summary: `Занятие по математике - ${userName}`,
      description: `Занятие с ${userName} (${userContact})\nДлительность: 55 минут`,
      start: {
        dateTime: slot.startAt,
        timeZone: process.env.TZ || 'Europe/Moscow',
      },
      end: {
        dateTime: slot.endAt,
        timeZone: process.env.TZ || 'Europe/Moscow',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // За 24 часа
          { method: 'popup', minutes: 60 }, // За час
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    console.log('Событие создано в календаре:', response.data.id);
    return response.data.id; // Возвращаем ID события для последующего удаления
  } catch (error) {
    console.error('Ошибка создания события в календаре:', error.message);
    return null;
  }
};

const deleteCalendarEvent = async (eventId) => {
  if (!isCalendarEnabled || !eventId) return false;

  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    await calendar.events.delete({
      calendarId,
      eventId,
    });

    console.log('Событие удалено из календаря:', eventId);
    return true;
  } catch (error) {
    console.error('Ошибка удаления события из календаря:', error.message);
    return false;
  }
};

module.exports = {
  initCalendar,
  createCalendarEvent,
  deleteCalendarEvent,
  isCalendarEnabled: () => isCalendarEnabled,
};

