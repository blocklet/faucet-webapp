import { useTheme } from '@arcblock/ux/lib/Theme';
import { useMediaQuery } from '@mui/material';

export default function useMobile(key = 'md') {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(key));
  return isMobile;
}
