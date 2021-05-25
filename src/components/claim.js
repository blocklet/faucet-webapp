/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import Auth from '@arcblock/did-react/lib/Auth';
import Button from '@arcblock/ux/lib/Button';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import { useTokenContext } from '../contexts/token';
import { getWebWalletUrl } from '../libs/util';

export default function ClaimToken({ token }) {
  const { t, locale } = useLocaleContext();
  const info = useTokenContext();

  const { enqueueSnackbar } = useSnackbar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [type, setType] = useState('hour');

  const anchorRef = useRef(null);
  const onToggle = () => {
    setDropdownOpen((prevOpen) => !prevOpen);
  };
  const onClose = (e) => {
    if (anchorRef.current && anchorRef.current.contains(e.target)) {
      return;
    }

    setDropdownOpen(false);
  };

  const onClaimStart = (x) => {
    setType(x);
    setClaimOpen(true);
  };
  const onClaimSuccess = () => {
    enqueueSnackbar(t('claimed'), { autoHideDuration: 5000, variant: 'success' });
  };

  const webWalletUrl = getWebWalletUrl();

  return (
    <React.Fragment>
      <Button
        size="small"
        variant="contained"
        color="primary"
        aria-label="split button"
        rounded
        ref={anchorRef}
        data-cy="open-install-menu"
        onClick={onToggle}>
        {t('claim')}
        <ArrowDropDownIcon fontSize="small" />
      </Button>
      <Popper
        open={dropdownOpen}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        disablePortal={false}
        className="popper">
        <Paper>
          <ClickAwayListener onClickAway={onClose}>
            <MenuList id="split-button-menu">
              <MenuItem data-cy="open-install-form" onClick={() => onClaimStart('hour')}>
                {t('type.hour', { ...token, ...info.env.types.hour })}
              </MenuItem>
              <MenuItem data-cy="open-install-form" onClick={() => onClaimStart('day')}>
                {t('type.day', { ...token, ...info.env.types.day })}
              </MenuItem>
              <MenuItem data-cy="open-install-form" onClick={() => onClaimStart('week')}>
                {t('type.week', { ...token, ...info.env.types.week })}
              </MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
      {claimOpen && (
        <Auth
          responsive
          className="faucet-auth"
          action="claim"
          checkFn={info.api.get}
          checkTimeout={5 * 60 * 1000}
          webWalletUrl={webWalletUrl}
          onSuccess={onClaimSuccess}
          onClose={() => setClaimOpen(false)}
          locale={locale}
          messages={{
            title: t('dialog.claim.title'),
            scan: t('dialog.claim.scan'),
            confirm: t('dialog.claim.confirm'),
            success: t('dialog.claim.success'),
          }}
          extraParams={{ type, id: token._id }}
        />
      )}
    </React.Fragment>
  );
}

ClaimToken.propTypes = {
  token: PropTypes.object.isRequired,
};

ClaimToken.defaultProps = {};
