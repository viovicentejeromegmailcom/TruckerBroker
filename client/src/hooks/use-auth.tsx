import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, LoginInput, TruckerRegisterInput, BrokerRegisterInput } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginInput>;
  logoutMutation: UseMutationResult<void, Error, void>;
  truckerRegisterMutation: UseMutationResult<SelectUser, Error, TruckerRegisterInput>;
  brokerRegisterMutation: UseMutationResult<SelectUser, Error, BrokerRegisterInput>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });

      // Redirect to appropriate dashboard based on user type
      if (user.userType === "trucker") {
        setLocation("/trucker/dashboard");
      } else if (user.userType === "broker") {
        setLocation("/broker/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const truckerRegisterMutation = useMutation({
    mutationFn: async (credentials: TruckerRegisterInput) => {
      // Log the submitted data for debugging
      console.log("Registering trucker with data:", {
        ...credentials,
        password: "[REDACTED]", // Don't log the password
        confirmPassword: "[REDACTED]" // Don't log the confirm password
      });

      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        return await res.json();
      } catch (error) {
        console.error("Trucker registration error:", error);
        throw error;
      }
    },
    onSuccess: (response: any) => {
      // Don't auto-login after registration
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      // Redirect to the registration success page with email info
      setLocation(`/registration-success?email=${encodeURIComponent(response.email)}&message=${encodeURIComponent(response.message)}`);
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please check all fields and try again.",
        variant: "destructive",
      });
    },
  });

  const brokerRegisterMutation = useMutation({
    mutationFn: async (credentials: BrokerRegisterInput) => {
      // Log the submitted data for debugging
      console.log("Registering broker with data:", {
        ...credentials,
        password: "[REDACTED]", // Don't log the password
        confirmPassword: "[REDACTED]" // Don't log the confirm password
      });

      // Validate companyName before sending request
      if (!credentials.companyName || credentials.companyName.trim() === '') {
        throw new Error("Company name is required");
      }

      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        return await res.json();
      } catch (error) {
        console.error("Broker registration error:", error);
        throw error;
      }
    },
    onSuccess: (response: any) => {
      // Don't auto-login after registration
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      // Redirect to the registration success page with email info
      setLocation(`/registration-success?email=${encodeURIComponent(response.email)}&message=${encodeURIComponent(response.message)}`);
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please check all fields and try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
      <AuthContext.Provider
          value={{
            user: user ?? null,
            isLoading,
            error,
            loginMutation,
            logoutMutation,
            truckerRegisterMutation,
            brokerRegisterMutation,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
