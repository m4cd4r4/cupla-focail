import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { App } from './App';
import { Embed } from './Embed';
import { LangProvider } from './lang';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/embed" element={<Embed />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  </StrictMode>,
);
