/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import Footer from '@arcblock/ux/lib/Footer';
import LocaleSelector from '@arcblock/ux/lib/Locale/selector';
import BaseLayout from '@arcblock/ux/lib/Layout';

export default function Layout({ title, brand, links, footer, baseUrl, children, contentOnly, ...rest }) {
  if (contentOnly) {
    return <Container>{children}</Container>;
  }

  let prefix = window.env && window.env.apiPrefix ? `${window.env.apiPrefix}` : '/';
  prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';

  return (
    <BaseLayout
      showLogo
      homeUrl={prefix}
      title={title}
      brand={brand}
      variant="border"
      addons={<LocaleSelector data-cy="locale-addon" size={26} showText={false} className="locale-addon" />}>
      <Container style={{ marginTop: 16 }}>{children}</Container>
    </BaseLayout>
  );
}

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  brand: PropTypes.any.isRequired,
  links: PropTypes.array,
  children: PropTypes.any.isRequired,
  baseUrl: PropTypes.string,
  footer: PropTypes.any,
  contentOnly: PropTypes.bool,
};

Layout.defaultProps = {
  contentOnly: false,
  baseUrl: '',
  links: [],
  footer: (
    <Container>
      <Footer />
    </Container>
  ),
};
