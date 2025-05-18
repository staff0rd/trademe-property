import express from "express";
import {
  DATA_PATH_ROOT,
  loadFibreProperties,
  SortField,
  SortOrder,
} from "@staff0rd/shared/data";
import path from "path";
import fs from "fs";

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

// Get properties endpoint
app.get("/api/properties/:category", (req, res) => {
  try {
    const { category } = req.params;
    const sortBy = req.query.sortBy as SortField | undefined;
    const order = (req.query.order as SortOrder | undefined) || "asc";

    // Validate sort parameters
    if (sortBy && !["created", "landArea", "price"].includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }
    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ error: "Invalid order parameter" });
    }

    const properties = loadFibreProperties(category, sortBy, order);
    res.json(properties);
  } catch (error) {
    console.error("Error loading properties:", error);
    res.status(500).json({ error: "Failed to load properties" });
  }
});

// Get categories endpoint
app.get("/api/categories", (req, res) => {
  try {
    const files = fs.readdirSync(DATA_PATH_ROOT);
    const categories = files
      .filter((file) => file.endsWith(".db"))
      .map((file) => path.parse(file).name);
    res.json(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
