import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import { App } from './App';
import { I18nProvider } from './i18n';
import { installSafeErrorToasts } from '@/lib/safe-toasts';

installSafeErrorToasts();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
