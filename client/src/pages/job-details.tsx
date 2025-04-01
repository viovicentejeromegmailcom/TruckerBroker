import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Weight,
  Package,
  AlertCircle,
  Loader2,
  Building,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Job, Booking } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  // Fetch job details
  const {
    data: job,
    isLoading,
    error,
  } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId && !isNaN(jobId),
  });

  // Check if user already applied for this job
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/trucker/bookings"],
    enabled: !!user && user.userType === "trucker",
  });

  const hasApplied = bookings?.some(booking => booking.jobId === jobId);

  // Apply for job mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/bookings", { jobId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucker/bookings"] });
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully.",
      });
      setShowApplyDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <p className="text-secondary-500 mb-6">
            The job you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/jobs">
              <a>Back to Jobs</a>
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isBroker = user?.userType === "broker";
  const isTrucker = user?.userType === "trucker";
  const isJobOwner = isBroker && job.brokerId === user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-2">
              <Link href={isBroker ? "/broker/dashboard" : "/jobs"}>
                <a className="flex items-center text-secondary-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isBroker ? "Back to Dashboard" : "Back to Jobs"}
                </a>
              </Link>
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <Truck className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900">{job.title}</h1>
                  <p className="text-secondary-500 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {job.companyName || "Company Name"}
                  </p>
                </div>
              </div>
              <Badge className="self-start sm:self-auto bg-primary-100 text-primary-700 text-lg px-3 py-1">
                ${job.price.toLocaleString()}
              </Badge>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-secondary-200">
              <h2 className="text-lg font-medium text-secondary-900">Job Details</h2>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-secondary-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Route</p>
                    <p className="text-secondary-900">
                      {job.originCity}, {job.originState} to {job.destinationCity},{" "}
                      {job.destinationState}
                    </p>
                    {job.distance && (
                      <p className="text-sm text-secondary-500">
                        ~{job.distance} miles
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-secondary-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Pickup Date</p>
                    <p className="text-secondary-900">{formatDate(job.pickupDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Package className="h-5 w-5 text-secondary-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Cargo Type</p>
                    <p className="text-secondary-900">{job.cargoType}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-secondary-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Load Type</p>
                    <p className="text-secondary-900">{job.loadType}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Weight className="h-5 w-5 text-secondary-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Weight</p>
                    <p className="text-secondary-900">
                      {job.weight ? `${job.weight.toLocaleString()} lbs` : "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-secondary-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Payment</p>
                    <p className="text-secondary-900">${job.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            {isTrucker && (
              <>
                <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      disabled={hasApplied || applyMutation.isPending}
                    >
                      {hasApplied 
                        ? "Already Applied" 
                        : applyMutation.isPending 
                          ? "Applying..." 
                          : "Apply for this Job"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for this Job</DialogTitle>
                      <DialogDescription>
                        You are about to apply for the job: {job.title}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="mb-4">
                        Are you sure you want to apply for this job? When you apply:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>The broker will be able to see your profile information</li>
                        <li>You will be notified if your application is accepted or rejected</li>
                        <li>You can message the broker for more details about the job</li>
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowApplyDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => applyMutation.mutate()}
                        disabled={applyMutation.isPending}
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                >
                  <Link href={`/messages`}>
                    <a className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Broker
                    </a>
                  </Link>
                </Button>
              </>
            )}

            {isJobOwner && (
              <>
                <Button asChild size="lg">
                  <Link href={`/broker/job/${job.id}/applications`}>
                    <a>View Applications</a>
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Edit Job
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
