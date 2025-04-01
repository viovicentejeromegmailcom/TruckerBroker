import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const filterSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  loadType: z.string().optional(),
  distance: z.string().optional(),
  sortBy: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface JobFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export default function JobFilter({ onFilterChange }: JobFilterProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      location: "all",
      loadType: "all",
      distance: "any",
      sortBy: "newest",
    },
  });

  const handleSubmit = (values: FilterValues) => {
    onFilterChange(values);
    setIsSheetOpen(false);
  };

  return (
    <div className="w-full">
      {/* Desktop Search & Filters */}
      <div className="hidden md:flex md:space-x-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <Input
            type="text"
            placeholder="Search jobs"
            className="pl-10"
            value={form.watch("search") || ""}
            onChange={(e) => {
              form.setValue("search", e.target.value);
              handleSubmit(form.getValues());
            }}
          />
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
              <SheetDescription>
                Refine your job search with these filters
              </SheetDescription>
            </SheetHeader>

            <div className="py-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            <SelectItem value="los-angeles">Los Angeles, CA</SelectItem>
                            <SelectItem value="chicago">Chicago, IL</SelectItem>
                            <SelectItem value="new-york">New York, NY</SelectItem>
                            <SelectItem value="dallas">Dallas, TX</SelectItem>
                            <SelectItem value="miami">Miami, FL</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="full">Full Truckload</SelectItem>
                            <SelectItem value="partial">Partial Load</SelectItem>
                            <SelectItem value="ltl">LTL (Less Than Truckload)</SelectItem>
                            <SelectItem value="refrigerated">Refrigerated</SelectItem>
                            <SelectItem value="flatbed">Flatbed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select distance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any Distance</SelectItem>
                            <SelectItem value="local">Local (&lt; 100 miles)</SelectItem>
                            <SelectItem value="regional">Regional (100-500 miles)</SelectItem>
                            <SelectItem value="long">Long Haul (500+ miles)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort By</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="newest">Date: Newest First</SelectItem>
                            <SelectItem value="oldest">Date: Oldest First</SelectItem>
                            <SelectItem value="price-high">Pay: Highest First</SelectItem>
                            <SelectItem value="price-low">Pay: Lowest First</SelectItem>
                            <SelectItem value="distance">Distance: Nearest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          handleSubmit(form.getValues());
                        }}
                      >
                        Reset
                      </Button>
                    </SheetClose>
                    <Button type="submit">Apply Filters</Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Search & Filter Button */}
      <div className="flex space-x-2 md:hidden mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <Input
            type="text"
            placeholder="Search jobs"
            className="pl-10"
            value={form.watch("search") || ""}
            onChange={(e) => {
              form.setValue("search", e.target.value);
              handleSubmit(form.getValues());
            }}
          />
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
              <SheetDescription>
                Refine your job search with these filters
              </SheetDescription>
            </SheetHeader>

            <div className="py-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            <SelectItem value="los-angeles">Los Angeles, CA</SelectItem>
                            <SelectItem value="chicago">Chicago, IL</SelectItem>
                            <SelectItem value="new-york">New York, NY</SelectItem>
                            <SelectItem value="dallas">Dallas, TX</SelectItem>
                            <SelectItem value="miami">Miami, FL</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="full">Full Truckload</SelectItem>
                            <SelectItem value="partial">Partial Load</SelectItem>
                            <SelectItem value="ltl">LTL (Less Than Truckload)</SelectItem>
                            <SelectItem value="refrigerated">Refrigerated</SelectItem>
                            <SelectItem value="flatbed">Flatbed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select distance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any Distance</SelectItem>
                            <SelectItem value="local">Local (&lt; 100 miles)</SelectItem>
                            <SelectItem value="regional">Regional (100-500 miles)</SelectItem>
                            <SelectItem value="long">Long Haul (500+ miles)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort By</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="newest">Date: Newest First</SelectItem>
                            <SelectItem value="oldest">Date: Oldest First</SelectItem>
                            <SelectItem value="price-high">Pay: Highest First</SelectItem>
                            <SelectItem value="price-low">Pay: Lowest First</SelectItem>
                            <SelectItem value="distance">Distance: Nearest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          handleSubmit(form.getValues());
                        }}
                      >
                        Reset
                      </Button>
                    </SheetClose>
                    <Button type="submit">Apply Filters</Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Quick Filter Pills on Desktop */}
      <div className="hidden md:flex md:flex-wrap gap-2 mb-6">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleSubmit(form.getValues());
              }}
              value={field.value}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="los-angeles">Los Angeles, CA</SelectItem>
                <SelectItem value="chicago">Chicago, IL</SelectItem>
                <SelectItem value="new-york">New York, NY</SelectItem>
                <SelectItem value="dallas">Dallas, TX</SelectItem>
                <SelectItem value="miami">Miami, FL</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          control={form.control}
          name="loadType"
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleSubmit(form.getValues());
              }}
              value={field.value}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Load Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full">Full Truckload</SelectItem>
                <SelectItem value="partial">Partial Load</SelectItem>
                <SelectItem value="ltl">LTL (Less Than Truckload)</SelectItem>
                <SelectItem value="refrigerated">Refrigerated</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          control={form.control}
          name="distance"
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleSubmit(form.getValues());
              }}
              value={field.value}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Distance</SelectItem>
                <SelectItem value="local">Local (&lt; 100 miles)</SelectItem>
                <SelectItem value="regional">Regional (100-500 miles)</SelectItem>
                <SelectItem value="long">Long Haul (500+ miles)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <FormField
          control={form.control}
          name="sortBy"
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleSubmit(form.getValues());
              }}
              value={field.value}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Date: Newest First</SelectItem>
                <SelectItem value="oldest">Date: Oldest First</SelectItem>
                <SelectItem value="price-high">Pay: Highest First</SelectItem>
                <SelectItem value="price-low">Pay: Lowest First</SelectItem>
                <SelectItem value="distance">Distance: Nearest First</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}
