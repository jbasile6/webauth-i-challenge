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
server.get('/api/users', (req, res) => {
    db('users')
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).json(err));
})


server.post('/api/login', (req, res) => {
    db('users')
        .where({ username: req.body.username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(req.body.password, user.password)) {
                res.status(200).json({ message: `Welcome ${user.username}`, cookie: user.id })
                //not sure how to create a new session, based on what i'm seeeing in tomorrow's TK, the cookie isnt correct either
                //looks like this is for tomorrow's project
            } else{
                res.status(400).json({ error: 'You shall not pass' })
            }
        })
        .catch(err => res.status(500).json(err));
})

server.listen(5000, () => {
    console.log(`\n** Running on port 5k **\n`)
});