import PropTypes from 'prop-types';
import { useState } from 'react';

import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@mui/material';

import Button from '@arcblock/ux/lib/Button';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { styled, useTheme } from '@arcblock/ux/lib/Theme';

import { formatError } from '../libs/util';

export default function ConfirmDialog({
  title,
  description,
  showCancel = true,
  cancel = '',
  confirm = 'Confirm',
  color = 'primary',
  params: initialParams = {},
  onCancel = () => {},
  onConfirm,
}) {
  const [params, setParams] = useState(initialParams);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t: changeLocale } = useLocaleContext();
  const theme = useTheme();

  const onCallback = async (cb) => {
    if (typeof cb === 'function') {
      setLoading(true);
      try {
        await cb(params);
        setOpen(false);
      } catch (err) {
        setError(formatError(err));
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  const t = typeof title === 'function' ? title() : title;
  const d = typeof description === 'function' ? description(params, setParams, setError) : description;

  const isBreakpointsDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <StyledDialog onClick={handleClick} fullScreen={isBreakpointsDownSm} open={open}>
      <DialogTitle>{t}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{d}</DialogContentText>
        {!!error && (
          <Alert severity="error" sx={{ width: '100%', marginTop: 8 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        {showCancel && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onCallback(onCancel);
            }}
            color="inherit"
            data-cy="cancel-confirm-dialog"
            rounded
            size="small">
            {cancel || changeLocale('common.cancel')}
          </Button>
        )}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onCallback(onConfirm);
          }}
          color={color}
          size="small"
          disabled={params.__disableConfirm || loading}
          variant="contained"
          data-cy="submit-confirm-dialog"
          autoFocus
          rounded>
          {loading && <CircularProgress size={16} />}
          {confirm}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.any.isRequired,
  description: PropTypes.any.isRequired, // can be a function that renders different content based on params
  showCancel: PropTypes.bool,
  cancel: PropTypes.string,
  color: PropTypes.string,
  confirm: PropTypes.string,
  params: PropTypes.object, // This object holds states managed in the dialog
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
};

const StyledDialog = styled(Dialog)`
  .Mui-disabled {
    color: rgba(0, 0, 0, 0.26) !important;
    box-shadow: none;
    background-color: rgba(0, 0, 0, 0.12) !important;
  }
`;
