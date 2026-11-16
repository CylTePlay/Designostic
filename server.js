const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3008;
const FILE_PATH = path.join(__dirname, "data.json");

// Middleware: Parse incoming JSON request bodies
app.use(cors());
app.use(express.json());

// Global array in memory
let dataStore = [];

// On boot: Load from file if it exists, otherwise keep it empty
if (fs.existsSync(FILE_PATH)) {
  try {
    const rawData = fs.readFileSync(FILE_PATH, "utf-8");
    dataStore = JSON.parse(rawData);
    console.log("Loaded existing data from file.");
  } catch (err) {
    console.error(
      "Failed to parse existing data file, initializing as empty:",
      err.message
    );
    dataStore = [];
  }
} else {
  console.log("No existing data file found. Initialized with an empty array.");
}

// GET /data: Returns the array serialized as a string
app.get("/data", (req, res) => {
  res.send(JSON.stringify(dataStore));
});

// POST /data: Adds the payload to the array and writes to disk
app.post("/data", (req, res) => {
  // Shove the received payload into the global array
  dataStore.push(req.body);

  // Persist a copy to data.json in the same folder
  fs.writeFile(FILE_PATH, JSON.stringify(dataStore, null, 2), (err) => {
    if (err) {
      console.error("Error saving data to file:", err);
      return res.status(500).send("Error persisting data.");
    }
    res.status(201).send("Data saved successfully.");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
