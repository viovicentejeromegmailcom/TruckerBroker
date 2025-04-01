import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import JobFilter from "@/components/jobs/job-filter";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Job } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FilterValues {
  search?: string;
  location?: string;
  loadType?: string;
  distance?: string;
  sortBy?: string;
}

export default function JobSearch() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Fetch jobs data
  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ["/api/jobs", filters],
  });

  // Apply filters
  const filteredJobs = jobs
    ? jobs
        .filter(job => {
          // Filter by search term
          if (filters.search && filters.search.trim() !== "") {
            const searchTerm = filters.search.toLowerCase();
            const matchesSearch =
              job.title.toLowerCase().includes(searchTerm) ||
              job.description.toLowerCase().includes(searchTerm) ||
              job.originCity.toLowerCase().includes(searchTerm) ||
              job.destinationCity.toLowerCase().includes(searchTerm);
            if (!matchesSearch) return false;
          }

          // Filter by location
          if (filters.location && filters.location !== "all") {
            const matchesLocation =
              job.originState.toLowerCase() === filters.location.toLowerCase() ||
              job.destinationState.toLowerCase() === filters.location.toLowerCase();
            if (!matchesLocation) return false;
          }

          // Filter by load type
          if (filters.loadType && filters.loadType !== "all") {
            const matchesLoadType = job.loadType
              .toLowerCase()
              .includes(filters.loadType.toLowerCase());
            if (!matchesLoadType) return false;
          }

          // Filter by distance
          if (filters.distance && filters.distance !== "any" && job.distance) {
            if (filters.distance === "local" && job.distance >= 100) return false;
            if (
              filters.distance === "regional" &&
              (job.distance < 100 || job.distance > 500)
            )
              return false;
            if (filters.distance === "long" && job.distance <= 500) return false;
          }

          return true;
        })
        // Sort results
        .sort((a, b) => {
          if (!filters.sortBy || filters.sortBy === "newest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (filters.sortBy === "oldest") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else if (filters.sortBy === "price-high") {
            return b.price - a.price;
          } else if (filters.sortBy === "price-low") {
            return a.price - b.price;
          } else if (filters.sortBy === "distance" && a.distance && b.distance) {
            return a.distance - b.distance;
          }
          return 0;
        })
    : [];

  // Handle pagination
  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  // Handle job application
  const handleApplyForJob = async (jobId: number) => {
    try {
      await apiRequest("POST", "/api/bookings", { jobId });
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to submit application. You may have already applied for this job.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900">Available Jobs</h1>
              <p className="mt-1 text-sm text-secondary-500">
                Find and apply for shipping jobs in your area
              </p>
            </div>
          </div>

          {/* Filters */}
          <JobFilter onFilterChange={setFilters} />

          {/* Job Listings */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900">Failed to load jobs</h3>
                <p className="text-secondary-500">Please try again later</p>
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No jobs found</h3>
                <p className="text-secondary-500">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <ul className="divide-y divide-secondary-200">
                {paginatedJobs.map((job) => (
                  <li key={job.id}>
                    <JobCard 
                      job={job} 
                      onApply={() => handleApplyForJob(job.id)} 
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-secondary-700">
                    Showing <span className="font-medium">{Math.min(filteredJobs.length, (page - 1) * pageSize + 1)}</span> to{" "}
                    <span className="font-medium">{Math.min(filteredJobs.length, page * pageSize)}</span> of{" "}
                    <span className="font-medium">{filteredJobs.length}</span> jobs
                  </div>
                  <div className="flex-1 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="mr-3"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
