import { useMediaQuery } from '@mui/material';
import { useTheme } from '@arcblock/ux/lib/Theme';

function useMobileWidth() {
  const theme = useTheme();
  const isBreakpointsDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const minWidth = isBreakpointsDownSm ? 300 : theme.breakpoints.values.sm;
  return { minWidth };
}

export default useMobileWidth;
