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
import { loginSchema, truckerRegisterSchema, brokerRegisterSchema } from "@shared/schema";

export default function AuthPage() {
  const { user, loginMutation, truckerRegisterMutation, brokerRegisterMutation } = useAuth();
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

  // Trucker registration form
  const truckerRegForm = useForm<z.infer<typeof truckerRegisterSchema>>({
    resolver: zodResolver(truckerRegisterSchema),
    defaultValues: {
      userType: "trucker",
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  function onTruckerRegSubmit(values: z.infer<typeof truckerRegisterSchema>) {
    truckerRegisterMutation.mutate(values);
  }

  // Broker registration form
  const brokerRegForm = useForm<z.infer<typeof brokerRegisterSchema>>({
    resolver: zodResolver(brokerRegisterSchema),
    defaultValues: {
      userType: "broker",
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      companyName: "",
      companyAddress: "",
      companyCity: "",
      companyState: "",
      companyZip: "",
    },
  });

  function onBrokerRegSubmit(values: z.infer<typeof brokerRegisterSchema>) {
    // For debugging - log the form values and any validation errors
    console.log("Broker registration form values:", values);
    console.log("Form errors:", brokerRegForm.formState.errors);

    try {
      // Perform manual validation for critical fields
      const validationErrors: Record<string, { message: string }> = {};

      // Validate company name
      if (!values.companyName || values.companyName.trim() === '') {
        validationErrors.companyName = {
          message: 'Company name is required'
        };
      }

      // Check if we have any validation errors
      if (Object.keys(validationErrors).length > 0) {
        // Set all validation errors
        Object.entries(validationErrors).forEach(([field, error]) => {
          brokerRegForm.setError(field as any, error);
        });
        return;
      }

      // Log the valid data before submission
      console.log("Submitting broker registration with valid data:", {
        ...values,
        password: "[REDACTED]",
        confirmPassword: "[REDACTED]"
      });

      // Submit if validation passes
      brokerRegisterMutation.mutate(values);
    } catch (error) {
      console.error("Error in broker registration form submission:", error);
    }
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
                        <Form {...truckerRegForm}>
                          <form onSubmit={truckerRegForm.handleSubmit(onTruckerRegSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                  control={truckerRegForm.control}
                                  name="firstName"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={truckerRegForm.control}
                                  name="lastName"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>

                            <FormField
                                control={truckerRegForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={truckerRegForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="(555) 123-4567" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={truckerRegForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Username</FormLabel>
                                      <FormControl>
                                        <Input placeholder="johndoe" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                  control={truckerRegForm.control}
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

                              <FormField
                                  control={truckerRegForm.control}
                                  name="confirmPassword"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                          <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>

                            <FormField
                                control={truckerRegForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Address</FormLabel>
                                      <FormControl>
                                        <Input placeholder="123 Main St" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                  control={truckerRegForm.control}
                                  name="city"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Los Angeles" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={truckerRegForm.control}
                                  name="state"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                          <Input placeholder="CA" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={truckerRegForm.control}
                                  name="zip"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>ZIP</FormLabel>
                                        <FormControl>
                                          <Input placeholder="90001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={truckerRegisterMutation.isPending}
                            >
                              {truckerRegisterMutation.isPending ? "Creating account..." : "Create account"}
                            </Button>
                          </form>
                        </Form>
                    ) : (
                        <Form {...brokerRegForm}>
                          {/* Debugging: Display the current companyName value */}
                          <div className="text-xs text-gray-500">
                            Current company name value: "{brokerRegForm.watch("companyName")}"
                          </div>
                          <form onSubmit={brokerRegForm.handleSubmit(onBrokerRegSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                  control={brokerRegForm.control}
                                  name="firstName"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={brokerRegForm.control}
                                  name="lastName"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>

                            <FormField
                                control={brokerRegForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={brokerRegForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="(555) 123-4567" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={brokerRegForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Username</FormLabel>
                                      <FormControl>
                                        <Input placeholder="johndoe" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                  control={brokerRegForm.control}
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

                              <FormField
                                  control={brokerRegForm.control}
                                  name="confirmPassword"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                          <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="company-name" className="text-sm font-medium">
                                Company Name
                              </label>
                              <input
                                  id="company-name"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Acme Shipping Inc."
                                  value={brokerRegForm.watch("companyName") || ""}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    console.log("Company name changing to:", newValue);
                                    brokerRegForm.setValue("companyName", newValue, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                      shouldTouch: true
                                    });
                                  }}
                              />
                              {brokerRegForm.formState.errors.companyName && (
                                  <p className="text-sm font-medium text-destructive">
                                    {brokerRegForm.formState.errors.companyName.message}
                                  </p>
                              )}
                            </div>

                            <FormField
                                control={brokerRegForm.control}
                                name="companyAddress"
                                render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Company Address</FormLabel>
                                      <FormControl>
                                        <Input placeholder="123 Business Ave" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                  control={brokerRegForm.control}
                                  name="companyCity"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Chicago" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={brokerRegForm.control}
                                  name="companyState"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                          <Input placeholder="IL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={brokerRegForm.control}
                                  name="companyZip"
                                  render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>ZIP</FormLabel>
                                        <FormControl>
                                          <Input placeholder="60601" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={brokerRegisterMutation.isPending}
                            >
                              {brokerRegisterMutation.isPending ? "Creating account..." : "Create account"}
                            </Button>
                          </form>
                        </Form>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative w-0 flex-1">
            <img
                className="absolute inset-0 h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2255&q=80"
                alt="Trucks on the road"
            />
            <div className="absolute inset-0 bg-primary-700 mix-blend-multiply opacity-50"></div>
            <div className="absolute inset-0 flex flex-col justify-center p-12 text-white">
              <h2 className="text-4xl font-bold mb-4">TruckLink</h2>
              <p className="text-xl">
                {activeTab === "login"
                    ? "Sign in to connect with shippers and truckers across the country."
                    : userType === "trucker"
                        ? "Register as a trucker to find shipping jobs and grow your business."
                        : "Register as a broker to find reliable truckers and streamline your logistics."
                }
              </p>
              <ul className="mt-8 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-300">✓</span>
                  Simplified logistics management
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-300">✓</span>
                  Secure messaging and bookings
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-300">✓</span>
                  Access nationwide shipping opportunities
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Footer />
      </div>
  );
}
