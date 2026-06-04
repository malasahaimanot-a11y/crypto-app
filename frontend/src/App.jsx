import { Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext.jsx';
import WalletLayout from './components/wallet/WalletLayout.jsx';
import OnboardingPage from './pages/wallet/OnboardingPage.jsx';
import DashboardPage from './pages/wallet/DashboardPage.jsx';
import SendPage from './pages/wallet/SendPage.jsx';
import ReceivePage from './pages/wallet/ReceivePage.jsx';
import ProtectionPage from './pages/wallet/ProtectionPage.jsx';
import HistoryPage from './pages/wallet/HistoryPage.jsx';
import DepositPage from './pages/wallet/DepositPage.jsx';
import SettingsPage from './pages/wallet/SettingsPage.jsx';

export default function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<WalletLayout />}>
          <Route index              element={<DashboardPage />} />
          <Route path="home"        element={<DashboardPage />} />
          <Route path="onboard"     element={<OnboardingPage />} />
          <Route path="send"        element={<SendPage />} />
          <Route path="receive"     element={<ReceivePage />} />
          <Route path="protection"  element={<ProtectionPage />} />
          <Route path="history"     element={<HistoryPage />} />
          <Route path="deposit"     element={<DepositPage />} />
          <Route path="settings"    element={<SettingsPage />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </WalletProvider>
  );
}
