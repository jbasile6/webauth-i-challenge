const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const server = express();

const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

server.use(helmet());
server.use(express.json());



server.get('/', (req, res) => {
    res.send('James Basile: Web Auth I Challenge')
})


//POST create new user
server.post('/api/register', (req, res) => {
    let user = req.body;

    const hash = bcrypt.hashSync(user.password, 8);
    user.password = hash;

    db('users').insert(user)
        .then(newUser => res.status(201).json(newUser))
        .catch( err => res.status(500).json(err));
});

//get all users
server.get('/api/users', )

server.listen(5000, () => {
    console.log(`\n** Running on port 5k **\n`)
});