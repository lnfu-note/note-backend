const { Pool } = require('pg');

// connect to db
const pool = new Pool({
    user: 'root',
    host: 'localhost',
    database: 'note',
    password: 'secret',
    port: 5432,
});

exports.query = (text, params) => pool.query(text, params);
