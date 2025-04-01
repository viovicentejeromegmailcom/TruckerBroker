import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminAuth from "@/pages/admin-auth";
import AdminDashboard from "@/pages/admin-dashboard";
import TruckerDashboard from "@/pages/trucker-dashboard";
import BrokerDashboard from "@/pages/broker-dashboard";
import JobSearch from "@/pages/job-search";
import JobDetails from "@/pages/job-details";
import PostJob from "@/pages/post-job";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import RegistrationSuccess from "@/pages/registration-success";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Custom AdminProtectedRoute component that only allows admin users
function AdminProtectedRoute({ component: Component, ...rest }: any) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Redirect to="/admin/auth" />;
    }

    if (user.userType !== "admin") {
        return <Redirect to="/" />;
    }

    return <Component {...rest} />;
}

function Router() {
    return (
        <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/admin/auth" component={AdminAuth} />
            <Route path="/registration-success" component={RegistrationSuccess} />
            <AdminProtectedRoute path="/admin" component={AdminDashboard} />

            <ProtectedRoute path="/trucker/dashboard" component={TruckerDashboard} />
            <ProtectedRoute path="/broker/dashboard" component={BrokerDashboard} />
            <ProtectedRoute path="/jobs" component={JobSearch} />
            <ProtectedRoute path="/jobs/:id" component={JobDetails} />
            <ProtectedRoute path="/post-job" component={PostJob} />
            <ProtectedRoute path="/messages" component={Messages} />
            <ProtectedRoute path="/profile" component={Profile} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router />
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
