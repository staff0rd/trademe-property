import { useEffect, useState } from "react";
import {
  CssBaseline,
  ThemeProvider,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Box,
  createTheme,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import type { PropertyRecord } from "@staff0rd/shared/types";
import type { SortField, SortOrder } from "@staff0rd/shared/data";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("price");
  const [order, setOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProperties = async () => {
      try {
        const params = new URLSearchParams();
        if (sortBy) params.append("sortBy", sortBy);
        params.append("order", order);

        const response = await fetch(
          `http://localhost:3000/api/properties/${selectedCategory}?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [sortBy, order, selectedCategory]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            Properties
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as SortField | "")}
              >
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="created">Created Date</MenuItem>
                <MenuItem value="landArea">Land Area</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={order}
                label="Order"
                onChange={(e) => setOrder(e.target.value as SortOrder)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid
                key={property.href}
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Card>
                  {property.imageUrl && (
                    <CardMedia
                      component="img"
                      height="400"
                      image={property.imageUrl}
                      alt={property.addressText}
                    />
                  )}
                  <CardContent>
                    <Stack
                      spacing={2}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="h6" component="div">
                        <Link href={property.href}>{property.addressText}</Link>
                      </Typography>
                      <Stack alignItems="flex-end">
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          sx={{ textAlign: "right" }}
                        >
                          {property.priceText}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {property.priceNumber.toLocaleString("en-NZ", {
                            style: "currency",
                            currency: "NZD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                      </Stack>
                    </Stack>
                    {property.houseArea && (
                      <Typography variant="body2" color="text.secondary">
                        House Area: {property.houseArea}
                      </Typography>
                    )}
                    {property.landArea && (
                      <Typography variant="body2" color="text.secondary">
                        Land Area: {property.landArea}
                      </Typography>
                    )}
                    {property.broadband && (
                      <Typography variant="body2" color="text.secondary">
                        Broadband: {property.broadband}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Listed: {new Date(property.created).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
