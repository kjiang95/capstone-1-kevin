const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Giftees Endpoints', function() {
  let db;

  const {
    testUsers,
    testGiftees,
    testEvents,
    testGifts
  } = helpers.makeFixtures();

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

  describe('POST /giftees', () => {
    beforeEach('insert giftees', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees
      )
    );

    it('creates a giftee, responding with 201 and the new giftee', function() {
      const testUser = testUsers[0];
      const newGiftee = {
        full_name: 'Test new giftee',
        relationship: 'Family',
      };
      return supertest(app)
        .post('/giftees')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
        .send(newGiftee)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.full_name).to.eql(newGiftee.full_name);
          expect(res.body.user_id).to.eql(testUser.id);
          expect(res.headers.location).to.eql(`/giftees/${res.body.id}`);
        })
        .expect(res =>
          db
            .from('giftees_table')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.full_name).to.eql(newGiftee.full_name);
              expect(row.user_id).to.eql(testUser.id);
            })
        );
    });
  });

  describe('GET /giftees/:giftee_id', () => {
    context('Given there are giftees in the database', () => {
      beforeEach('insert giftees', () =>
        helpers.seedTables(
          db,
          testUsers,
          testGiftees
        )
      );

      it('responds with 200 and the correct giftee', () => {
        const gifteeId = testGiftees[0].id;
        return supertest(app)
          .get(`/giftees/${gifteeId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
          .expect(200, testGiftees[0]);
      });
    });
  });

  describe('DELETE /giftees/:giftee_id', () => {
    context('Given there are messages in the database', () => {
      beforeEach('insert messages', () =>
        helpers.seedTables(
          db,
          testUsers,
          testGiftees
        )
      );
      it('responds with 204', () => {
        const gifteeId = testGiftees[0].id;
        return supertest(app)
          .delete(`/giftees/${gifteeId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
          .expect(204);
      });
    });
  });

  describe('GET /giftees/:giftee_id/events', () => {
    beforeEach('insert data', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees,
        testEvents
      )
    );

    it('responds with 200 and the specified events', () => {
      const gifteeId = testGiftees[0].id;

      const expectedEvents = helpers.makeExpectedEvents(
        testGiftees[0], testEvents
      );

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      expectedEvents.map(event => {
        event.budget = formatter.format(event.budget);
        event.event_date = event.event_date.toISOString();
      });

      return supertest(app)
        .get(`/giftees/${gifteeId}/events`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
        .expect(200, expectedEvents);
    });
  });
});
