/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
import get from 'lodash/get';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import useLocalStorage from 'react-use/lib/useLocalStorage';

import { AddOutlined as IconAdd } from '@mui/icons-material';
import { CircularProgress, Container, TextField, Typography } from '@mui/material';

import Button from '@arcblock/ux/lib/Button';
import Center from '@arcblock/ux/lib/Center';
import ClickToCopy from '@arcblock/ux/lib/ClickToCopy';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import LocaleSelector from '@arcblock/ux/lib/Locale/selector';
import { styled } from '@arcblock/ux/lib/Theme';

import DataTable from '@arcblock/ux/lib/Datatable';

import ConfirmDialog from '../components/confirm';
import TableStyle from '../components/table';
import TokenActions from '../components/token-actions';
import { useTokenContext } from '../contexts/token';
import usePersistentSort from '../hooks/persistent-sort';
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
      name: 'symbol',
      label: t('symbol'),
      width: 60,
      options: {
        sort: true,
        sortDirection: sortDirections[1],
      },
    },
    {
      name: 'address',
      label: t('address'),
      width: 120,
      options: {
        sortDirection: sortDirections[2],
        customBodyRender: (value) => (value ? <ClickToCopy>{value}</ClickToCopy> : '-'),
      },
    },
    {
      name: 'faucetAmount',
      label: t('amount'),
      width: 30,
      options: {
        sortDirection: sortDirections[3],
      },
    },
    {
      name: 'chainId',
      label: t('chain'),
      width: 30,
      options: {
        sort: true,
        sortDirection: sortDirections[4],
      },
    },
    {
      name: 'actions',
      label: t('actions'),
      width: 120,
      options: {
        sort: false,
        customBodyRender: (value, tableMeta) => <TokenActions key={tableMeta.rowData._id} token={tableMeta.rowData} />,
      },
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
          <DataTable
            title={t('available')}
            data={info.data}
            columns={columns}
            options={{
              search: true,
              searchPlaceholder: t('search'),
              rowsPerPage: pageSize,
              rowsPerPageOptions: [10, 20, 50, 100],
              textLabels: {
                body: {
                  noMatch: t('noData'),
                },
                toolbar: {
                  search: t('search'),
                },
              },
            }}
            onChange={(state, action) => {
              if (action === 'changeRowsPerPage') {
                onPageSizeChange(state.rowsPerPage);
              }
              if (action === 'sort') {
                onSortChange(state.sortOrder);
              }
            }}
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
