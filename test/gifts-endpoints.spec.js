const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Gifts Endpoints', function() {
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

  describe('POST /gifts', () => {
    beforeEach('insert data', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees,
        testEvents,
        testGifts
      )
    );

    it('creates a gift, responding with 201 and the new gift', function() {
      const testEvent = testEvents[0];
      const newGift = {
        event_id: testEvent.id,
        idea: 'test gift idea',
        notes: 'test gift notes'
      };
      return supertest(app)
        .post('/gifts')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
        .send(newGift)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.idea).to.eql(newGift.idea);
          expect(res.body.notes).to.eql(newGift.notes);
          expect(res.body.event_id).to.eql(testEvent.id);
          expect(res.headers.location).to.eql(`/gifts/${res.body.id}`);
        })
        .expect(res =>
          db
            .from('gifts_table')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.idea).to.eql(newGift.idea);
              expect(row.notes).to.eql(newGift.notes);
              expect(row.event_id).to.eql(testEvent.id);
            })
        );
    });
  });

  describe('GET /gift/:gift_id', () => {
    beforeEach('insert gifts', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees,
        testEvents,
        testGifts
      )
    );

    it('responds with 200 and the correct gift', () => {
      const giftId = testGifts[0].id;
      return supertest(app)
        .get(`/gifts/${giftId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
        .expect(200, testGifts[0]);
    });
  });

  describe('DELETE /gifts/:gift_id', () => {
    context('Given there are gifts in the database', () => {
      beforeEach('insert data', () =>
        helpers.seedTables(
          db,
          testUsers,
          testGiftees,
          testEvents,
          testGifts
        )
      );
      it('responds with 204', () => {
        const giftId = testGifts[0].id;
        return supertest(app)
          .delete(`/gifts/${giftId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
          .expect(204);
      });
    });
  });

  describe('PATCH /gifts/:gift_id', () => {
    context('Given there are messages in the database', () => {
      beforeEach('insert data', () =>
        helpers.seedTables(
          db,
          testUsers,
          testGiftees,
          testEvents,
          testGifts
        )
      );
      it('responds with 201 and patch message', () => {
        const giftId = testGifts[0].id;

        const newGift = {
          notes: 'updated test gift notes'
        };

        return supertest(app)
          .patch(`/gifts/${giftId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], testUsers[0].username))
          .send(newGift)
          .expect(204);
      });
    });
  });
});