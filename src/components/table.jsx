import PropTypes from 'prop-types';
import { styled } from '@arcblock/ux/lib/Theme';

export default function TableStyle({ children, ...rest }) {
  return <Div {...rest}>{children}</Div>;
}

TableStyle.propTypes = {
  children: PropTypes.node.isRequired,
};

const Div = styled('div')`
  .MuiToolbar-root {
    background: transparent;
  }
  .MuiTableCell-root {
    padding-left: 16px;
    padding-right: 16px;
    border-bottom-width: 1px;
  }
`;
