const xss = require('xss');

const GiftsService = {
  insertGift(db, newGift) {
    return db('gifts_table')
      .insert(newGift)
      .returning('*')
      .then(([gift]) => gift);
  },

  getGiftById(db, id) {
    return db('gifts_table')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteGiftById(db, id) {
    return db('gifts_table')
      .where ({ id })
      .delete();
  },

  updateGiftById(db, id, newGiftFields) {
    return db('gifts_table')
      .where({ id })
      .update(newGiftFields);
  },

  serializeGift(gift) {
    return {
      id: gift.id,
      event_id: gift.event_id,
      idea: xss(gift.idea),
      notes: xss(gift.notes)
    };
  },

};

module.exports = GiftsService;