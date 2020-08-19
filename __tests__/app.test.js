require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('routes', () => {
  let token;

  const testToDO = {
    todo: 'go toot'
  };
  
  const expectThis = [{
    id: 5,
    todo: 'go toot',
    completed: false,
    owner_id: 2
  }];

  beforeAll(async done => {
    execSync('npm run setup-db');
    client.connect();
    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });
    token = signInData.body.token;
    return done();
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns a new toDo when creating new guitar', async(done) => {
    const data = await fakeRequest(app)
      .post('/api/toDos')
      .send(testToDO)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expectThis);
    done();
  });

  test('returns all guitars for the user when hitting GET /toDos', async(done) => {
    const expected = [
      {
        id: 5,
        todo: 'go toot',
        completed: false,
        owner_id: 2
      },
    ];
    const data = await fakeRequest(app)
      .get('/api/toDos')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expected);
    done();
  });

  test('returns a single todo for the user when hitting GET /toDos/:id', async(done) => {

    const expected = [
      {
        id: 5,
        todo: 'go toot',
        completed: false,
        owner_id: 2
      },
    ];

    const data = await fakeRequest(app)
      .get('/api/toDos/5')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expected);
    done();
  });

  test('updates a single guitar for the user when hitting PUT /toDos/:id', async(done) => {
    
    const newToDo = {
      todo: 'have a great day',
    };

    const expectedToDo = {
      id: 5,
      todo: 'have a great day',
      completed: false,
      owner_id: 2
    };

    const data = await fakeRequest(app)
      .put('/api/toDos/5')
      .send(newToDo)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    // const allToDos = await fakeRequest(app)
    //   .get('/api/toDos')
    //   .send(newToDo)
    //   .set('Authorization', token)
    //   .expect('Content-Type', /json/)
    //   .expect(200);

    expect(expectedToDo).toEqual(data.body);
    // expect(allToDos.body).toEqual(expectedToDo);
    done();
  });

  // test('delete a single guitar for the user when hitting DELETE /guitars/:id', async(done) => {
  //   await fakeRequest(app)
  //     .delete('/api/guitars/4')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   const data = await fakeRequest(app)
  //     .get('/api/guitars/')
  //     .set('Authorization', token)
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   expect(data.body).toEqual([]);
  //   done();
  // });

});
