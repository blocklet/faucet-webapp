import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Center from '@arcblock/ux/lib/Center';

import { useTokenContext } from '../contexts/token';

export default function HomePage() {
  const info = useTokenContext();

  if (info.loading) {
    return (
      <Center>
        <CircularProgress />
      </Center>
    );
  }

  return <pre>{JSON.stringify(info.data, null, 2)}</pre>;
}
