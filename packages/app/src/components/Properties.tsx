import {
  Card,
  CardContent,
  CardMedia,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SortOrder } from "@staff0rd/shared/data";
import { useCategories, useProperties } from "../propertyStore";
import { Error } from "./Error";
import { Loading } from "./Loading";

export function Properties() {
  const { categories, selectedCategory, setSelectedCategory } = useCategories();
  const { properties, loading, error, sortBy, setSortBy, order, setOrder } =
    useProperties();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
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
              onChange={(e) => setSortBy(e.target.value)}
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
  );
}
