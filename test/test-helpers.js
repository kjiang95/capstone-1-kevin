const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeGifteesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      full_name: 'giftee-one',
      relationship: 'Friend'
    },
    {
      id: 2,
      user_id: users[1].id,
      full_name: 'giftee-two',
      relationship: 'Family'
    },
    {
      id: 3,
      user_id: users[2].id,
      full_name: 'giftee-three',
      relationship: 'Coworker'
    },
    {
      id: 4,
      user_id: users[3].id,
      full_name: 'giftee-four',
      relationship: 'Friend'
    },
  ]
}

function makeEventsArray(giftees) {
  return [
    {
      id: 1,
      giftee_id: giftees[0].id,
      event_type: 'Christmas',
      event_date: new Date('2020-06-05'),
      budget: 40.00
    },
    {
      id: 2,
      giftee_id: giftees[1].id,
      event_type: 'Birthday',
      event_date: new Date('2020-07-06'),
      budget: 50.00
    },
    {
      id: 3,
      giftee_id: giftees[2].id,
      event_type: 'Anniversary',
      event_date: new Date('2020-08-07'),
      budget: 60.00
    },
    {
      id: 4,
      giftee_id: giftees[3].id,
      event_type: 'Graduation',
      event_date: new Date('2020-09-08'),
      budget: 70.00
    },
    {
      id: 5,
      giftee_id: giftees[0].id,
      event_type: 'Wedding',
      event_date: new Date('2020-10-09'),
      budget: 80.00
    },
    {
      id: 6,
      giftee_id: giftees[1].id,
      event_type: 'Bat Mitzvah',
      event_date: new Date('2020-11-10'),
      budget: 90.00
    },
    {
      id: 7,
      giftee_id: giftees[2].id,
      event_type: 'Baby Shower',
      event_date: new Date('2020-12-11'),
      budget: 100.00
    },
  ];
}

function makeGiftsArray(events) {
  return [
    {
      id: 1,
      event_id: events[0].id,
      idea: 'idea-1',
      notes: 'notes for idea 1'
    },
    {
      id: 2,
      event_id: events[1].id,
      idea: 'idea-2',
      notes: 'notes for idea 2'
    },
    {
      id: 3,
      event_id: events[2].id,
      idea: 'idea-3',
      notes: 'notes for idea 3'
    },
    {
      id: 4,
      event_id: events[3].id,
      idea: 'idea-4',
      notes: 'notes for idea 4'
    },
    {
      id: 5,
      event_id: events[4].id,
      idea: 'idea-5',
      notes: 'notes for idea 5'
    },
    {
      id: 6,
      event_id: events[5].id,
      idea: 'idea-6',
      notes: 'notes for idea 6'
    },
    {
      id: 7,
      event_id: events[6].id,
      idea: 'idea-7',
      notes: 'notes for idea 7'
    },
  ];
}

function makeExpectedGiftees(user, giftees) {
  const filteredGiftees = giftees.filter(giftee => giftee.user_id === user.id)
  return filteredGiftees
}

function makeExpectedEvents(giftee, events) {
  const filteredEvents = events.filter(event => event.giftee_id === giftee.id)
  return filteredEvents
}

function makeExpectedGifts(event, gifts) {
  const filteredGifts = gifts.filter(gift => gift.event_id === event.id)
  return filteredGifts
}

// function makeExpectedArticleComments(users, articleId, comments) {
//   const expectedComments = comments
//     .filter(comment => comment.article_id === articleId)

//   return expectedComments.map(comment => {
//     const commentUser = users.find(user => user.id === comment.user_id)
//     return {
//       id: comment.id,
//       text: comment.text,
//       date_created: comment.date_created.toISOString(),
//       user: {
//         id: commentUser.id,
//         user_name: commentUser.user_name,
//         full_name: commentUser.full_name,
//         nickname: commentUser.nickname,
//         date_created: commentUser.date_created.toISOString(),
//         date_modified: commentUser.date_modified || null,
//       }
//     }
//   })
// }

// function makeMaliciousArticle(user) {
//   const maliciousArticle = {
//     id: 911,
//     style: 'How-to',
//     date_created: new Date(),
//     title: 'Naughty naughty very naughty <script>alert("xss");</script>',
//     author_id: user.id,
//     content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
//   }
//   const expectedArticle = {
//     ...makeExpectedArticle([user], maliciousArticle),
//     title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
//     content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
//   }
//   return {
//     maliciousArticle,
//     expectedArticle,
//   }
// }

function makeFixtures() {
  const testUsers = makeUsersArray()
  const testGiftees = makeGifteesArray(testUsers)
  const testEvents = makeEventsArray(testGiftees)
  const testGifts = makeGiftsArray(testEvents)
  return { testUsers, testGiftees, testEvents, testGifts }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        users_table,
        giftees_table,
        events_table,
        gifts_table
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE users_table_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE giftees_table_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE events_table_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE gifts_table_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('users_table_id_seq', 0)`),
        trx.raw(`SELECT setval('giftees_table_id_seq', 0)`),
        trx.raw(`SELECT setval('events_table_id_seq', 0)`),
        trx.raw(`SELECT setval('gifts_table_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users_table').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_table_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedTables(db, users, giftees=[], events=[], gifts=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    if (giftees.length) {
      await trx.into('giftees_table').insert(giftees)
      // update the auto sequence to match the forced id values
      await trx.raw(
        `SELECT setval('giftees_table_id_seq', ?)`,
        [giftees[giftees.length - 1].id],
      )
    }
    // only insert events if there are some, also update the sequence counter
    if (events.length) {
      await trx.into('events_table').insert(events)
      await trx.raw(
        `SELECT setval('events_table_id_seq', ?)`,
        [events[events.length - 1].id],
      )
    }
    // only insert gifts if there are some, also update the sequence counter
    if (gifts.length) {
      await trx.into('gifts_table').insert(gifts)
      await trx.raw(
        `SELECT setval('gifts_table_id_seq', ?)`,
        [gifts[gifts.length - 1].id],
      )
    }
  })
}

// function seedMaliciousArticle(db, user, article) {
//   return seedUsers(db, [user])
//     .then(() =>
//       db
//         .into('blogful_articles')
//         .insert([article])
//     )
// }

function makeAuthHeader(user, username, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeGifteesArray,
  makeEventsArray,
  makeGiftsArray,
  makeFixtures,
  cleanTables,
  makeAuthHeader,
  makeExpectedGiftees,
  makeExpectedEvents,
  makeExpectedGifts,
  seedUsers,
  seedTables
}