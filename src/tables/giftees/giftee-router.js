const express = require('express');
const path = require('path');
const gifteesRouter = express.Router();
const jsonBodyParser = express.json();
const GifteesService = require('./giftee-service');

gifteesRouter
  .route('/')
  .get(jsonBodyParser, (req, res, next) => {
    const { user_id } = req.body;
    
    return GifteesService.getGiftees(
      req.app.get('db'),
      user_id
    )
      .then(giftees => {
        res.json(GifteesService.serializeGiftee(giftees));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { user_id, full_name, relationship } = req.body;
    const newGiftee = {
      user_id,
      full_name,
      relationship
    };

    return GifteesService.insertGiftee(
      req.app.get('db'),
      newGiftee
    )
      .then(giftee => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${giftee.id}`))
          .json(GifteesService.serializeGiftee(giftee));
      })
      .catch(next);
  });


gifteesRouter
  .route('/:giftee_id')
  .get((req, res, next) => {
    GifteesService.getGifteeById(
      req.app.get('db'),
      req.params.giftee_id
    )
      .then(giftee => {
        res.json(GifteesService.serializeGiftee(giftee));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    GifteesService.deleteGifteeById(
      req.app.get('db'),
      req.params.giftee_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

gifteesRouter
  .route('/:giftee_id/events')
  .get((req, res, next) => {
    GifteesService.getEventsByGifteeId(
      req.app.get('db'),
      req.params.giftee_id
    )
      .then(events => {
        res.json(GifteesService.serializeGifteeEvents(events));
      })
      .catch(next);
  });

module.exports = gifteesRouter;