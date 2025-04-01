import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TruckerProfile, BrokerProfile, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Schema for trucker profile update
const truckerProfileSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  licensePlate: z.string().optional(),
  licenseNumber: z.string().optional(),
  truckType: z.string().optional(),
  truckCapacity: z.string().optional(),
  available: z.boolean(),
});

// Schema for broker profile update
const brokerProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyCity: z.string().min(1, "Company city is required"),
  companyState: z.string().min(1, "Company state is required"),
  companyZip: z.string().min(1, "Company ZIP code is required"),
  businessType: z.string().optional(),
  taxId: z.string().optional(),
});

// Schema for user info update (common to both types)
const userInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

type TruckerProfileFormValues = z.infer<typeof truckerProfileSchema>;
type BrokerProfileFormValues = z.infer<typeof brokerProfileSchema>;
type UserInfoFormValues = z.infer<typeof userInfoSchema>;

interface ProfileFormProps {
  user: User;
  profile: TruckerProfile | BrokerProfile;
  onUpdateUserInfo: (data: UserInfoFormValues) => Promise<void>;
  onUpdateTruckerProfile?: (data: TruckerProfileFormValues) => Promise<void>;
  onUpdateBrokerProfile?: (data: BrokerProfileFormValues) => Promise<void>;
}

export default function ProfileForm({
  user,
  profile,
  onUpdateUserInfo,
  onUpdateTruckerProfile,
  onUpdateBrokerProfile,
}: ProfileFormProps) {
  const { toast } = useToast();
  const [isUserInfoSubmitting, setIsUserInfoSubmitting] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // User info form
  const userInfoForm = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    },
  });

  // Profile-specific form based on user type
  const isTrucker = user.userType === "trucker";
  
  const truckerProfileForm = useForm<TruckerProfileFormValues>({
    resolver: zodResolver(truckerProfileSchema),
    defaultValues: isTrucker
      ? {
          address: (profile as TruckerProfile).address,
          city: (profile as TruckerProfile).city,
          state: (profile as TruckerProfile).state,
          zip: (profile as TruckerProfile).zip,
          licensePlate: (profile as TruckerProfile).licensePlate || "",
          licenseNumber: (profile as TruckerProfile).licenseNumber || "",
          truckType: (profile as TruckerProfile).truckType || "",
          truckCapacity: (profile as TruckerProfile).truckCapacity || "",
          available: (profile as TruckerProfile).available,
        }
      : undefined,
  });

  const brokerProfileForm = useForm<BrokerProfileFormValues>({
    resolver: zodResolver(brokerProfileSchema),
    defaultValues: !isTrucker
      ? {
          companyName: (profile as BrokerProfile).companyName,
          companyAddress: (profile as BrokerProfile).companyAddress,
          companyCity: (profile as BrokerProfile).companyCity,
          companyState: (profile as BrokerProfile).companyState,
          companyZip: (profile as BrokerProfile).companyZip,
          businessType: (profile as BrokerProfile).businessType || "",
          taxId: (profile as BrokerProfile).taxId || "",
        }
      : undefined,
  });

  // Handle user info form submission
  const onUserInfoSubmit = async (data: UserInfoFormValues) => {
    try {
      setIsUserInfoSubmitting(true);
      await onUpdateUserInfo(data);
      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      });
    } finally {
      setIsUserInfoSubmitting(false);
    }
  };

  // Handle trucker profile form submission
  const onTruckerProfileSubmit = async (data: TruckerProfileFormValues) => {
    if (!onUpdateTruckerProfile) return;

    try {
      setIsProfileSubmitting(true);
      await onUpdateTruckerProfile(data);
      toast({
        title: "Profile updated",
        description: "Your trucker profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trucker profile",
        variant: "destructive",
      });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Handle broker profile form submission
  const onBrokerProfileSubmit = async (data: BrokerProfileFormValues) => {
    if (!onUpdateBrokerProfile) return;

    try {
      setIsProfileSubmitting(true);
      await onUpdateBrokerProfile(data);
      toast({
        title: "Profile updated",
        description: "Your broker profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update broker profile",
        variant: "destructive",
      });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...userInfoForm}>
            <form onSubmit={userInfoForm.handleSubmit(onUserInfoSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={userInfoForm.control}
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
                  control={userInfoForm.control}
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
                control={userInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={userInfoForm.control}
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isUserInfoSubmitting}>
                  {isUserInfoSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Trucker Profile Form */}
      {isTrucker && onUpdateTruckerProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Trucker Profile</CardTitle>
            <CardDescription>
              Update your trucker profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...truckerProfileForm}>
              <form 
                onSubmit={truckerProfileForm.handleSubmit(onTruckerProfileSubmit)} 
                className="space-y-6"
              >
                <FormField
                  control={truckerProfileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <FormField
                    control={truckerProfileForm.control}
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
                    control={truckerProfileForm.control}
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
                    control={truckerProfileForm.control}
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

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={truckerProfileForm.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={truckerProfileForm.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="DL12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={truckerProfileForm.control}
                    name="truckType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Truck Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Refrigerated / Flatbed / Dry Van" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={truckerProfileForm.control}
                    name="truckCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Truck Capacity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 53 ft, 40,000 lbs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={truckerProfileForm.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Availability Status</FormLabel>
                        <FormDescription>
                          Set your current availability for new jobs
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isProfileSubmitting}>
                    {isProfileSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Broker Profile Form */}
      {!isTrucker && onUpdateBrokerProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your broker company details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...brokerProfileForm}>
              <form 
                onSubmit={brokerProfileForm.handleSubmit(onBrokerProfileSubmit)} 
                className="space-y-6"
              >
                <FormField
                  control={brokerProfileForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Shipping Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={brokerProfileForm.control}
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <FormField
                    control={brokerProfileForm.control}
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
                    control={brokerProfileForm.control}
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
                    control={brokerProfileForm.control}
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

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={brokerProfileForm.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input placeholder="LLC, Corporation, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={brokerProfileForm.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Tax Identification Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isProfileSubmitting}>
                    {isProfileSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
