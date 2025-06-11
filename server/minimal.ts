import express from "express";

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const port = parseInt(process.env.PORT || "3000");

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});