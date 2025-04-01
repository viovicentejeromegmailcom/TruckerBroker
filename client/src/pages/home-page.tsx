import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Building } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();

  const dashboardLink = user && user.userType === "trucker"
      ? "/trucker/dashboard"
      : "/broker/dashboard";

  return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <svg
                  className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                  fill="currentColor"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
              >
                <polygon points="50,0 100,0 50,100 0,100" />
              </svg>

              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-bold text-secondary-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Connecting Truckers with</span>{" "}
                    <span className="block text-primary-500 xl:inline">Shipping Opportunities</span>
                  </h1>
                  <p className="mt-3 text-base text-secondary-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    TruckLink is the platform that connects independent truckers with shipping brokers,
                    streamlining the logistics process for everyone involved.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    {user ? (
                        <Button size="lg" asChild>
                          <Link href={dashboardLink} className="px-8 py-3">
                            Go to Dashboard
                          </Link>
                        </Button>
                    ) : (
                        <>
                          <Button size="lg" asChild>
                            <Link href="/auth" className="px-8 py-3">
                              Get started
                            </Link>
                          </Button>
                          <div className="mt-3 sm:mt-0 sm:ml-3">
                            <Button size="lg" variant="outline" asChild>
                              <Link href="#registration-choice" className="px-8 py-3">
                                Learn more
                              </Link>
                            </Button>
                          </div>
                        </>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img
                className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                src="https://images.unsplash.com/photo-1567199602848-93789a01adb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                alt="Truck on highway"
            />
          </div>
        </div>

        {/* Registration Choice Section */}
        {!user && (
            <div className="py-12 bg-white" id="registration-choice">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center">
                  <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Join TruckLink</h2>
                  <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-secondary-900 sm:text-4xl">
                    Register as a Trucker or Broker
                  </p>
                  <p className="mt-4 max-w-2xl text-xl text-secondary-600 lg:mx-auto">
                    Choose the account type that best fits your needs and start connecting with shipping opportunities today.
                  </p>
                </div>

                <div className="mt-10">
                  <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                    {/* Trucker Card */}
                    <div className="relative bg-white p-6 rounded-lg shadow-lg border border-secondary-200 hover:border-primary-300 transition duration-300 flex flex-col h-full">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-primary-500 rounded-full p-2">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-secondary-900 mb-3">I am a Trucker</h3>
                      <p className="text-secondary-600 mb-4 flex-grow">
                        Register as a trucker to find shipping jobs, manage your schedule, and grow your business.
                      </p>
                      <ul className="mb-6 space-y-2">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-secondary-600">Access to thousands of shipping opportunities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-secondary-600">Set your own schedule and rates</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-secondary-600">Track payments and manage documents</span>
                        </li>
                      </ul>
                      <Link href="/auth?type=trucker">
                        <Button className="mt-auto w-full">Register as Trucker</Button>
                      </Link>
                    </div>

                    {/* Broker Card */}
                    <div className="relative bg-white p-6 rounded-lg shadow-lg border border-secondary-200 hover:border-primary-300 transition duration-300 flex flex-col h-full">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-amber-500 rounded-full p-2">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-secondary-900 mb-3">I am a Broker</h3>
                      <p className="text-secondary-600 mb-4 flex-grow">
                        Register as a broker to find reliable truckers, manage shipments, and streamline your logistics.
                      </p>
                      <ul className="mb-6 space-y-2">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-secondary-600">Access to verified and reliable truckers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-secondary-600">Post jobs and manage shipping schedules</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-secondary-600">Track shipments and manage payments</span>
                        </li>
                      </ul>
                      <Link href="/auth?type=broker">
                        <Button className="mt-auto w-full bg-amber-500 hover:bg-amber-600">Register as Broker</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Features Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-secondary-900 sm:text-4xl">
                A better way to manage logistics
              </p>
              <p className="mt-4 max-w-2xl text-xl text-secondary-600 lg:mx-auto">
                Our platform offers a comprehensive suite of tools to streamline your shipping operations.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-secondary-900">Job Marketplace</h3>
                    <p className="mt-2 text-base text-secondary-600">
                      Browse and filter through thousands of shipping opportunities or post your own jobs for truckers to find.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-secondary-900">Scheduling & Management</h3>
                    <p className="mt-2 text-base text-secondary-600">
                      Manage your trips, deliveries, and appointments all in one centralized dashboard.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-secondary-900">Secure Messaging</h3>
                    <p className="mt-2 text-base text-secondary-600">
                      Communicate directly with shipping partners through our built-in messaging system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to streamline your logistics?</span>
              <span className="block text-primary-200">Join TruckLink today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Button asChild className="bg-white text-primary-700 hover:bg-gray-100">
                  <Link href="/auth" className="px-5 py-3 text-base font-medium">
                    Get started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
  );
}
