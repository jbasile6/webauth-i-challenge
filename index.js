const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const bcrypt = require('bcryptjs');



const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

const session = require('express-session');
const knexSessionStore = require('connect-session-knex')(session);

const server = express();



const sessionConfig = {
    name: 'monster', // defaults to sid
    secret: 'keep it secret, keep it safe!',
    cookie: {
        maxAge: 1000 * 60 * 10, // milliseconds
        secure: false, // use cookie over https
        httpOnly: true, // false means JS can access the cookie on the client
    },
    resave: false, // avoid recreating unchanged sessions
    saveUninitialized: false, // GDPR compliance
    store: new knexSessionStore ({
        knex: db,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 30, // delete expired sessions
    }),
}

server.use(helmet());
server.use(express.json());
server.use(session(sessionConfig));


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
        .catch(err => res.status(500).json(err));
});

//get all users- authenticate, must be signed in to view all users
server.get('/api/users', restricted, (req, res) => {
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
                req.session.user = user;

                res.status(200).json({ message: `Welcome ${user.username}` })
                
            } else {
                res.status(400).json({ error: 'You shall not pass' })
            }
        })
        .catch(err => res.status(500).json(err));
})

//Middleware___________________________________________________________________
function restricted(req, res, next) {

    if (req.session.user) {
        db('users')
            .then(users => {
                if (users) {
                    next();
                } else {
                    res.status(401).json({ error: 'You shall not pass!' })
                }
            })
            .catch(err => res.status(500).json(err))
    } else {
        res.status(401).json({ error: 'You shall not pass!' })
    }
}



server.listen(5000, () => {
    console.log(`\n** Running on port 5k **\n`)
});