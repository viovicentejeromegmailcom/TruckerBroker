import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertJobSchema } from "@shared/schema";
import { CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof formSchema>;

// Extended schema with validation
const formSchema = insertJobSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  originCity: z.string().min(2, "City name required"),
  originState: z.string().min(2, "State required"),
  destinationCity: z.string().min(2, "City name required"),
  destinationState: z.string().min(2, "State required"),
  price: z.coerce.number().min(1, "Price must be a positive number"),
  weight: z.coerce.number().min(1, "Weight must be a positive number"),
});

export default function PostJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect if not a broker
  if (user?.userType !== "broker") {
    navigate("/");
    return null;
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      originCity: "",
      originState: "",
      destinationCity: "",
      destinationState: "",
      distance: 0,
      price: 0,
      cargoType: "",
      weight: 0,
      loadType: "Full Truckload",
      pickupDate: new Date(Date.now() + 86400000), // tomorrow
      companyName: user?.userType === "broker" ? "" : undefined,
      brokerId: user?.id,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/jobs", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted Successfully",
        description: "Your job has been posted and is now visible to truckers.",
      });
      navigate("/broker/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    createJobMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-6">
            <a href="/broker/dashboard" className="flex items-center text-secondary-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Post a New Job</CardTitle>
              <CardDescription>
                Create a new shipping job to find available truckers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Los Angeles to Seattle - Refrigerated Goods" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Create a descriptive title including route and cargo type
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide details about the shipment, requirements, and any special instructions" 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your company name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              This will be visible to truckers who view your job
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium">Route Information</h3>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="originCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Origin City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="originState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Origin State</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="destinationCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Destination City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="destinationState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Destination State</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="distance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approximate Distance (miles)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Estimated distance in miles" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the approximate distance of the route
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium">Cargo Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="cargoType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo Type</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Electronics, Furniture, Refrigerated Goods" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Weight in pounds" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="loadType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Load Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select load type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Full Truckload">Full Truckload</SelectItem>
                                  <SelectItem value="Partial Load">Partial Load</SelectItem>
                                  <SelectItem value="LTL (Less Than Truckload)">LTL (Less Than Truckload)</SelectItem>
                                  <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                                  <SelectItem value="Flatbed">Flatbed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium">Timing & Payment</h3>
                      
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="pickupDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Pickup Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When the cargo should be picked up
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Amount in USD" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                The amount you're willing to pay for this job
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={createJobMutation.isPending}
                      className="px-8"
                    >
                      {createJobMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Posting Job...
                        </>
                      ) : (
                        "Post Job"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
