import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import { WalletProvider } from './contexts/WalletContext.jsx';
import Layout from './components/Layout.jsx';
import WalletLayout from './components/wallet/WalletLayout.jsx';
import MarketPage from './pages/MarketPage.jsx';
import CoinDetailPage from './pages/CoinDetailPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/wallet/OnboardingPage.jsx';
import DashboardPage from './pages/wallet/DashboardPage.jsx';
import SendPage from './pages/wallet/SendPage.jsx';
import ReceivePage from './pages/wallet/ReceivePage.jsx';
import ProtectionPage from './pages/wallet/ProtectionPage.jsx';
import HistoryPage from './pages/wallet/HistoryPage.jsx';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        {/* ── Existing portfolio viewer (dark theme) ─────── */}
        <Route path="/"          element={<Layout><MarketPage /></Layout>} />
        <Route path="/coin/:id"  element={<Layout><CoinDetailPage /></Layout>} />
        <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
        <Route path="/settings"  element={<Layout><SettingsPage /></Layout>} />

        {/* ── Bitcoin wallet (Bitcoin theme) ─────────────── */}
        <Route path="/wallet" element={<WalletProvider><WalletLayout /></WalletProvider>}>
          <Route index              element={<DashboardPage />} />
          <Route path="onboard"     element={<OnboardingPage />} />
          <Route path="send"        element={<SendPage />} />
          <Route path="receive"     element={<ReceivePage />} />
          <Route path="protection"  element={<ProtectionPage />} />
          <Route path="history"     element={<HistoryPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
