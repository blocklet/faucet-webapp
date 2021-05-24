/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import joinURL from 'url-join';

import Avatar from '@material-ui/core/Avatar';

import { formatRegistryLogoPath } from '../libs/util';

export default function BlockletAvatar({ blocklet, style, size, ...rest }) {
  let logoUrl = '';
  let prefix = window.env && window.env.apiPrefix ? `${window.env.apiPrefix}` : '/';
  prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';
  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }
  if (blocklet.meta.logo) {
    logoUrl = joinURL(apiPrefix, formatRegistryLogoPath(blocklet.meta.did, blocklet.meta.logo));
  } else {
    logoUrl = joinURL(apiPrefix, '/blocklet.png');
  }

  const setFallBackUrl = (ev) => {
    ev.target.src = `${apiPrefix}/images/blocklet.png`;
  };

  return (
    <Avatar style={Object.assign({ backgroundColor: 'transparent', border: '2px solid #ddd' }, style)} {...rest}>
      <img
        src={logoUrl}
        onError={setFallBackUrl}
        alt={blocklet.meta.name}
        style={{ width: size, backgroundColor: '#fff' }}
      />
    </Avatar>
  );
}

BlockletAvatar.propTypes = {
  blocklet: PropTypes.object.isRequired,
  style: PropTypes.object,
  size: PropTypes.number,
};

BlockletAvatar.defaultProps = {
  style: {},
  size: 40,
};
