const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory database for simulation
let database = {
  registrosES: []
};

app.post('/api/sync', (req, res) => {
  const pendingRecords = req.body;
  console.log(`Received ${pendingRecords.length} pending records to sync.`);

  // Conflict resolution: "last write wins"
  // We simply overwrite the existing data with the new data.
  // A more robust implementation would involve versioning or timestamps.
  pendingRecords.forEach(record => {
    const index = database.registrosES.findIndex(dbRecord => dbRecord.id === record.id);
    if (index !== -1) {
      database.registrosES[index] = record;
    } else {
      database.registrosES.push(record);
    }
  });

  console.log('Sync complete. Database state:', database);
  res.status(200).json({ message: 'Sync successful' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});