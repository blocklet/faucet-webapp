import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { Close as CloseIcon } from '@mui/icons-material';
import { CssBaseline, IconButton } from '@mui/material';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SnackbarProvider } from 'notistack';
import { useRef } from 'react';

import { ConfigProvider } from '@arcblock/ux/lib/Config';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { TokenProvider } from './contexts/token';
import { SessionProvider } from './libs/session';
import { translations } from './locales';
import HomePage from './pages/index';

const InsideApp = () => {
  const { locale } = useLocaleContext();
  dayjs.locale(locale === 'zh' ? 'zh-cn' : locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(relativeTime);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
