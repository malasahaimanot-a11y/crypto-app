import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import Layout from './components/Layout.jsx';
import MarketPage from './pages/MarketPage.jsx';
import CoinDetailPage from './pages/CoinDetailPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/"            element={<MarketPage />} />
          <Route path="/coin/:id"    element={<CoinDetailPage />} />
          <Route path="/portfolio"   element={<PortfolioPage />} />
          <Route path="/settings"    element={<SettingsPage />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}
