import { Box } from '@mui/material';
import ClaimToken from './claim';
import DonateToken from './donate';

export default function TokenActions(props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <ClaimToken {...props} />
      <DonateToken {...props} />
    </Box>
  );
}
