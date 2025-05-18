import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Properties } from "./components/Properties";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Properties />
    </ThemeProvider>
  );
}

export default App;
