const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const xlsx = require('xlsx');
const { BlobServiceClient } = require('@azure/storage-blob');
const Papa = require('papaparse');


// Create a connection pool for MySQL
const connection = mysql.createPool({
  host: 'ocutuneserver.mysql.database.azure.com',
  user: 'OcutuneAdmin',
  password: 'Admin123Admin',
  database: 'ocutunedb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// enable CORS for all origins
app.use(cors());

console.log('Connection to MySQL is successful');

// Create a connection string to connect to your Azure Blob Storage
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=csvfromocutune;AccountKey=M5zsYcaXDYmpo8xF+QxiSOlkBM6p7os4t7i/b89tOZEEowNbBTH41LSdWYohzCYjue6FIjRQ01WZ+AStM+2y0Q==;EndpointSuffix=core.windows.net';

app.get('/etl', async (req, res) => {
  console.log('ETL endpoint called');
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // Get a reference to the container in your Azure Blob Storage
    const containerName = 'csvfiles';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Define the name of the Excel file you want to process
    const fileName = 'SpectrumData_2023-05-22T104654.612995.csv';

    // Get a reference to the blob (Excel file)
    const blobClient = containerClient.getBlobClient(fileName);

    // Download the Excel file as a buffer
    const downloadResponse = await blobClient.download();
    const buffer = await streamToBuffer(downloadResponse.readableStreamBody);

    // Parse the Excel file using PapaParse
    const csvData = Papa.parse(Buffer.from(buffer).toString(), { header: true }).data;
    console.log('csvData:', csvData);

    const mapping = {
      'Photopic Lux': 'LUX',
      'CCT': 'CCT',
      'Erythropic Lux': 'mEDI',
      'Melanopic Lux': 'GIndex_LightPollution',
      'PPFD-G': 'Rodent_Mlux'
    };

    const concatenatedValues = {};

    for (const row of csvData) {
      const fileName = row['File Name'];
      const value = parseFloat(row[' test']);

      if (!isNaN(value) && fileName in mapping) {
        const column = mapping[fileName];

        if (concatenatedValues[column]) {
          concatenatedValues[column] += `,${value}`;
        } else {
          concatenatedValues[column] = String(value);
        }
      }
    }

    console.log('Concatenated Values:', concatenatedValues);

    // Insert the concatenated values into the MySQL database
    try {
      const queryValues = Object.values(concatenatedValues);

      if (queryValues.length > 0) {
        const query = `INSERT INTO measurements (${Object.keys(concatenatedValues).join(',')}) VALUES (${queryValues.map(() => '?').join(',')})`;

        console.log('SQL Query:', query);
        console.log('Query Values:', queryValues);

        await executeQuery(query, queryValues);

        console.log('Inserted rows:', csvData.length);
      } else {
        console.log('No rows to insert');
      }
    } catch (error) {
      console.error('Error inserting rows:', error);
    }

    res.json({ message: 'ETL process completed successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during the ETL process' });
  }

  console.log('ETL process completed');
});




// Function to execute a MySQL query
function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to convert a readable stream to a buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (data) => chunks.push(data));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error) => reject(error));
  });
}

app.get('/measurements', (req, res) => {
  connection.query('SELECT * FROM ocutunedb.measurements', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});




app.listen(3000, () => console.log('Server running on port 3000'));

