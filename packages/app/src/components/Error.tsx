import { Box, Typography } from "@mui/material";

interface ErrorProps {
  message: string;
}

export function Error({ message }: ErrorProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Typography color="error">{message}</Typography>
    </Box>
  );
}
