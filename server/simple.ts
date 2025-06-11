import express from "express";
import { createServer } from "http";

const app = express();

// Root path for Railway healthcheck
app.get('/', (req, res) => {
  res.status(200).send('Lough Hyne Cottage Server Running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const port = parseInt(process.env.PORT || "3000");
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Simple server running on port ${port}`);
});