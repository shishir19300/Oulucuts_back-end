const{ Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect((err, client, done) => {
    if(err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('successfully connected to the database');
    done();
});
module.exports = pool;