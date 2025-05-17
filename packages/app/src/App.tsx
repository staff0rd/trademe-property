import { CssBaseline, ThemeProvider, Typography } from "@mui/material";

function App() {
  return (
    <ThemeProvider theme={{ palette: { mode: "dark" } }}>
      <CssBaseline />
      <Typography>Placeholder</Typography>
    </ThemeProvider>
  );
}

export default App;
