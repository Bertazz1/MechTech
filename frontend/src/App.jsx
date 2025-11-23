import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleForm from './pages/vehicles/VehicleForm';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import PartList from './pages/parts/PartList';
import PartForm from './pages/parts/PartForm';
import RepairServiceList from './pages/repair-services/RepairServiceList';
import RepairServiceForm from './pages/repair-services/RepairServiceForm';
import QuotationList from './pages/quotations/QuotationList';
import QuotationForm from './pages/quotations/QuotationForm';
import ServiceOrderList from './pages/service-orders/ServiceOrderList';
import ServiceOrderForm from './pages/service-orders/ServiceOrderForm';
import InvoiceList from './pages/invoices/InvoiceList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="clients" element={<ClientList />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/edit/:id" element={<ClientForm />} />

            <Route path="vehicles" element={<VehicleList />} />
            <Route path="vehicles/new" element={<VehicleForm />} />
            <Route path="vehicles/edit/:id" element={<VehicleForm />} />

            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/edit/:id" element={<EmployeeForm />} />

            <Route path="parts" element={<PartList />} />
            <Route path="parts/new" element={<PartForm />} />
            <Route path="parts/edit/:id" element={<PartForm />} />

            <Route path="repair-services" element={<RepairServiceList />} />
            <Route path="repair-services/new" element={<RepairServiceForm />} />
            <Route path="repair-services/edit/:id" element={<RepairServiceForm />} />

            <Route path="quotations" element={<QuotationList />} />
            <Route path="quotations/new" element={<QuotationForm />} />
            <Route path="quotations/edit/:id" element={<QuotationForm />} />

            <Route path="service-orders" element={<ServiceOrderList />} />
            <Route path="service-orders/new" element={<ServiceOrderForm />} />
            <Route path="service-orders/edit/:id" element={<ServiceOrderForm />} />

            <Route path="invoices" element={<InvoiceList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
