const { randomUUID } = require('crypto');

// Демо-хранилище слотов в памяти. В проде замените на БД.
const minutesFrom = (iso, minutes) => new Date(new Date(iso).getTime() + minutes * 60000).toISOString();

let slots = [
  { 
    id: 's1', 
    startAt: '2025-10-22T15:00:00Z', 
    endAt: '2025-10-22T15:55:00Z', 
    isBooked: false, 
    bookedBy: undefined,
    userName: undefined,
    userContact: undefined,
    calendarEventId: undefined,
  },
  { 
    id: 's2', 
    startAt: '2025-10-23T14:00:00Z', 
    endAt: '2025-10-23T14:55:00Z', 
    isBooked: false, 
    bookedBy: undefined,
    userName: undefined,
    userContact: undefined,
    calendarEventId: undefined,
  },
];

const getAvailableSlots = () => slots.filter((s) => !s.isBooked);

const listAllSlots = () => [...slots];

const addSlot = (startIso, durationMinutes = 55) => {
  try {
    const startAt = new Date(startIso).toISOString();
    const endAt = minutesFrom(startAt, durationMinutes);
    const newSlot = { 
      id: randomUUID(), 
      startAt, 
      endAt, 
      isBooked: false, 
      bookedBy: undefined,
      userName: undefined,
      userContact: undefined,
      calendarEventId: undefined,
    };
    slots.push(newSlot);
    return newSlot;
  } catch (e) {
    return undefined;
  }
};

const removeSlot = (id) => {
  const idx = slots.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  slots.splice(idx, 1);
  return true;
};

const reserveSlot = (id, userId, userName, userContact, calendarEventId = undefined) => {
  const slot = slots.find((s) => s.id === id && !s.isBooked);
  if (!slot) return undefined;
  slot.isBooked = true;
  slot.bookedBy = userId;
  slot.userName = userName;
  slot.userContact = userContact;
  slot.calendarEventId = calendarEventId;
  return { ...slot };
};

const getUserBookings = (userId) => {
  return slots.filter((s) => s.isBooked && s.bookedBy === userId);
};

const cancelBooking = (slotId, userId) => {
  const slot = slots.find((s) => s.id === slotId && s.isBooked && s.bookedBy === userId);
  if (!slot) return undefined;
  
  const cancelledSlot = { ...slot };
  slot.isBooked = false;
  slot.bookedBy = undefined;
  slot.userName = undefined;
  slot.userContact = undefined;
  const eventId = slot.calendarEventId;
  slot.calendarEventId = undefined;
  
  return { slot: cancelledSlot, calendarEventId: eventId };
};

const getUpcomingBookings = (hoursAhead = 24) => {
  const now = new Date();
  const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  const targetTimePlus1Hour = new Date(targetTime.getTime() + 60 * 60 * 1000);
  
  return slots.filter((s) => {
    if (!s.isBooked) return false;
    const slotTime = new Date(s.startAt);
    return slotTime >= targetTime && slotTime <= targetTimePlus1Hour;
  });
};

const getAllBookedSlots = () => {
  return slots.filter((s) => s.isBooked);
};

module.exports = {
  getAvailableSlots,
  reserveSlot,
  addSlot,
  removeSlot,
  listAllSlots,
  getUserBookings,
  cancelBooking,
  getUpcomingBookings,
  getAllBookedSlots,
};




