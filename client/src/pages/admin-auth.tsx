import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import AdminLoginForm from "@/components/auth/admin-login-form";

export default function AdminAuth() {
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect to admin dashboard for admins, or home for other users
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (user) {
    if (user.userType === "admin") {
      return <Redirect to="/admin" />;
    } else {
      return <Redirect to="/" />;
    }
  }

  return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Login Form */}
            <div className="flex items-center justify-center">
              <AdminLoginForm />
            </div>

            {/* Admin Hero Section */}
            <div className="hidden lg:flex flex-col justify-center">
              <div className="mb-6">
                <h1 className="text-4xl font-bold tracking-tight">
                  Admin Portal
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-lg">
                  Access the administrative controls for LogisticsHub. Manage users, review registrations, and maintain platform operations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">User Management</h3>
                    <p className="text-muted-foreground text-sm">Approve registrations, manage accounts, and handle user permissions</p>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Platform Monitoring</h3>
                    <p className="text-muted-foreground text-sm">View platform metrics, system health, and operational statistics</p>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M12 2H2v10h10V2Z" />
                      <path d="M22 12H12v10h10V12Z" />
                      <path d="M22 2h-8v8h8V2Z" />
                      <path d="M10 12H2v8h8v-8Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">System Configuration</h3>
                    <p className="text-muted-foreground text-sm">Configure platform settings, integrations, and security parameters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}