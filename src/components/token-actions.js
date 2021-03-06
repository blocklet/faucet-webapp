import React from 'react';

import ClaimToken from './claim';
import DonateToken from './donate';

export default function TokenActions(props) {
  return (
    <>
      <ClaimToken {...props} />
      <DonateToken {...props} />
    </>
  );
}
