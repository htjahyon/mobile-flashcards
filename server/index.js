require('dotenv/config');
const pg = require('pg');
const argon2 = require('argon2');
const express = require('express');
const jwt = require('jsonwebtoken');
const ClientError = require('./client-error');
const errorMiddleware = require('./error-middleware');
const staticMiddleware = require('./static-middleware');
const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

const jsonMiddleware = express.json();

app.use(jsonMiddleware);
app.use(staticMiddleware);

app.post('/api/auth/sign-up', (req, res, next) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    throw new ClientError(400, 'username and password are required fields');
  }
  argon2
    .hash(password)
    .then(hashedPassword => {
      const sql = `
        insert into "users" ("username", "hashedPassword", "email")
        values ($1, $2, $3)
        returning "userId", "username"
      `;
      const params = [username, hashedPassword, email];
      return db.query(sql, params);
    })
    .then(result => {
      const [user] = result.rows;
      res.status(201).json(user);
    })
    .catch(err => next(err));
});

app.post('/api/auth/sign-in', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ClientError(401, 'invalid login');
  }
  const sql = `
    select "userId",
           "hashedPassword"
      from "users"
     where "username" = $1
  `;
  const params = [username];
  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        throw new ClientError(401, 'invalid login');
      }
      const { userId, hashedPassword } = user;
      return argon2
        .verify(hashedPassword, password)
        .then(isMatching => {
          if (!isMatching) {
            throw new ClientError(401, 'invalid login');
          }
          const payload = { userId, username };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        });
    })
    .catch(err => next(err));
});

app.post('/api/cards', (req, res, next) => {
  const { folderCardId, question, answer } = req.body;
  if (!folderCardId || !question || !answer) {
    throw new ClientError(400, 'folderCardId, question, and answer are required fields');
  }
  const sql = `
    insert into "cards" ("folderCardId", "question", "answer")
    values ($1, $2, $3)
    returning *
  `;
  const params = [folderCardId, question, answer];
  db.query(sql, params)
    .then(result => {
      const [card] = result.rows;
      res.status(201).json(card);
    })
    .catch(err => next(err));
});

