import React, { useContext } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Icon from '@arcblock/ux/lib/Icon';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';

export default function Stats({ stats, ...rest }) {
  const { t } = useContext(LocaleContext);
  stats.downloads = stats.downloads || 0;
  return (
    <Div component="p" {...rest}>
      <span className="blocklet__stat" title={t('common.download')}>
        <Icon name="arrow-to-bottom" size={14} className="blocklet__stat__icon" />
        {stats.downloads}
      </span>
    </Div>
  );
}

Stats.propTypes = {
  stats: PropTypes.object.isRequired,
};

const Div = styled(Typography)`
  .blocklet__stat {
    margin-right: 16px;
    font-size: 14px;
    font-weight: 500;
    color: #999;
    &:last-child {
      // 理论上需要设置成0，但视觉效果不是很好，加上了一个小的间距
      margin-right: 5px;
    }

    .blocklet__stat__icon {
      margin-right: 4px;
      color: inherit !important;
    }
  }
`;
