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



server.listen(5000, () => {
    console.log(`\n** Running on port 5k **\n`)
});