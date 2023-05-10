const express = require('express');
const mysql = require('mysql2');
const app = express();

const connection = mysql.createConnection({
  host: 'ocutuneserver.mysql.database.azure.com',
  user: 'OcutuneAdmin',
  password: 'Admin123Admin',
  database: 'ocutunedb',
  port: 3306,
});

app.get('/measurements', (req, res) => {
  connection.query('SELECT * FROM ocutunedb.measurements', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));

