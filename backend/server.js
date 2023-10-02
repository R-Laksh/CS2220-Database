const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getData, getMutations2Data } = require("./dbOperation");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/api/data", async (req, res) => {
  try {
    const filters = req.query;
    const data = await getData(filters);
    res.json(data.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.get("/api/mutations2", async (req, res) => {
  try {
    const filters = req.query;
    const data = await getMutations2Data(filters);
    res.json(data.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
