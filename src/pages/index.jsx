/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
import get from 'lodash/get';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import useLocalStorage from 'react-use/lib/useLocalStorage';

import { Container, Typography, TextField, CircularProgress } from '@mui/material';
import { AddOutlined as IconAdd } from '@mui/icons-material';

import Button from '@arcblock/ux/lib/Button';
import ClickToCopy from '@arcblock/ux/lib/ClickToCopy';
import LocaleSelector from '@arcblock/ux/lib/Locale/selector';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import Center from '@arcblock/ux/lib/Center';
import { styled } from '@arcblock/ux/lib/Theme';

import MaterialTable from 'material-table';

import ConfirmDialog from '../components/confirm';
import TableIcons from '../components/table-icons';
import TableStyle from '../components/table';
import TokenActions from '../components/token-actions';
import usePersistentSort from '../hooks/persistent-sort';
import { useTokenContext } from '../contexts/token';
import { formatError } from '../libs/util';

export default function HomePage() {
  const { t } = useLocaleContext();
  const { enqueueSnackbar } = useSnackbar();
  const info = useTokenContext();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [pageSize, setNewPageSize] = useLocalStorage('token-page-size', 20);

  const { sortDirections, onSortChange } = usePersistentSort('token', ['asc', '', '', '', '']);

  const onPageSizeChange = (newPageSize) => {
    setNewPageSize(newPageSize);
  };

  const onAddToken = async (data) => {
    try {
      await info.api.post('/api/tokens', data);
      setShowAddDialog(false);
      enqueueSnackbar(t('added'), { autoHideDuration: 5000, variant: 'success' });
      info.refresh();
    } catch (err) {
      setShowAddDialog(false);
      enqueueSnackbar(get(err, 'response.data.error', formatError(err)), { autoHideDuration: 5000, variant: 'error' });
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

  const columns = [
    {
      title: t('symbol'),
      field: 'symbol',
      width: 60,
      sorting: true,
      defaultSort: sortDirections[1],
    },
    {
      title: t('address'),
      field: 'address',
      width: 120,
      defaultSort: sortDirections[2],
      render: (d) => (d.address ? <ClickToCopy>{d.address}</ClickToCopy> : '-'),
    },
    {
      title: t('amount'),
      field: 'faucetAmount',
      width: 30,
      defaultSort: sortDirections[3],
    },
    {
      title: t('chain'),
      field: 'chainId',
      width: 30,
      sorting: true,
      defaultSort: sortDirections[4],
    },
    {
      title: t('actions'),
      sorting: false,
      width: 120,
      render: (d) => <TokenActions key={d._id} token={d} />,
    },
  ];

  let basename = '/';
  if (window.blocklet?.prefix) {
    basename = window.blocklet.prefix;
  }

  const onAdd = () => {
    setShowAddDialog(true);
  };

  return (
    <Div maxWidth="lg">
      <div className="header">
        <Typography component="h2" variant="h5" className="header-title">
          <img src={`${basename}images/logo.png`} alt="" className="header-logo" />
          {t('title')}
        </Typography>
        <div className="header-addons">
          <Button onClick={onAdd} variant="contained" color="primary" size="small" rounded>
            <IconAdd fontSize="small" />
            {t('add')}
          </Button>
          <LocaleSelector size={28} showText={false} className="addon-locale" />
        </div>
      </div>
      <div className="main">
        <TableStyle className="token-list">
          <MaterialTable
            title={t('available')}
            data={info.data}
            icons={{ ...TableIcons }}
            options={{
              header: true,
              emptyRowsWhenPaging: false,
              actionsColumnIndex: -1,
              tableLayout: 'auto',
              maxBodyHeight: '100%',
              pageSize,
              pageSizeOptions: [10, 20, 50, 100],
            }}
            localization={{
              toolbar: { searchPlaceholder: t('search') },
              body: {
                emptyDataSourceMessage: t('noData'),
              },
            }}
            onOrderChange={onSortChange}
            onChangeRowsPerPage={onPageSizeChange}
            columns={columns}
          />
        </TableStyle>
      </div>
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

  .header-addons,
  .header-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .header-addons {
    .addon-locale {
      margin-left: 16px;
    }
  }

  .header-title {
    .header-logo {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      margin-right: 8px;
    }
  }

  .main {
    .MuiPaper-root-5 {
      box-shadow: none;
      border: 1px solid #efefef;
    }
  }
`;
