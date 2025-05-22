import { useState } from 'react';
import PropTypes from 'prop-types';

import QRCode from 'qrcode.react';
import Button from '@arcblock/ux/lib/Button';
import ClickToCopy from '@arcblock/ux/lib/ClickToCopy';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import ConfirmDialog from './confirm';
import { useTokenContext } from '../contexts/token';
import { Box } from '@mui/material';

export default function DonateToken({ token }) {
  const [open, setOpen] = useState(false);
  const info = useTokenContext();
  const { t } = useLocaleContext();

  const content = {
    title: t('donateDesc'),
    description: (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 2,
        }}>
        <QRCode
          value={`abt://abtwallet.io/i?did=did:abt:${info.env.address}&action=didRecognize&chainID=${token.chainId}`}
          size={200}
          renderAs="svg"
          level="M"
        />
        <ClickToCopy>{info.env.address}</ClickToCopy>
      </Box>
    ),
    confirm: t('ok'),
    cancel: t('cancel'),
    onConfirm: () => setOpen(false),
    onCancel: () => setOpen(false),
  };

  return (
    <>
      <Button variant="contained" size="small" color="primary" rounded onClick={() => setOpen(true)}>
        {t('donate')}
      </Button>
      {open && (
        <ConfirmDialog
          title={content.title}
          description={content.description}
          confirm={content.confirm}
          cancel={content.cancel}
          params={content.params}
          onConfirm={content.onConfirm}
          onCancel={content.onCancel}
        />
      )}
    </>
  );
}

DonateToken.propTypes = {
  token: PropTypes.object.isRequired,
};
