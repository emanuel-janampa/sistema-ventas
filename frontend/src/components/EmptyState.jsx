import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function EmptyState({ title, description, action }) {
  return (
    <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
      <Stack spacing={1} alignItems="center">
        <Typography variant="h6">{title}</Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
        {action}
      </Stack>
    </Box>
  );
}
