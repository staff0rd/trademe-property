import express from "express";
import {
  loadFibreProperties,
  SortField,
  SortOrder,
} from "@staff0rd/shared/data";

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
    const sortBy = req.query.sortBy as SortField | undefined;
    const order = (req.query.order as SortOrder) || "asc";

    // Validate sort parameters
    if (sortBy && !["created", "landArea", "price"].includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sortBy parameter" });
    }
    if (order && !["asc", "desc"].includes(order)) {
      return res.status(400).json({ error: "Invalid order parameter" });
    }

    const properties = loadFibreProperties(sortBy, order);
    res.json(properties);
  } catch (error) {
    console.error("Error loading properties:", error);
    res.status(500).json({ error: "Failed to load properties" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
