const express = require('express');
const path = require('path');
const giftsRouter = express.Router();
const jsonBodyParser = express.json();
const GiftsService = require('./gifts-service');
const { requireAuth } = require('../../middleware/auth');

giftsRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const { event_id, idea, notes } = req.body;
    const newGift = {
      event_id,
      idea,
      notes
    };

    return GiftsService.insertGift(
      req.app.get('db'),
      newGift
    )
      .then(gift => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${gift.id}`))
          .json(GiftsService.serializeGift(gift));
      })
      .catch(next);
  });

giftsRouter
  .route('/:gift_id')
  .all(requireAuth)
  .get((req, res, next) => {
    GiftsService.getGiftById(
      req.app.get('db'),
      req.params.gift_id
    )
      .then(gift => {
        res.json(GiftsService.serializeGift(gift));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    GiftsService.deleteGiftById(
      req.app.get('db'),
      req.params.gift_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { notes } = req.body;
    const updatedGift = { notes };
    GiftsService.updateGiftById(
      req.app.get('db'),
      req.params.gift_id,
      updatedGift
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });
module.exports = giftsRouter;