import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { VehicleProvider } from './context/VehicleContext';
import { TripProvider } from './context/TripContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <VehicleProvider>
        <TripProvider>
          <App />
        </TripProvider>
      </VehicleProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
