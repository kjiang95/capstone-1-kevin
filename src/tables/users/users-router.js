const express = require('express');
const path = require('path');
const { requireAuth } = require('../../middleware/auth');

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const UsersService = require('./users-service');

usersRouter
  .route('/login')
  .post(jsonBodyParser, (req, res, next) =>{
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };

    for (const [key, value] of Object.entries(loginUser)) {
      if (value === null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body` 
        });
      }
    }

    UsersService.getUserByUserName(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbUser => {
        if (!dbUser)
          return res.status(400).json({
            error: 'Incorrect username or password'
          });

        return UsersService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch) {
              return res.status(400).json({
                error: 'Incorrect username or password'
              });
            }

            const sub = dbUser.username;
            const payload = { user_id: dbUser.id };

            res.send({
              authToken: UsersService.creatJwt(sub, payload)
            });
          });
      })
      .catch(next);
  });

usersRouter
  .route('/register')
  .post(jsonBodyParser, (req, res, next) => {
    const { username, password } = req.body;
    const registerUser = {username, password};

    for (const [key, value] of Object.entries(registerUser)) {
      if (value === null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body` 
        });
      }
    }
    const passwordError = UsersService.validatePassword(registerUser.password);
    if (passwordError) {
      return res.status(400).json({error: passwordError});
    }
    UsersService.hasUserWithUserName(
      req.app.get('db'),
      registerUser.username
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
  .route('/giftees')
  .all(requireAuth)
  .get((req, res, next) => {
    const user_id = req.user.id;
    UsersService.getGifteesByUserId(
      req.app.get('db'),
      user_id
    )
      .then(giftees => {
        if (!giftees) {
          return [];
        }
        res.json(UsersService.serializeGiftee(giftees));
      })
      .catch(next);
  });
module.exports = usersRouter;