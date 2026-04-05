import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/login';
import DashboardPage from '../pages/dashboard';
import ComponentListPage from '../pages/component/ComponentListPage';
import ComponentDetailPage from '../pages/component/ComponentDetailPage';
import ComponentFormPage from '../pages/component/ComponentFormPage';
import CategoryPage from '../pages/component/CategoryPage';
import StockListPage from '../pages/inventory/StockListPage';
import BatchListPage from '../pages/inventory/BatchListPage';
import WarehousePage from '../pages/inventory/WarehousePage';
import StockLockPage from '../pages/inventory/StockLockPage';
import PurchaseOrderPage from '../pages/inbound/PurchaseOrderPage';
import InboundOrderPage from '../pages/inbound/InboundOrderPage';
import IqcPage from '../pages/inbound/IqcPage';
import SupplierPage from '../pages/inbound/SupplierPage';
import OutboundOrderPage from '../pages/outbound/OutboundOrderPage';
import BomPage from '../pages/outbound/BomPage';
import ReportPage from '../pages/report/ReportPage';
import AlertPage from '../pages/alert/AlertPage';
import UserPage from '../pages/system/UserPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'components', element: <ComponentListPage /> },
      { path: 'components/add', element: <ComponentFormPage /> },
      { path: 'components/:id', element: <ComponentDetailPage /> },
      { path: 'components/:id/edit', element: <ComponentFormPage /> },
      { path: 'categories', element: <CategoryPage /> },
      { path: 'inventory/stocks', element: <StockListPage /> },
      { path: 'inventory/batches', element: <BatchListPage /> },
      { path: 'inventory/warehouses', element: <WarehousePage /> },
      { path: 'inventory/locks', element: <StockLockPage /> },
      { path: 'inbound/purchase-orders', element: <PurchaseOrderPage /> },
      { path: 'inbound/orders', element: <InboundOrderPage /> },
      { path: 'inbound/iqc', element: <IqcPage /> },
      { path: 'inbound/suppliers', element: <SupplierPage /> },
      { path: 'outbound/orders', element: <OutboundOrderPage /> },
      { path: 'outbound/boms', element: <BomPage /> },
      { path: 'reports', element: <ReportPage /> },
      { path: 'alerts', element: <AlertPage /> },
      { path: 'system/users', element: <UserPage /> },
    ],
  },
]);

export default router;
