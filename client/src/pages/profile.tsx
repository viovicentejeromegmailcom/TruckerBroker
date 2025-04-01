import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProfileForm from "@/components/profile/profile-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Key, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Profile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch user profile based on user type
  const { 
    data: profile, 
    isLoading 
  } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  // Update user info mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Your personal information has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update personal information",
        variant: "destructive",
      });
    },
  });

  // Update trucker profile mutation
  const updateTruckerProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/profile/trucker", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success",
        description: "Your trucker profile has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update trucker profile",
        variant: "destructive",
      });
    },
  });

  // Update broker profile mutation
  const updateBrokerProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/profile/broker", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success",
        description: "Your broker profile has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update broker profile",
        variant: "destructive",
      });
    },
  });

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Generate initials for avatar
  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-secondary-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar className="h-16 w-16 mr-4 bg-primary-500 text-white">
                <AvatarFallback className="text-xl font-bold">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-secondary-500">
                  {user.email} • {user.userType === "trucker" ? "Trucker" : "Broker"}
                </p>
              </div>
            </div>
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <a href={user.userType === "trucker" ? "/trucker/dashboard" : "/broker/dashboard"}>
                  Back to Dashboard
                </a>
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : profile ? (
                <ProfileForm
                  user={user}
                  profile={profile}
                  onUpdateUserInfo={updateUserMutation.mutateAsync}
                  onUpdateTruckerProfile={user.userType === "trucker" ? updateTruckerProfileMutation.mutateAsync : undefined}
                  onUpdateBrokerProfile={user.userType === "broker" ? updateBrokerProfileMutation.mutateAsync : undefined}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-secondary-500">Failed to load profile information</p>
                      <Button 
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/profile"] })}
                        className="mt-4"
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="security">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Key className="h-5 w-5 mr-2 text-primary-500" />
                      <CardTitle>Password</CardTitle>
                    </div>
                    <CardDescription>
                      Manage your password settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Change Password</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary-500" />
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </div>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-500 mb-4">
                      Two-factor authentication is not enabled yet.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Delete Account</h3>
                    <p className="text-secondary-500 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleting(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive">
                            Yes, delete my account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
