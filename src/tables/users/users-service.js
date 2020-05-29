const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');

const xss = require('xss');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  hasUserWithUserName(db, username) {
    return db('users_table')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users_table')
      .returning('*')
      .then(([user]) => user);
  },

  validatePassword(password) {
    if (password.length < 8 || password.length > 72) {
      return 'Password must be between 8 and 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain at least 1 upper case, 1 lower case, 1 number, and 1 special character'
    }
    return null;
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  getGifteesByUserId(db, user_id) {
    return db('giftees_table')
      .select('*')
      .where('user_id', user_id);
  },

  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
      date_created: new Date(user.date_created)
    };
  },

  serializeGiftee(giftees) {
    return giftees.map(giftee => {
      return {
        id: giftee.id,
        user_id: giftee.user_id,
        full_name: xss(giftee.full_name),
        relationship: giftee.relationship
      };
    });
  },
};

module.exports = UsersService;