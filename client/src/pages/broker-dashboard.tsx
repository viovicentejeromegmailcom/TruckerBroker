import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import JobListingCard from "@/components/dashboard/job-listing-card";
import ShipmentCard from "@/components/dashboard/shipment-card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, TruckIcon, MessageSquare, FilePlus } from "lucide-react";
import { Job, Booking } from "@shared/schema";

export default function BrokerDashboard() {
  const { user } = useAuth();

  // Fetch broker jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ["/api/broker/jobs"],
    enabled: !!user,
  });

  // Mock data for active shipments (based on accepted bookings)
  // In a real app, we would fetch this from the backend
  const isLoading = isLoadingJobs;

  // Get counts from job statuses
  const activeJobs = jobs?.filter(job => job.status === "active") || [];
  const pendingJobs = jobs?.filter(job => job.status === "pending") || [];
  const completedJobs = jobs?.filter(job => job.status === "completed") || [];

  // Helper function to get shipment number from job
  const getShipmentNumber = (job: Job) => {
    return `TL-${7800 + job.id}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900">
                Broker Dashboard
              </h1>
              <p className="text-secondary-500">
                Manage your shipping jobs and track deliveries
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button asChild>
                <Link href="/post-job">
                  <a className="flex items-center">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Post New Job
                  </a>
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Active Shipments" 
                  value={activeJobs.length}
                  footer={
                    <div className="text-sm">
                      <Link href="#active-shipments">
                        <a className="font-medium text-primary-500 hover:text-primary-600">
                          View all
                        </a>
                      </Link>
                    </div>
                  }
                  icon={<TruckIcon className="h-6 w-6" />}
                />
                
                <StatsCard 
                  title="Pending Bookings" 
                  value={pendingJobs.length}
                  footer={
                    <div className="text-sm">
                      <Link href="#pending-bookings">
                        <a className="font-medium text-primary-500 hover:text-primary-600">
                          View all
                        </a>
                      </Link>
                    </div>
                  }
                  icon={<Package className="h-6 w-6" />}
                />
                
                <StatsCard 
                  title="Open Job Posts" 
                  value={jobs?.length || 0}
                  footer={
                    <div className="text-sm">
                      <Link href="#job-posts">
                        <a className="font-medium text-primary-500 hover:text-primary-600">
                          View all
                        </a>
                      </Link>
                    </div>
                  }
                  icon={<FilePlus className="h-6 w-6" />}
                />
                
                <StatsCard 
                  title="New Messages" 
                  value={3}
                  footer={
                    <div className="text-sm">
                      <Link href="/messages">
                        <a className="font-medium text-primary-500 hover:text-primary-600">
                          View all
                        </a>
                      </Link>
                    </div>
                  }
                  icon={<MessageSquare className="h-6 w-6" />}
                />
              </div>

              {/* Job postings and active shipments */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent job postings */}
                <div className="bg-white shadow rounded-lg" id="job-posts">
                  <div className="px-4 py-5 border-b border-secondary-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-secondary-900">
                      Recent Job Postings
                    </h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      Your recently posted shipping jobs
                    </p>
                  </div>
                  
                  {jobs && jobs.length > 0 ? (
                    <div className="divide-y divide-secondary-200">
                      {jobs.slice(0, 3).map((job) => (
                        <JobListingCard
                          key={job.id}
                          id={job.id}
                          title={job.title}
                          companyName={job.companyName || "Your Company"}
                          status={job.status as any}
                          loadType={job.loadType}
                          pickupDate={new Date(job.pickupDate)}
                          originCity={job.originCity}
                          originState={job.originState}
                          destinationCity={job.destinationCity}
                          destinationState={job.destinationState}
                          price={job.price}
                          viewButtonText="View Applications"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-secondary-500 mb-4">You haven't posted any jobs yet.</p>
                      <Button asChild>
                        <Link href="/post-job">
                          <a>Post Your First Job</a>
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  <div className="px-4 py-3 bg-secondary-50 text-right sm:px-6 border-t border-secondary-200">
                    <Button asChild>
                      <Link href="/post-job">
                        <a>Post New Job</a>
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Active shipments */}
                <div className="bg-white shadow rounded-lg" id="active-shipments">
                  <div className="px-4 py-5 border-b border-secondary-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-secondary-900">
                      Active Shipments
                    </h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      Track your currently active shipments
                    </p>
                  </div>
                  
                  {activeJobs.length > 0 ? (
                    <div className="divide-y divide-secondary-200">
                      {activeJobs.slice(0, 3).map((job) => (
                        <ShipmentCard
                          key={job.id}
                          id={job.id}
                          shipmentNumber={getShipmentNumber(job)}
                          route={`${job.originCity} to ${job.destinationCity}`}
                          status="in-transit"
                          companyName={job.companyName || "Assigned Trucker"}
                          eta={new Date(job.pickupDate)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-secondary-500">No active shipments at the moment.</p>
                    </div>
                  )}
                  
                  <div className="px-4 py-3 bg-secondary-50 text-right sm:px-6 border-t border-secondary-200">
                    <Button variant="outline" asChild>
                      <Link href="#job-posts">
                        <a>View All Shipments</a>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Pending Bookings Section */}
              {pendingJobs.length > 0 && (
                <div className="mt-8" id="pending-bookings">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
                    Pending Bookings
                  </h3>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-secondary-200">
                      {pendingJobs.map((job) => (
                        <li key={job.id}>
                          <div className="px-4 py-4 sm:px-6 hover:bg-secondary-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-sm font-medium text-primary-500 truncate">
                                    {job.title}
                                  </h3>
                                  <p className="text-xs text-secondary-500">
                                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/jobs/${job.id}`}>
                                    <a>View Details</a>
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
