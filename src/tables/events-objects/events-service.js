const xss = require('xss');

const EventsService = {
  insertEvent(db, newEvent) {
    return db('events_table')
      .insert(newEvent)
      .returning('*')
      .then(([event]) => event);
  },

  getEventById(db, id) {
    return db('events_table')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteEventById(db, id) {
    return db('events_table')
      .where ({ id })
      .delete();
  },

  updateEventById(db, id, newEventFields) {
    return db('events_table')
      .where({ id })
      .update(newEventFields);
  },

  getGiftsByEventId(db, event_id) {
    return db('gifts_table')
      .select('*')
      .where('event_id', event_id);
  },

  serializeEvent(event) {
    return{
      id: event.id,
      giftee_id: event.giftee_id,
      event_type: xss(event.event_type),
      event_date: event.event_date,
      budget: event.budget
    };
  },

  serializeEventGifts(gifts) {
    return gifts.map(gift => {
      return {
        id: gift.id,
        event_id: gift.event_id,
        idea: xss(gift.idea),
        notes: xss(gift.notes)
      };
    });
  }
};

module.exports = EventsService;