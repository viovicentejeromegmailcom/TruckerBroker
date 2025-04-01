import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StatsCard from "@/components/dashboard/stats-card";
import JobListingCard from "@/components/dashboard/job-listing-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, Calendar, FileCheck, Loader2 } from "lucide-react";
import { Job, Booking } from "@shared/schema";

export default function TruckerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("available");

  // Fetch trucker bookings
  const { 
    data: bookings, 
    isLoading: isLoadingBookings 
  } = useQuery<(Booking & { job: Job })[]>({
    queryKey: ["/api/trucker/bookings"],
    enabled: !!user,
  });

  // Fetch available jobs
  const { 
    data: availableJobs, 
    isLoading: isLoadingJobs 
  } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!user,
  });

  // Filter bookings by status
  const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
  const acceptedBookings = bookings?.filter(b => b.status === "accepted") || [];
  const completedBookings = bookings?.filter(b => b.status === "completed") || [];

  const isLoading = isLoadingBookings || isLoadingJobs;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-secondary-900">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-secondary-500">
              Here's what's happening with your deliveries
            </p>
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
                  title="Available Jobs" 
                  value={availableJobs?.length || 0}
                  footer={
                    <div className="text-sm">
                      <Link href="/jobs">
                        <a className="font-medium text-primary-500 hover:text-primary-600">
                          View all
                        </a>
                      </Link>
                    </div>
                  }
                  icon={<Truck className="h-6 w-6" />}
                />
                
                <StatsCard 
                  title="Pending Applications" 
                  value={pendingBookings.length}
                  footer={
                    <div className="text-sm">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-medium text-primary-500 hover:text-primary-600"
                        onClick={() => setActiveTab("pending")}
                      >
                        View all
                      </Button>
                    </div>
                  }
                  icon={<Package className="h-6 w-6" />}
                />
                
                <StatsCard 
                  title="Active Shipments" 
                  value={acceptedBookings.length}
                  footer={
                    <div className="text-sm">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-medium text-primary-500 hover:text-primary-600"
                        onClick={() => setActiveTab("active")}
                      >
                        View all
                      </Button>
                    </div>
                  }
                  icon={<Calendar className="h-6 w-6" />}
                />
                
                <StatsCard 
                  title="Completed Deliveries" 
                  value={completedBookings.length}
                  footer={
                    <div className="text-sm">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-medium text-primary-500 hover:text-primary-600"
                        onClick={() => setActiveTab("completed")}
                      >
                        View all
                      </Button>
                    </div>
                  }
                  icon={<FileCheck className="h-6 w-6" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Jobs */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Recent Job Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {availableJobs && availableJobs.length > 0 ? (
                        <div className="space-y-4">
                          {availableJobs.slice(0, 3).map((job) => (
                            <JobListingCard
                              key={job.id}
                              id={job.id}
                              title={job.title}
                              companyName={job.companyName || ""}
                              status="active"
                              loadType={job.loadType}
                              pickupDate={new Date(job.pickupDate)}
                              originCity={job.originCity}
                              originState={job.originState}
                              destinationCity={job.destinationCity}
                              destinationState={job.destinationState}
                              price={job.price}
                              distance={job.distance}
                            />
                          ))}
                          <div className="text-center pt-2">
                            <Button asChild variant="outline">
                              <Link href="/jobs">
                                <a>View More Jobs</a>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <h3 className="text-lg font-medium text-secondary-900 mb-2">No jobs available</h3>
                          <p className="text-secondary-500 mb-4">
                            There are no open job opportunities at the moment.
                          </p>
                          <Button asChild>
                            <Link href="/jobs">
                              <a>Search Jobs</a>
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Your Bookings */}
                <div className="lg:col-span-1">
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Your Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-3 mb-4">
                          <TabsTrigger value="pending">Pending</TabsTrigger>
                          <TabsTrigger value="active">Active</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="pending" className="space-y-4">
                          {pendingBookings.length > 0 ? (
                            pendingBookings.map((booking) => (
                              <JobListingCard
                                key={booking.id}
                                id={booking.job.id}
                                title={booking.job.title}
                                companyName={booking.job.companyName || ""}
                                status="pending"
                                loadType={booking.job.loadType}
                                pickupDate={new Date(booking.job.pickupDate)}
                                originCity={booking.job.originCity}
                                originState={booking.job.originState}
                                destinationCity={booking.job.destinationCity}
                                destinationState={booking.job.destinationState}
                                price={booking.job.price}
                                viewButtonText="View Details"
                              />
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-secondary-500">No pending applications</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="active" className="space-y-4">
                          {acceptedBookings.length > 0 ? (
                            acceptedBookings.map((booking) => (
                              <JobListingCard
                                key={booking.id}
                                id={booking.job.id}
                                title={booking.job.title}
                                companyName={booking.job.companyName || ""}
                                status="active"
                                loadType={booking.job.loadType}
                                pickupDate={new Date(booking.job.pickupDate)}
                                originCity={booking.job.originCity}
                                originState={booking.job.originState}
                                destinationCity={booking.job.destinationCity}
                                destinationState={booking.job.destinationState}
                                price={booking.job.price}
                                viewButtonText="View Details"
                              />
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-secondary-500">No active shipments</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="completed" className="space-y-4">
                          {completedBookings.length > 0 ? (
                            completedBookings.map((booking) => (
                              <JobListingCard
                                key={booking.id}
                                id={booking.job.id}
                                title={booking.job.title}
                                companyName={booking.job.companyName || ""}
                                status="completed"
                                loadType={booking.job.loadType}
                                pickupDate={new Date(booking.job.pickupDate)}
                                originCity={booking.job.originCity}
                                originState={booking.job.originState}
                                destinationCity={booking.job.destinationCity}
                                destinationState={booking.job.destinationState}
                                price={booking.job.price}
                                viewButtonText="View Details"
                              />
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-secondary-500">No completed deliveries</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
