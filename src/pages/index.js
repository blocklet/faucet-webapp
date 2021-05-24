import React from 'react';
import styled from 'styled-components';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import LocaleSelector from '@arcblock/ux/lib/Locale/selector';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Center from '@arcblock/ux/lib/Center';

import { useTokenContext } from '../contexts/token';

export default function HomePage() {
  const { t } = useLocaleContext();
  const info = useTokenContext();

  if (info.loading) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  return (
    <Div maxWidth="md">
      <div className="header">
        <Typography component="h2" variant="h5">
          {t('title')}
        </Typography>
        <div className="header-addons">
          <LocaleSelector size={24} showText={false} className="locale-addon" />
        </div>
      </div>
      <Paper className="main">
        <div className="tokens">
          <pre>{JSON.stringify(info.data, null, 2)}</pre>
        </div>
      </Paper>
    </Div>
  );
}

const Div = styled(Container)`
  margin-top: 32px;

  .header {
    margin-bottom: 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .main {
    padding: 24px;
    box-shadow: none;
    border: 1px solid #efefef;
  }
`;
