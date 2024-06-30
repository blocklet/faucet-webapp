import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { SnackbarProvider } from 'notistack';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { LocaleProvider, useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import { TokenProvider } from './contexts/token';
import { translations } from './locales';
import HomePage from './pages/index';
import theme from './libs/theme';

const GlobalStyle = createGlobalStyle`
  a {
    color: ${(props) => props.theme.colors.green};
    text-decoration: none;
  }
  a:hover,
  a:hover * {
    text-decoration: none !important;
  }
  div[role="tooltip"] {
    z-index: 9999;
  }
`;

const InsideApp = () => {
  const { locale } = useLocaleContext();
  dayjs.locale(locale === 'zh' ? 'zh-cn' : locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(relativeTime);

  return (
    <Routes>
      <Route exact path="/" component={HomePage} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export const App = () => {
  const notificationRef = React.createRef();
  const onClickDismiss = (key) => () => {
    notificationRef.current.closeSnackbar(key);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <LocaleProvider translations={translations}>
          <CssBaseline />
          <GlobalStyle />
          <SnackbarProvider
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            ref={notificationRef}
            action={(key) => (
              <IconButton key="close" aria-label="close" color="inherit" onClick={onClickDismiss(key)}>
                <CloseIcon style={{ fontSize: 16 }} />
              </IconButton>
            )}>
            <TokenProvider>
              <InsideApp />
            </TokenProvider>
          </SnackbarProvider>
        </LocaleProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

export default () => {
  let basename = '/';

  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }

  return (
    <Router basename={basename}>
      <App />
    </Router>
  );
};
