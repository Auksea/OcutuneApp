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

function isFileProcessed(fileName) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) AS count FROM processed_files WHERE file_name = ?';
    connection.query(query, [fileName], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const count = results[0].count;
        resolve(count > 0);
      }
    });
  });
}


function updateProcessedFile(fileName) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO processed_files (file_name) VALUES (?)';
    connection.query(query, [fileName], (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}




async function performETL() {
  console.log('ETL process started');
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // Get a reference to the container in your Azure Blob Storage
    const containerName = 'csvfiles';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // List all blobs in the container
    const blobList = containerClient.listBlobsFlat();

    // Get the latest uploaded CSV file
    let latestBlob = null;

    for await (const blob of blobList) {
      const blobProperties = await containerClient.getBlobClient(blob.name).getProperties();
      const fileName = blob.name;

      if (!latestBlob) {
        latestBlob = blob;
      } else {
        // Compare file names to get the latest file
        if (fileName > latestBlob.name) {
          latestBlob = blob;
        }
      }
    }

    if (!latestBlob) {
      // No CSV file found
      console.log('No CSV files found in the container');
      return;
    }

    // Get the name of the latest CSV file
    const fileName = latestBlob.name;
    console.log('Latest CSV file:', fileName);

    // Check if the file has already been processed
    const isProcessed = await checkIfFileProcessed(fileName);

    if (isProcessed) {
      console.log('File has already been processed');
      return;
    }

    // Get a reference to the blob (CSV file)
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

    // Insert the concatenated values into the MySQL database
    try {
      const queryValues = Object.values(concatenatedValues);

      if (queryValues.length > 0) {
        const query = `INSERT INTO measurements (${Object.keys(concatenatedValues).join(',')}) VALUES (${queryValues.map(() => '?').join(',')})`;

        console.log('SQL Query:', query);
        console.log('Query Values:', queryValues);

        await updateProcessedFile(latestFileName);
        await executeQuery(query, queryValues);


        console.log('Inserted rows:', csvData.length);
      } else {
        console.log('No rows to insert');
      }

      await updateProcessedFile(fileName);
    } catch (error) {
      console.error('Error inserting rows:', error);
      return;
    }

    console.log('ETL process completed');
  } catch (error) {
    console.error('ETL process failed:', error);
  }
}

app.get('/measurements', async (req, res) => {
  try {
    // Only perform ETL process if there is a new CSV file uploaded
    await performETL();

    connection.query('SELECT * FROM ocutunedb.measurements', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (error) {
    console.error('ETL process failed:', error);
    res.status(500).json({ error: 'An error occurred during the ETL process' });
  }
});

app.delete('/measurements/:serialNo', async (req, res) => {
  const serialNo = req.params.serialNo;

  try {
    // Delete the row with the specified SerialNo
    await executeQuery('DELETE FROM measurements WHERE SerialNo = ?', [serialNo]);

    // Delete the dataset associated with the SerialNo (assuming there is a corresponding file in the Azure Blob Storage)
    // Write the code to delete the dataset from Azure Blob Storage here

    // Return a success message or any other desired response
    res.json({ message: 'Record and dataset deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'An error occurred while deleting the record and dataset' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

