const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const xlsx = require("xlsx");
const { BlobServiceClient } = require("@azure/storage-blob");
const Papa = require("papaparse");

// Create a connection pool for MySQL
const connection = mysql.createPool({
  host: "ocutuneserver.mysql.database.azure.com",
  user: "OcutuneAdmin",
  password: "Admin123Admin",
  database: "ocutunedb",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// enable CORS for all origins
app.use(cors());

// Create a connection string to connect to your Azure Blob Storage
const connectionString ="DefaultEndpointsProtocol=https;AccountName=csvfromocutune;AccountKey=M5zsYcaXDYmpo8xF+QxiSOlkBM6p7os4t7i/b89tOZEEowNbBTH41LSdWYohzCYjue6FIjRQ01WZ+AStM+2y0Q==;EndpointSuffix=core.windows.net";

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
    stream.on("data", (data) => chunks.push(data));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error) => reject(error));
  });
}

function isFileProcessed(fileName) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT COUNT(*) AS count FROM processed_files WHERE file_name = ?";
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
    const query = "INSERT INTO processed_files (file_name) VALUES (?)";
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
  console.log("ETL process started");
  try {
    const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);

    // Get a reference to the container in your Azure Blob Storage
    const containerName = "csvfiles";
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // List all blobs in the container
    const blobList = containerClient.listBlobsFlat();

    for await (const blob of blobList) {
      const blobProperties = await containerClient
        .getBlobClient(blob.name)
        .getProperties();
      const fileName = blob.name;

    // Check if the file has already been processed
    const isProcessed = await isFileProcessed(fileName);

    if (isProcessed) {
      console.log(`File '${fileName}' has already been processed`);
      continue; // Move to the next file
    }

    // Get a reference to the blob (CSV file)
    const blobClient = containerClient.getBlobClient(fileName);

    // Download the CSV file as a buffer
    const downloadResponse = await blobClient.download();
    const buffer = await streamToBuffer(downloadResponse.readableStreamBody);

    // Parse the CSV file using PapaParse
    const csvData = Papa.parse(Buffer.from(buffer).toString(), {
      header: true,
    }).data;
      console.log("csvData:", csvData);

      const mapping = {
        'Photopic Lux': 'LUX',
        'CCT': 'CCT',
        'Erythropic Lux': 'mEDI',
        'Melanopic Lux': 'GIndex_LightPollution',
        'PPFD-G': 'Rodent_Mlux'
      };
      
      const concatenatedValues = {};
      
      try {
        for (const row of csvData) {
          const columnName = mapping[row['File Name']];
          const columnValue = row[' test'];
      
          if (columnName && columnValue) {
            if (columnName === 'mEDI') {
              const modifiedValue = parseFloat(columnValue) * 0.9058;
      
              if (!concatenatedValues[columnName]) {
                concatenatedValues[columnName] = [];
              }
      
              concatenatedValues[columnName].push(modifiedValue);
            } else {
              if (!concatenatedValues[columnName]) {
                concatenatedValues[columnName] = [];
              }
      
              concatenatedValues[columnName].push(columnValue);
            }
          }
        }
      
        // Calculate DER value
        const photopicLuxValues = concatenatedValues['LUX'];
        const mEDIValues = concatenatedValues['mEDI'];
      
        if (photopicLuxValues && mEDIValues) {
          const derValues = photopicLuxValues.map((lux, index) => mEDIValues[index] / lux);
      
          // Add DER values to concatenatedValues object
          concatenatedValues['DER'] = derValues;
        } else {
          console.log(`Insufficient data to calculate DER values in file '${fileName}'`);
        }
      
        const queryColumns = Object.keys(concatenatedValues).join(',');
        const queryPlaceholders = Object.values(concatenatedValues).map(() => '?').join(',');
        const queryValues = [].concat(...Object.values(concatenatedValues));
      
        if (queryColumns && queryPlaceholders) {
          const query = `INSERT INTO measurements (${queryColumns}) VALUES (${queryPlaceholders})`;
      
          console.log('SQL Query:', query);
          console.log('Query Values:', queryValues);
      
          await updateProcessedFile(fileName);
          await executeQuery(query, queryValues);
      
          console.log('Inserted rows:', csvData.length);
        } else {
          console.log(`No valid rows to insert in file '${fileName}'`);
        }
      } catch (error) {
        console.error(`Error inserting rows for file '${fileName}':`, error);
        continue; // Move to the next file
      }

      await updateProcessedFile(fileName);
      console.log(`File '${fileName}' has been processed successfully`);
    }

    console.log("ETL process completed");
  } catch (error) {
    console.error("ETL process failed:", error);
  }
}

/*async function deleteOldDatasets() {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  try {
    const query = "DELETE FROM measurements WHERE date < ?";
    const result = await executeQuery(query, [twentyFourHoursAgo]);

    console.log("Deleted old datasets:", result.affectedRows);
  } catch (error) {
    console.error("Error deleting old datasets:", error);
  }
}*/

app.get("/measurements", async (req, res) => {
  try {
    // Only perform ETL process if there is a new CSV file uploaded
    await performETL();

     // Delete datasets older than 24 hours
     //await deleteOldDatasets();

    connection.query("SELECT * FROM ocutunedb.measurements", (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (error) {
    console.error("ETL process failed:", error);
    res.status(500).json({ error: "An error occurred during the ETL process" });
  }
});

app.delete("/measurements/:serialNo", async (req, res) => {
  const serialNo = req.params.serialNo;

  try {
    // Delete the row with the specified SerialNo
    await executeQuery("DELETE FROM measurements WHERE SerialNo = ?", [
      serialNo,
    ]);

    // Return a success message or any other desired response
    res.json({ message: "Record and dataset deleted successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while deleting the record and dataset",
      });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
