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
} from "@mui/material";
import type { PropertyRecord } from "@staff0rd/shared/types";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/properties");
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
  }, []);

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
        <Typography variant="h4" component="h1" gutterBottom>
          Properties
        </Typography>
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid
              key={property.href}
              sx={{ width: { xs: "100%", sm: "50%", md: "33.33%" } }}
            >
              <Card>
                {property.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={property.imageUrl}
                    alt={property.addressText}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {property.addressText}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Price: {property.price}
                  </Typography>
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
      </Container>
    </ThemeProvider>
  );
}

export default App;
