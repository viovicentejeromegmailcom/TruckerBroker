import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Building } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@shared/schema";
import TruckerRegistrationForm from "@/components/auth/trucker-registration-form";
import BrokerRegistrationForm from "@/components/auth/broker-registration-form";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState<"trucker" | "broker">("trucker");

  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const typeParam = searchParams.get("type");
  const verifiedParam = searchParams.get("verified") === "true";

  // State for displaying verification success message
  const [isVerified, setIsVerified] = useState(false);

  // Check if account was just verified
  useEffect(() => {
    if (verifiedParam) {
      setIsVerified(true);
      setActiveTab("login");
      // Clear the URL parameter without refreshing the page
      window.history.replaceState({}, document.title, "/auth");
    }
  }, [verifiedParam]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.userType === "trucker") {
        setLocation("/trucker/dashboard");
      } else {
        setLocation("/broker/dashboard");
      }
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (typeParam === "trucker" || typeParam === "broker") {
      setActiveTab("register");
      setUserType(typeParam);
    }
  }, [typeParam]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-grow flex">
          <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              <div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {activeTab === "login" ? (
                      <>
                        Or{" "}
                        <button
                            className="font-medium text-primary-600 hover:text-primary-500"
                            onClick={() => setActiveTab("register")}
                        >
                          create a new account
                        </button>
                      </>
                  ) : (
                      <>
                        Already have an account?{" "}
                        <button
                            className="font-medium text-primary-600 hover:text-primary-500"
                            onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </button>
                      </>
                  )}
                </p>
              </div>

              <div className="mt-8">
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-6">
                    {isVerified && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                          <div className="flex items-center gap-2 font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Email Verified Successfully
                          </div>
                          <p className="mt-1 text-sm">
                            Your email has been verified. Your account is now awaiting administrator approval. You will be notified once your account is approved.
                          </p>
                        </div>
                    )}
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Sign in"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register" className="mt-6">
                    <div className="mb-6">
                      <div className="text-sm font-medium mb-2">I am a:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant={userType === "trucker" ? "default" : "outline"}
                            className="h-20 flex flex-col gap-2"
                            onClick={() => setUserType("trucker")}
                        >
                          <Truck className="h-6 w-6" />
                          <span>Trucker</span>
                        </Button>
                        <Button
                            type="button"
                            variant={userType === "broker" ? "default" : "outline"}
                            className="h-20 flex flex-col gap-2"
                            onClick={() => setUserType("broker")}
                        >
                          <Building className="h-6 w-6" />
                          <span>Broker</span>
                        </Button>
                      </div>
                    </div>

                    {userType === "trucker" ? (
                        <TruckerRegistrationForm />
                    ) : (
                        <BrokerRegistrationForm />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white">
              <h2 className="text-4xl font-bold mb-6">
                Truck Management Portal
              </h2>
              <p className="text-xl max-w-2xl text-center">
                Connect with trusted brokers and find the best shipping deals for your business.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-8 max-w-3xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">Verified Shippers</h3>
                  <p className="text-sm opacity-80">All brokers are verified for credibility and reliability</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">Real-time Tracking</h3>
                  <p className="text-sm opacity-80">Monitor your shipments in real-time across the country</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">Secure Payments</h3>
                  <p className="text-sm opacity-80">Secure payment processing with protection guarantees</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
  );
}