const path = require('path');
const express = require('express');
const eventRouter = express.Router();
const jsonBodyParser = express.json();
const EventsService = require('./events-service');

eventRouter
  .route('/')
  .post(jsonBodyParser, (req, res, next) => {
    const { giftee_id, event_type, event_date, budget } = req.body;
    const newEvent = {
      giftee_id,
      event_type,
      event_date,
      budget
    };

    EventsService.insertEvent(
      req.app.get('db'),
      newEvent
    )
      .then(event => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${event.id}`))
          .json(EventsService.serializeEvent(event));
      })
      .catch(next);
  });

eventRouter
  .route('/:event_id')
  .get((req, res, next) => {
    EventsService.getEventById(
      req.app.get('db'),
      req.params.event_id
    )
      .then(event => {
        res.json(EventsService.serializeEvent(event));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    EventsService.deleteEventById(
      req.app.get('db'),
      req.params.event_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

eventRouter
  .route('/:event_id/gifts')
  .get((req, res, next) => {
    EventsService.getGiftsByEventId(
      req.app.get('db'),
      req.params.event_id
    )
      .then(gifts => {
        res.json(EventsService.serializeEventGifts(gifts));
      })
      .catch(next);
  });


module.exports = eventRouter;