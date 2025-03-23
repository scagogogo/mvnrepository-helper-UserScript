import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { theme } from './styles/theme';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ConfigProvider theme={theme}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </ConfigProvider>
    </HelmetProvider>
  );
};

export default App;
