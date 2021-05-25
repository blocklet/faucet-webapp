import React, { useState } from 'react';
import styled from 'styled-components';
import { useSnackbar } from 'notistack';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconAdd from '@material-ui/icons/AddOutlined';

import Button from '@arcblock/ux/lib/Button';
import LocaleSelector from '@arcblock/ux/lib/Locale/selector';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Center from '@arcblock/ux/lib/Center';

import ConfirmDialog from '../components/confirm';
import { useTokenContext } from '../contexts/token';
import { formatError } from '../libs/util';

export default function HomePage() {
  const { t } = useLocaleContext();
  const { enqueueSnackbar } = useSnackbar();
  const info = useTokenContext();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const onAddToken = async (data) => {
    try {
      await info.api.post('/api/tokens', data);
      enqueueSnackbar(t('added'), { autoHideDuration: 5000, variant: 'success' });
      info.refresh();
    } catch (err) {
      enqueueSnackbar(formatError(err), { autoHideDuration: 5000, variant: 'error' });
      console.error('Blocklet installed failed', err);
    } finally {
      setShowAddDialog(false);
    }
  };

  const addSetting = {
    title: t('add'),
    description: (params, setParams) => {
      const setValue = (value) => {
        // eslint-disable-next-line no-underscore-dangle
        setParams({ ...value, __disableConfirm: value.__disableConfirm });
      };

      const { chainHost, tokenAddress } = params;

      return (
        <div>
          <Typography component="div">
            <TextField
              label={t('chainHost.label')}
              placeholder={t('chainHost.placeholder')}
              autoComplete="off"
              variant="outlined"
              style={{ marginBottom: 24 }}
              fullWidth
              autoFocus
              value={chainHost}
              onChange={(e) => {
                setValue({ ...params, chainHost: e.target.value, __disableConfirm: !e.target.value });
              }}
            />
            <TextField
              label={t('tokenAddress.label')}
              placeholder={t('tokenAddress.placeholder')}
              autoComplete="off"
              variant="outlined"
              fullWidth
              value={tokenAddress}
              onChange={(e) => {
                setValue({ ...params, tokenAddress: e.target.value });
              }}
            />
          </Typography>
        </div>
      );
    },
    confirm: t('submit'),
    cancel: t('cancel'),
    onConfirm: onAddToken,
    onCancel: () => setShowAddDialog(false),
    params: {
      __disableConfirm: true,
      chainHost: '',
      tokenAddress: '',
    },
  };

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
          <Button onClick={() => setShowAddDialog(true)} variant="contained" color="primary" size="small" rounded>
            <IconAdd />
            {t('add')}
          </Button>
          <LocaleSelector size={28} showText={false} className="addon-locale" />
        </div>
      </div>
      <Paper className="main">
        <div className="tokens">
          <pre>{JSON.stringify(info.data, null, 2)}</pre>
        </div>
      </Paper>
      {showAddDialog && (
        <ConfirmDialog
          title={addSetting.title}
          description={addSetting.description}
          confirm={addSetting.confirm}
          cancel={addSetting.cancel}
          params={addSetting.params}
          onConfirm={addSetting.onConfirm}
          onCancel={addSetting.onCancel}
        />
      )}
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

  .header-addons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .addon-locale {
      margin-left: 16px;
    }
  }

  .main {
    padding: 24px;
    box-shadow: none;
    border: 1px solid #efefef;
  }
`;
