import express from "express";
import { loadData } from "@staff0rd/shared/data";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Get all properties endpoint
app.get("/api/properties", (req, res) => {
  try {
    const properties = loadData();
    res.json(properties);
  } catch (error) {
    console.error("Error loading properties:", error);
    res.status(500).json({ error: "Failed to load properties" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
