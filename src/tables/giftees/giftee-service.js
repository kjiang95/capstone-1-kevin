const xss = require('xss');

const GifteesService = {
  getGiftees(db, userId) {
    return db('giftees_table')
      .select('*')
      .where('user_id', userId);
  },

  insertGiftee(db, newGiftee) {
    return db('giftees_table')
      .insert(newGiftee)
      .returning('*')
      .then(([giftee]) => giftee);
  },

  getGifteeById(db, id) {
    return db('giftees_table')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteGifteeById(db, id) {
    return db('giftees_table')
      .where ({ id })
      .delete();
  },

  updateGifteeById(db, id, newGifteeFields) {
    return db('giftees_table')
      .where({ id })
      .update(newGifteeFields);
  },

  getEventsByGifteeId(db, giftee_id) {
    return db('events_table')
      .select('*')
      .where('giftee_id', giftee_id);
  },

  serializeGiftee(giftee) {
    return{
      id: giftee.id,
      user_id: giftee.user_id,
      full_name: xss(giftee.full_name),
      relationship: giftee.relationship
    };
  },

  serializeGifteeEvents(events) {
    return events.map(event => {
      return {
        id: event.id,
        giftee_id: event.giftee_id,
        event_type: xss(event.event_type),
        event_date: event.event_date,
        budget: event.budget
      };
    });
  }
};

module.exports = GifteesService;