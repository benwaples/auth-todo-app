const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/toDos', async(req, res) => {
  try {
    const userId = req.userId;
    const data = await client.query(`SELECT * from toDos WHERE toDos.owner_id = ${userId}`);

    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/toDos/:id', async(req, res) => {
  try {
    const toDoId = req.params.id;
    const userId = req.userId;
    const data = await client.query(`
    SELECT * from toDos 
      WHERE toDos.owner_id = $1 
      AND toDos.id = $2`, 
    [userId, toDoId]);

    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/toDos', async(req, res) => {
  try {
    
    const addToDo = {
      todo: req.body.todo,
    };

    const data = await client.query(`
      INSERT INTO toDos(todo, completed, owner_id)
      VALUES($1, $2, $3)
      RETURNING *`, [addToDo.todo, false, req.userId]);

    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/toDos/:id', async(req, res) => {
  try {
    const toDoId = req.params.id;
    const userId = req.userId;
    const addToDo = {
      todo: req.body.todo,
    };

    const data = await client.query(`
      UPDATE toDos
        SET todo=$1
        WHERE toDos.owner_id = $2 
        AND toDos.id = $3 
        RETURNING *`, [addToDo.todo, userId, toDoId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
