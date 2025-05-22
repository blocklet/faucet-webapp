import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { SnackbarProvider } from 'notistack';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CssBaseline, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useRef } from 'react';

import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { ConfigProvider } from '@arcblock/ux/lib/Config';

import { TokenProvider } from './contexts/token';
import { translations } from './locales';
import HomePage from './pages/index';
import { SessionProvider } from './libs/session';

const InsideApp = () => {
  const { locale } = useLocaleContext();
  dayjs.locale(locale === 'zh' ? 'zh-cn' : locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(relativeTime);

  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Redirect to="/" />
    </Switch>
  );
};

export const App = () => {
  const notificationRef = useRef(null);
  const onClickDismiss = (key) => () => {
    notificationRef.current.closeSnackbar(key);
  };

  return (
    <ConfigProvider translations={translations}>
      <CssBaseline />
      <SessionProvider>
        <SnackbarProvider
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          ref={notificationRef}
          action={(key) => (
            <IconButton key="close" aria-label="close" color="inherit" onClick={onClickDismiss(key)}>
              <CloseIcon style={{ fontSize: 16 }} />
            </IconButton>
          )}
        >
          <TokenProvider>
            <InsideApp />
          </TokenProvider>
        </SnackbarProvider>
      </SessionProvider>
    </ConfigProvider>
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
