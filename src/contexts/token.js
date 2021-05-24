import React, { useState, useContext } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';

import client from '../libs/api';

const TokenContext = React.createContext({});
const { Provider, Consumer } = TokenContext;

// eslint-disable-next-line react/prop-types
function TokenProvider({ children }) {
  const [, setHasError] = useState(false);
  const [tokens, setTokens] = useState(null);

  const state = useAsyncRetry(async () => {
    try {
      // eslint-disable-next-line no-shadow
      const tokens = await client.get('/api/tokens');
      setTokens(tokens);
      return { tokens };
    } catch (err) {
      setHasError(true);
      return { tokens: [] };
    }
  });

  let items = [];
  if (tokens) {
    items = tokens;
  } else if (state.value) {
    items = state.value.tokens;
  }

  const value = {
    loading: !state.value || state.loading,
    error: state.error,
    refresh: state.retry,
    data: items,
  };

  return <Provider value={{ tokens: value }}>{children}</Provider>;
}

function useTokenContext() {
  const { tokens } = useContext(TokenContext);
  return tokens;
}

export { TokenContext, TokenProvider, Consumer as TokenConsumer, useTokenContext };