app.get('/api/cards', (req, res) => {
  const sql = `select *
                from "cards";
              `;
  db.query(sql)
    .then(result => {
      res.status(200).json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.get('/api/cards/:cardId', (req, res, next) => {
  const cardId = parseInt(req.params.cardId, 10);
  if (!Number.isInteger(cardId) || cardId <= 0) {
    res.status(400).json({
      error: '"cardId" must be a positive integer'
    });
    return;
  }
  const sql = `
    select *
      from "cards"
     where "cardId" = $1;
  `;

  const params = [cardId];
  db.query(sql, params)
    .then(result => {
      const card = result.rows[0];
      if (!card) {
        res.status(404).json({
          error: `Cannot find grade with "cardId" ${cardId}`
        });
      } else {
        res.json(card);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.use(errorMiddleware);

app.patch('/api/cards/:cardId', (req, res) => {
  const cardId = parseInt(req.params.cardId, 10);
  if (!Number.isInteger(cardId) || cardId <= 0) {
    res.status(400).json({
      error: '"cardId" must be a positive integer'
    });
    return;
  }
  const { question, answer } = req.body;
  if (typeof question === 'undefined' || typeof answer === 'undefined') {
    res.status(400).json({
      error: 'Question and answer are required fields.'
    });
    return;
  }

  const sql = `update "cards"
             set "question" = $2,
                 "answer" = $3
             where "cardId" = $1
             returning *;
             `;

  const params = [cardId, question, answer];
  db.query(sql, params)
    .then(result => {
      const card = result.rows[0];
      if (!card) {
        res.status(404).json({
          error: `Cannot find card with "cardId" ${cardId}`
        });
      } else {
        res.status(200).json(card);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.delete('/api/cards/:cardId', (req, res) => {
  const cardId = parseInt(req.params.cardId, 10);
  if (!Number.isInteger(cardId) || cardId <= 0) {
    res.status(400).json({
      error: '"cardId" must be a positive integer'
    });
    return;
  }
  const sql = `
    delete from "cards"
     where "cardId" = $1
     returning *;
  `;
  const params = [cardId];
  db.query(sql, params)
    .then(result => {
      const card = result.rows[0];
      if (!card) {
        res.status(404).json({
          error: `Cannot find card with "cardId" ${cardId}`
        });
      } else {
        res.status(204).json(card);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.get('/api/folderCards', (req, res) => {
  const sql = `select *
                from "folderCards";
              `;
  db.query(sql)
    .then(result => {
      res.status(200).json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.post('/api/folderCards', (req, res, next) => {
  let { folderId, cardsTitle } = req.body;
  folderId = parseInt(folderId, 10);
  if (!folderId || !cardsTitle) {
    throw new ClientError(400, 'folderId and cardsTitle are required fields.');
  }
  const sql = `
    insert into "folderCards" ("folderId", "cardsTitle")
    values ($1, $2)
    returning *
  `;
  const params = [folderId, cardsTitle];
  db.query(sql, params)
    .then(result => {
      const [cards] = result.rows;
      res.status(201).json(cards);
    })
    .catch(err => next(err));
});

app.patch('/api/folderCards/:folderCardId', (req, res) => {
  const folderCardId = parseInt(req.params.folderCardId, 10);
  if (!Number.isInteger(folderCardId) || folderCardId <= 0) {
    res.status(400).json({
      error: '"folderCardId" must be a positive integer.'
    });
    return;
  }
  let { folderId, cardsTitle } = req.body;
  folderId = parseInt(folderId, 10);
  if (!Number.isInteger(folderId) || folderId <= 0 || typeof cardsTitle === 'undefined') {
    res.status(400).json({
      error: 'folderId and cardsTitle are required fields.'
    });
    return;
  }

  const sql = `update "folderCards"
             set "folderId" = $2,
                 "cardsTitle" = $3
             where "folderCardId" = $1
             returning *;
             `;

  const params = [folderCardId, folderId, cardsTitle];
  db.query(sql, params)
    .then(result => {
      const batch = result.rows[0];
      if (!batch) {
        res.status(404).json({
          error: `Cannot find batch with "folderCardId" ${folderCardId}`
        });
      } else {
        res.status(200).json(batch);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.delete('/api/folderCards/:folderCardId', (req, res) => {
  const folderCardId = parseInt(req.params.folderCardId, 10);
  if (!Number.isInteger(folderCardId) || folderCardId <= 0) {
    res.status(400).json({
      error: '"folderCardId" must be a positive integer.'
    });
    return;
  }
  const sql = `
    delete from "folderCards"
     where "folderCardId" = $1
     returning *;
  `;
  const params = [folderCardId];
  db.query(sql, params)
    .then(result => {
      const batch = result.rows[0];
      if (!batch) {
        res.status(404).json({
          error: `Cannot find card with "foldercardId" ${folderCardId}`
        });
      } else {
        res.status(204).json(batch);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.get('/api/folders', (req, res) => {
  const sql = `select *
                from "folders";
              `;
  db.query(sql)
    .then(result => {
      res.status(200).json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.post('/api/folders', (req, res, next) => {
  let { folderName, userId } = req.body;
  userId = parseInt(userId, 10);
  if (!folderName || !userId) {
    throw new ClientError(400, 'folderName and userId are required fields.');
  }
  const sql = `
    insert into "folders" ("folderName", "userId")
    values ($1, $2)
    returning *
  `;
  const params = [folderName, userId];
  db.query(sql, params)
    .then(result => {
      const [folders] = result.rows;
      res.status(201).json(folders);
    })
    .catch(err => next(err));
});

app.patch('/api/folders/:folderId', (req, res) => {
  const folderId = parseInt(req.params.folderId, 10);
  if (!Number.isInteger(folderId) || folderId <= 0) {
    res.status(400).json({
      error: '"folderId" must be a positive integer.'
    });
    return;
  }
  let { folderName, userId } = req.body;
  userId = parseInt(userId, 10);
  if (!Number.isInteger(userId) || userId <= 0 || typeof folderName === 'undefined') {
    res.status(400).json({
      error: 'userId and folderName are required fields.'
    });
    return;
  }

  const sql = `update "folders"
             set "folderName" = $2,
                 "userId" = $3
             where "folderId" = $1
             returning *;
             `;

  const params = [folderId, folderName, userId];
  db.query(sql, params)
    .then(result => {
      const folder = result.rows[0];
      if (!folder) {
        res.status(404).json({
          error: `Cannot find folder with "folderId" ${folderId}`
        });
      } else {
        res.status(200).json(folder);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.delete('/api/folders/:folderId', (req, res) => {
  const folderId = parseInt(req.params.folderId, 10);
  if (!Number.isInteger(folderId) || folderId <= 0) {
    res.status(400).json({
      error: '"folderId" must be a positive integer.'
    });
    return;
  }
  const sql = `
    delete from "folders"
     where "folderId" = $1
     returning *;
  `;
  const params = [folderId];
  db.query(sql, params)
    .then(result => {
      const folder = result.rows[0];
      if (!folder) {
        res.status(404).json({
          error: `Cannot find folder with "folderId" ${folderId}`
        });
      } else {
        res.status(204).json(folder);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
