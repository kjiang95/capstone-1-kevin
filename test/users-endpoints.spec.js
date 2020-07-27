const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function() {
  let db;

  const {
    testUsers,
    testGiftees
  } = helpers.makeFixtures();

  const testUser = testUsers[0];

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

  describe('POST /users/login', () => {
    beforeEach('insert users', () =>
      helpers.seedTables(
        db,
        testUsers,
        testGiftees
      )
    );

    const requiredFields = ['user_name', 'password'];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.username,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        loginAttemptBody[field] = null;

        return supertest(app)
          .post('/users/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it('responds 400 \'invalid username or password\' when bad username', () => {
      const userInvalidUser = { user_name: 'user-not', password: 'existy' };
      return supertest(app)
        .post('/users/login')
        .send(userInvalidUser)
        .expect(400, { error: 'Incorrect username or password' });
    });

    it('responds 400 \'invalid username or password\' when bad password', () => {
      const userInvalidPass = { user_name: testUser.username, password: 'incorrect' };
      return supertest(app)
        .post('/users/login')
        .send(userInvalidPass)
        .expect(400, { error: 'Incorrect username or password' });
    });

    it('responds 200 and JWT auth token using secret when valid credentials', () => {
      const userValidCreds = {
        user_name: testUser.username,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          algorithm: 'HS256',
        }
      );
      return supertest(app)
        .post('/users/login')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });

  describe('POST /users/register', () => {
    context('User Validation', () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      );

      const requiredFields = ['username', 'password'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test user_name',
          password: 'test password'
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          registerAttemptBody[field] = null;

          return supertest(app)
            .post('/users/register')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            });
        });
      });

      it('responds 400 \'Password must be between 8 and 72 characters\' when empty password', () => {
        const userShortPassword = {
          user_name: 'test user_name',
          password: '1234567'
        };
        return supertest(app)
          .post('/users/register')
          .send(userShortPassword)
          .expect(400, { error: 'Password must be between 8 and 72 characters' });
      });

      it('responds 400 \'Password must be between 8 and 72 characters\' when long password', () => {
        const userLongPassword = {
          user_name: 'test user_name',
          password: '*'.repeat(73),
        };
        return supertest(app)
          .post('/users/register')
          .send(userLongPassword)
          .expect(400, { error: 'Password must be between 8 and 72 characters' });
      });

      it('responds 400 error when password starts with spaces', () => {
        const userPasswordStartsSpaces = {
          user_name: 'test user_name',
          password: ' 1Aa!2Bb@'
        };
        return supertest(app)
          .post('/users/register')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password ends with spaces', () => {
        const userPasswordEndsSpaces = {
          user_name: 'test user_name',
          password: '1Aa!2Bb@ ',
        };
        return supertest(app)
          .post('/users/register')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password isn\'t complex enough', () => {
        const userPasswordNotComplex = {
          username: 'test user_name',
          password: '11AAaabb'
        };
        return supertest(app)
          .post('/users/register')
          .send(userPasswordNotComplex)
          .expect(400, { error: 'Password must contain at least 1 upper case, 1 lower case, 1 number, and 1 special character' });
      });

      it('responds 400 \'User name already taken\' when user_name isn\'t unique', () => {
        const duplicateUser = {
          username: testUser.username,
          password: '11AAaa!!'
        };
        return supertest(app)
          .post('/users/register')
          .send(duplicateUser)
          .expect(400, { error: 'Username already taken' });
      });
    });

    context('Happy path', () => {
      it('responds 201, serialized user, storing bcryped password', () => {
        const newUser = {
          username: 'test user_name',
          password: '11AAaa!!'
        };
        return supertest(app)
          .post('/users/register')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/users/register/${res.body.id}`);
            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from('users_table')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.user_name).to.eql(newUser.user_name);
                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});