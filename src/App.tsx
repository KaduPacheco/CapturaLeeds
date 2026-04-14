import { lazy, Suspense, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { TooltipProvider } from "./components/ui/Tooltip";
import { Toaster } from "./components/ui/Toaster";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Rotas CRM (Isoladas)
import CrmLayout from "./components/layout/CrmLayout";
import { AuthProvider } from "./features/crm/auth/providers/AuthProvider";
import ProtectedRoute from "./features/crm/auth/components/ProtectedRoute";

const queryClient = new QueryClient();
const LoginPage = lazy(() => import("./pages/crm/LoginPage"));
const DashboardPage = lazy(() => import("./pages/crm/DashboardPage"));
const LeadsPage = lazy(() => import("./pages/crm/LeadsPage"));
const LeadDetailPage = lazy(() => import("./pages/crm/LeadDetailPage"));

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page Pública (Sem peso de Auth) */}
            <Route path="/" element={<HomePage />} />
            
            {/* Contexto de CRM (Isolado) */}
            <Route path="/crm">
              <Route element={<AuthProvider children={<Outlet />} />}>
                <Route path="login" element={renderLazyCrmPage(<LoginPage />)} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<CrmLayout />}>
                    <Route index element={renderLazyCrmPage(<DashboardPage />)} />
                    <Route path="leads" element={renderLazyCrmPage(<LeadsPage />)} />
                    <Route path="leads/:id" element={renderLazyCrmPage(<LeadDetailPage />)} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* Rota não encontrada global */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

function renderLazyCrmPage(page: ReactNode) {
  return (
    <Suspense fallback={<CrmPageLoadingFallback />}>
      {page}
    </Suspense>
  );
}

function CrmPageLoadingFallback() {
  return (
    <div className="flex min-h-[240px] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}

export default App;
