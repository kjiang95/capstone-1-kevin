const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', function() {
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

  beforeEach('insert content', () =>
    helpers.seedTables(
      db,
      testUsers,
      testGiftees,
      testEvents,
      testGifts
    )
  );

  const protectedEndpoints = [
    {
      name: 'GET /users/giftees',
      path: '/users/giftees',
      method: supertest(app).get,
    },
    {
      name: 'GET /giftees',
      path: '/giftees',
      method: supertest(app).get,
    },
    {
      name: 'POST /giftees',
      path: '/giftees',
      method: supertest(app).post,
    },
    {
      name: 'GET /giftees/:giftee_id',
      path: '/giftees/:giftee_id',
      method: supertest(app).get,
    },
    {
      name: 'DELETE /giftees/:giftee_id',
      path: '/giftees/:giftee_id',
      method: supertest(app).delete,
    },
    {
      name: 'GET /giftees/:giftee_id/events',
      path: '/giftees/:giftee_id/events',
      method: supertest(app).get,
    },
    {
      name: 'POST /events',
      path: '/events',
      method: supertest(app).post,
    },
    {
      name: 'GET /events/:event_id',
      path: '/events/:event_id',
      method: supertest(app).get,
    },
    {
      name: 'DELETE /events/:event_id',
      path: '/events/:event_id',
      method: supertest(app).delete,
    },
    {
      name: 'GET /events/:event_id/gifts',
      path: '/events/:event_id/gifts',
      method: supertest(app).get,
    },
    {
      name: 'POST /gifts',
      path: '/gifts',
      method: supertest(app).post,
    },
    {
      name: 'GET /gifts/:gift_id',
      path: '/gifts/:gift_id',
      method: supertest(app).get,
    },
    {
      name: 'DELETE /gifts/:gift_id',
      path: '/gifts/:gift_id',
      method: supertest(app).delete,
    },
    {
      name: 'PATCH /gifts/:gift_id',
      path: '/gifts/:gift_id',
      method: supertest(app).patch,
    },
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds 401 \'Missing bearer token\' when no bearer token', () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });

      it('responds 401 \'Unauthorized request\' when invalid JWT secret', () => {
        const validUser = testUsers[0];
        const username = validUser.username;
        const invalidSecret = 'bad-secret';
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, username, invalidSecret))
          .expect(401, { error: 'Unauthorized request' });
      });

      it('responds 401 \'Unauthorized request\' when invalid sub in payload', () => {
        const invalidUser = { user_name: 'user-not-existy', id: 1 };
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser, invalidUser.user_name))
          .expect(401, { error: 'Unauthorized request' });
      });
    });
  });
});