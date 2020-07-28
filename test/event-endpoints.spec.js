const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Events Endpoints', function() {
  let db;

  const {
    testUsers,
    testGiftees,
    testEvents,
    testGifts
  } = helpers.makeFixtures();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /events', () => {
    beforeEach('insert data', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees,
        testEvents
      )
    );

    it('creates an event, responding with 201 and the new event', function() {
      const testGiftee = testGiftees[0];
      const newEvent = {
        giftee_id: testGiftee.id,
        event_type: 'Test new giftee',
        event_date: new Date('2020-06-05'),
        budget: 40
      };
      return supertest(app)
        .post('/events')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
        .send(newEvent)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.event_type).to.eql(newEvent.event_type);
          expect(res.body.event_date).to.eql(newEvent.event_date.toISOString());
          expect(res.body.budget).to.eql(formatter.format(newEvent.budget));
          expect(res.body.giftee_id).to.eql(testGiftee.id);
          expect(res.headers.location).to.eql(`/events/${res.body.id}`);
        })
        .expect(res =>
          db
            .from('events_table')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.event_type).to.eql(newEvent.event_type);
              expect(row.giftee_id).to.eql(testGiftee.id);
            })
        );
    });
  });

  describe('GET /event/:event_id', () => {
    context('Given there are events in the database', () => {
      beforeEach('insert events', () =>
        helpers.seedTables(
          db,
          testUsers,
          testGiftees,
          testEvents
        )
      );

      it('responds with 200 and the correct event', () => {
        const expectedEvents = testEvents;
        expectedEvents.map(event => {
          event.budget = formatter.format(event.budget);
          event.event_date = event.event_date.toISOString();
        });
        const eventId = expectedEvents[0].id;
        return supertest(app)
          .get(`/events/${eventId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
          .expect(200, testEvents[0]);
      });
    });
  });

  describe('DELETE /events/:event_id', () => {
    context('Given there are events in the database', () => {
      beforeEach('insert data', () =>
        helpers.seedTables(
          db,
          testUsers,
          testGiftees,
          testEvents
        )
      );
      it('responds with 204', () => {
        const eventId = testEvents[0].id;
        return supertest(app)
          .delete(`/events/${eventId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
          .expect(204);
      });
    });
  });

  describe('GET /events/:event_id/gifts', () => {
    beforeEach('insert data', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees,
        testEvents,
        testGifts
      )
    );

    it('responds with 200 and the specified comments', () => {
      const eventId = testEvents[0].id;

      const expectedGifts = helpers.makeExpectedGifts(
        testEvents[0], testGifts
      );

      return supertest(app)
        .get(`/events/${eventId}/gifts`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
        .expect(200, expectedGifts);
    });
  });
});