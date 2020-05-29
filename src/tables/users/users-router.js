const express = require('express');
const path = require('path');

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const UsersService = require('./users-service');

usersRouter
  .route('/register')
  .post(jsonBodyParser, (req, res, next) => {
    const { username, password } = req.body;

    for (const field of ['username', 'password']) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing '${field} in request body`
        });
      }

      const passwordError = UsersService.validatePassword(password);
      if (passwordError) {
        return res.status(400).json({error: passwordError});
      }
    }
    UsersService.hasUserWithUserName(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName) {
          return res.status(400).json({ error: 'Username already taken' });
        }

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              username,
              password: hashedPassword,
              date_created: 'now()'
            };
  
            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user));
              });
          });
      })
      .catch(next);
  });

usersRouter
  .route('/:user_id/giftees')
  .get((req, res, next) => {
    UsersService.getGifteesByUserId(
      req.app.get('db'),
      req.params.user_id
    )
      .then(giftees => {
        res.json(UsersService.serializeGiftee(giftees));
      })
      .catch(next);
  });
module.exports = usersRouter;