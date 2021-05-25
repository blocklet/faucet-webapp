import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { SnackbarProvider } from 'notistack';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { MuiThemeProvider } from '@material-ui/core/styles';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';
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
`;

const InsideApp = () => {
  const { locale } = useLocaleContext();
  dayjs.locale(locale === 'zh' ? 'zh-cn' : locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(relativeTime);

  return (
    <>
      <CssBaseline />
      <GlobalStyle />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Redirect to="/" />
      </Switch>
    </>
  );
};

export const App = () => {
  const notificationRef = React.createRef();
  const onClickDismiss = (key) => () => {
    notificationRef.current.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      ref={notificationRef}
      action={(key) => (
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClickDismiss(key)}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      )}>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <LocaleProvider translations={translations}>
            <TokenProvider>
              <InsideApp />
            </TokenProvider>
          </LocaleProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </SnackbarProvider>
  );
};

const WrappedApp = withRouter(App);

export default () => {
  let basename = '/';

  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }

  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
};
