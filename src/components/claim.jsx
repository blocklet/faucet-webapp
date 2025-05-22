import PropTypes from 'prop-types';
import { Fragment, useState } from 'react';

import DidConnect from '@arcblock/did-connect/lib/Connect';
import Button from '@arcblock/ux/lib/Button';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';

import { useTokenContext } from '../contexts/token';

export default function ClaimToken({ token }) {
  const { t, locale } = useLocaleContext();
  const info = useTokenContext();

  const [claimOpen, setClaimOpen] = useState(false);
  const [type, setType] = useState('hour');

  const onClaimStart = (x) => {
    setType(x);
    setClaimOpen(true);
  };
  const onClaimSuccess = () => {};
  const vars = { ...info.env.types[type], ...token };

  return (
    <Fragment>
      <Button
        size="small"
        variant="contained"
        color="primary"
        aria-label="split button"
        rounded
        data-cy="open-install-menu"
        onClick={() => onClaimStart('day')}
      >
        {t('claim')}
      </Button>
      <DidConnect
        open={claimOpen}
        popup
        className="faucet-auth"
        action="claim"
        checkFn={info.api.get}
        onSuccess={onClaimSuccess}
        onClose={() => setClaimOpen(false)}
        locale={locale}
        messages={{
          title: t('dialog.claim.title', vars),
          scan: t('dialog.claim.scan', vars),
          confirm: t('dialog.claim.confirm', vars),
          success: t('dialog.claim.success', vars),
        }}
        extraParams={{ type, id: token._id }}
      />
    </Fragment>
  );
}

ClaimToken.propTypes = {
  token: PropTypes.object.isRequired,
};

ClaimToken.defaultProps = {};
