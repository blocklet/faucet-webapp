import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { LocaleProvider, useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import CssBaseline from '@material-ui/core/CssBaseline';

import BlockletListPage from './pages/blocklets/index';
import BlockletDetailPage from './pages/blocklets/detail';
import { translations } from './locales';
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
        <Route exact path="/" component={BlockletListPage} />
        <Route exact path="/blocklet/:did" component={BlockletDetailPage} />
        <Redirect to="/" />
      </Switch>
    </>
  );
};

export const App = () => (
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <LocaleProvider translations={translations}>
        <InsideApp />
      </LocaleProvider>
    </ThemeProvider>
  </MuiThemeProvider>
);

const WrappedApp = withRouter(App);

export default () => {
  let basename = '/';

  if (window.env && window.env.apiPrefix) {
    basename = window.env.apiPrefix;
  }
  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }

  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
};
