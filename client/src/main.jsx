import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { ThemeInit } from '../.flowbite-react/init';
import App from './App';
import './index.css';
import { store } from './store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeInit />
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
