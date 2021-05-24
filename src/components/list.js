/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import joinURL from 'url-join';
import { Link } from 'react-router-dom';
import { isFreeBlocklet } from '@blocklet/meta/lib/payment';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

import Button from '@arcblock/ux/lib/Button';
import Grid from '@material-ui/core/Grid';
import ExternalLink from '@material-ui/core/Link';
import useTheme from '@material-ui/core/styles/useTheme';

import Blocklet from '@arcblock/ux/lib/Blocklet';

import { formatRegistryLogoPath, formatTimeFromNow } from '../libs/util';

function BlockletItem({ x }) {
  const { t } = useContext(LocaleContext);
  const theme = useTheme();
  let logoUrl = '';
  let prefix = window.env && window.env.apiPrefix ? `${window.env.apiPrefix}` : '/';
  prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';
  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }
  if (x.logo) {
    logoUrl = joinURL(apiPrefix, formatRegistryLogoPath(x.did, x.logo));
  } else {
    logoUrl = joinURL(apiPrefix, '/images/blocklet.png');
  }

  const { origin } = window.location;
  const isFree = isFreeBlocklet(x);
  let url;
  if (isFree) {
    url = `https://install.arcblock.io/?action=blocklet-install&meta_url=${encodeURIComponent(
      `${origin}${prefix}api/blocklets/${x.did}/blocklet.json`
    )}`;
  } else {
    url = `${prefix}store/purchase/${x.nftFactory}`;
  }

  function onClickButton(e) {
    e.stopPropagation();
    return false;
  }

  return (
    <Blocklet
      title={x.title || x.name}
      description={x.description}
      cover={logoUrl}
      addons={[
        { icon: 'cube', value: `v${x.version}` },
        { icon: 'clock', value: formatTimeFromNow(x.lastPublishedAt) },
        { icon: 'cloud-download', value: x.stats?.downloads || 0, pretty: true },
      ]}
      type={x.group}
      tags={x.keywords || []}
      button={
        <Button
          component={ExternalLink}
          size="small"
          variant="contained"
          color="primary"
          rounded
          target="__blank"
          href={url}
          onClick={onClickButton}
          style={{ backgroundColor: 'rgba(79, 106, 246, 0.06)', color: theme.palette.primary.main }}>
          {isFree ? t('common.install') : t('common.purchase')}
        </Button>
      }
    />
  );
}

BlockletItem.propTypes = {
  x: PropTypes.object.isRequired,
};

export default function BlockletList({ blocklets, ...rest }) {
  function onClickLink(e) {
    if (!e.currentTarget.contains(e.target)) {
      e.preventDefault();
      return false;
    }
    return true;
  }
  return (
    <Grid container spacing={4} {...rest}>
      {blocklets.map((x) => (
        <Grid item lg={4} md={6} sm={6} xs={12} key={x.did} data-blocklet-did={x.did}>
          <Link
            to={`/blocklet/${x.did}`}
            data-cy="blocklet-item"
            style={{ color: 'initial', textDecoration: 'none' }}
            onClick={onClickLink}>
            <BlockletItem x={x} />
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}

BlockletList.propTypes = {
  blocklets: PropTypes.array.isRequired,
};

BlockletList.defaultProps = {};
