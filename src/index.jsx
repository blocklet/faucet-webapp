import React from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line import/no-named-as-default
import App from './app';

const root = createRoot(document.getElementById('app'));
root.render(<App />);
