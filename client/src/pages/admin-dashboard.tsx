import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, Search, Check, X, AlertCircle, FileText, Info, Truck, Building, Briefcase, Phone, Mail, MapPin, FileCheck, User2, Calendar, ExternalLink } from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { User, AdminAction, TruckerProfile, BrokerProfile, Vehicle } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // "users" corresponds to the "All Users" tab
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [isProfileDetailDialogOpen, setIsProfileDetailDialogOpen] = useState(false);

  // Fetch pending truckers
  const {
    data: pendingTruckers = [],
    isLoading: isPendingTruckersLoading,
    error: pendingTruckersError,
  } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-truckers"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin" && activeTab === "pending-truckers",
  });

  // Fetch pending brokers
  const {
    data: pendingBrokers = [],
    isLoading: isPendingBrokersLoading,
    error: pendingBrokersError,
  } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-brokers"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin" && activeTab === "pending-brokers",
  });

  // Fetch admin action history
  const {
    data: adminActions = [],
    isLoading: isActionsLoading,
    error: actionsError,
  } = useQuery<any[]>({
    queryKey: ["/api/admin/action-history"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin" && activeTab === "history",
  });

  // Fetch all users
  const {
    data: allUsers = [],
    isLoading: isAllUsersLoading,
    error: allUsersError,
  } = useQuery<any[]>({
    queryKey: ["/api/admin/all-users"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin" && activeTab === "users",
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", "/api/admin/approve-user", {
        userId,
        approved: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been approved and verification email sent",
      });
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-truckers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-brokers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/action-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ userId, message }: { userId: number; message: string }) => {
      const res = await apiRequest("POST", "/api/admin/approve-user", {
        userId,
        approved: false,
        message,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Rejected",
        description: "User has been notified",
      });
      setIsRejectionDialogOpen(false);
      setRejectionReason("");
      setSelectedUser(null);
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-truckers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-brokers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/action-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject user",
        variant: "destructive",
      });
    },
  });

  // If still loading auth or if not admin, show appropriate content
  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!user || user.userType !== "admin") {
    return <Redirect to="/" />;
  }

  const filterUserBySearch = (user: any) => {
    return (
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredPendingTruckers = pendingTruckers.filter(filterUserBySearch);
  const filteredPendingBrokers = pendingBrokers.filter(filterUserBySearch);
  const filteredAllUsers = allUsers.filter(filterUserBySearch);

  const filteredAdminActions = adminActions.filter((action: any) => {
    // If there's a search query, filter actions by reason or action type
    if (searchQuery) {
      return (
          action.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          action.action?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Function to handle approve click
  const handleApprove = (userId: number) => {
    approveMutation.mutate(userId);
  };

  // Function to open rejection dialog
  const handleRejectClick = (user: any) => {
    setSelectedUser(user);
    setIsRejectionDialogOpen(true);
  };

  // Function to submit rejection
  const handleRejectSubmit = () => {
    if (selectedUser) {
      rejectMutation.mutate({
        userId: selectedUser.id,
        message: rejectionReason,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "trucker":
        return <Badge variant="outline">Trucker</Badge>;
      case "broker":
        return <Badge variant="outline">Broker</Badge>;
      case "admin":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Admin</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">Verified</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get auth context including logout mutation
  const { logoutMutation } = useAuth();

  // Logout function
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logoutMutation.mutate();
    }
  };

  return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="users" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="pending-truckers">Pending Truckers</TabsTrigger>
              <TabsTrigger value="pending-brokers">Pending Brokers</TabsTrigger>
              <TabsTrigger value="history">Action History</TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search users..."
                  className="pl-8 w-[250px] sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="pending-truckers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Trucker Registrations</CardTitle>
                <CardDescription>
                  Review and approve new trucker registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPendingTruckersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : pendingTruckersError ? (
                    <div className="flex flex-col items-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                      <p>Failed to load pending truckers</p>
                    </div>
                ) : filteredPendingTruckers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No matching truckers found" : "No pending trucker registrations"}
                    </div>
                ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>App ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPendingTruckers.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <Button
                                      variant="link"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUser(user);
                                        setIsProfileDetailDialogOpen(true);
                                      }}
                                      className="p-0 font-medium"
                                  >
                                    T-{user.id.toString().padStart(4, '0')}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{user.email}</div>
                                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center text-destructive"
                                        onClick={() => handleRejectClick(user)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex items-center"
                                        onClick={() => handleApprove(user.id)}
                                        disabled={approveMutation.isPending}
                                    >
                                      {approveMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : (
                                          <Check className="h-4 w-4 mr-1" />
                                      )}
                                      Approve
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-brokers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Broker Registrations</CardTitle>
                <CardDescription>
                  Review and approve new broker/importer registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPendingBrokersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : pendingBrokersError ? (
                    <div className="flex flex-col items-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                      <p>Failed to load pending brokers</p>
                    </div>
                ) : filteredPendingBrokers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No matching brokers found" : "No pending broker registrations"}
                    </div>
                ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>App ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPendingBrokers.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <Button
                                      variant="link"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUser(user);
                                        setIsProfileDetailDialogOpen(true);
                                      }}
                                      className="p-0 font-medium"
                                  >
                                    B-{user.id.toString().padStart(4, '0')}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{user.email}</div>
                                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center text-destructive"
                                        onClick={() => handleRejectClick(user)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex items-center"
                                        onClick={() => handleApprove(user.id)}
                                        disabled={approveMutation.isPending}
                                    >
                                      {approveMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : (
                                          <Check className="h-4 w-4 mr-1" />
                                      )}
                                      Approve
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {isAllUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : allUsersError ? (
                    <div className="flex flex-col items-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                      <p>Failed to load users</p>
                    </div>
                ) : filteredAllUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No matching users found" : "No users found"}
                    </div>
                ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAllUsers.map((user: any) => (
                              <TableRow
                                  key={user.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsUserDetailDialogOpen(true);
                                  }}
                              >
                                <TableCell>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{user.email}</div>
                                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                                </TableCell>
                                <TableCell>{getUserTypeLabel(user.userType)}</TableCell>
                                <TableCell>
                                  {getUserStatusBadge(user.status)}
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Action History</CardTitle>
                <CardDescription>View your user approval and rejection history</CardDescription>
              </CardHeader>
              <CardContent>
                {isActionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : actionsError ? (
                    <div className="flex flex-col items-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                      <p>Failed to load action history</p>
                    </div>
                ) : filteredAdminActions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No matching actions found" : "No actions recorded yet"}
                    </div>
                ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date/Time</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAdminActions.map((action: any) => (
                              <TableRow key={action.id}>
                                <TableCell>{formatDate(action.createdAt)}</TableCell>
                                <TableCell>
                                  {action.userId}
                                </TableCell>
                                <TableCell>
                                  {action.action === "approve" ? (
                                      <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
                                  ) : (
                                      <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {action.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Registration</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this registration. This message will be sent to the user.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {selectedUser && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Rejecting registration for:</p>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
              )}
              <Separator />
              <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button
                  variant="outline"
                  onClick={() => setIsRejectionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleRejectSubmit}
                  disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                ) : "Reject Registration"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={isUserDetailDialogOpen} onOpenChange={setIsUserDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information about the user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                          <span className="text-sm col-span-2">{selectedUser.firstName} {selectedUser.lastName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Username:</span>
                          <span className="text-sm col-span-2">@{selectedUser.username}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Email:</span>
                          <span className="text-sm col-span-2">{selectedUser.email}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                          <span className="text-sm col-span-2">{selectedUser.phone || "Not provided"}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">User Type:</span>
                          <span className="text-sm col-span-2">{getUserTypeLabel(selectedUser.userType)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Status:</span>
                          <span className="text-sm col-span-2">{getUserStatusBadge(selectedUser.status)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Application ID:</span>
                          <span className="text-sm col-span-2">
                        {selectedUser.userType === "trucker"
                            ? `T-${selectedUser.id.toString().padStart(4, '0')}`
                            : selectedUser.userType === "broker"
                                ? `B-${selectedUser.id.toString().padStart(4, '0')}`
                                : selectedUser.id}
                      </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Registered:</span>
                          <span className="text-sm col-span-2">{formatDate(selectedUser.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                          <span className="text-sm col-span-2">{selectedUser.updatedAt ? formatDate(selectedUser.updatedAt) : "Never"}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium text-muted-foreground">Email Verified:</span>
                          <span className="text-sm col-span-2">{selectedUser.emailVerified ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Information Section - only show for truckers and brokers */}
                  {(selectedUser.userType === "trucker" || selectedUser.userType === "broker") && (
                      <>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {selectedUser.userType === "trucker" ? "Trucker Profile" : "Broker Profile"}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedUser.userType === "trucker"
                                ? "Information submitted for trucker registration"
                                : "Information submitted for broker/importer registration"}
                          </p>

                          {/* Fetch profile data */}
                          <ProfileDataSection userId={selectedUser.id} userType={selectedUser.userType} />
                        </div>

                        <Separator />
                      </>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Actions</h3>
                    <div className="flex space-x-2">
                      {selectedUser.status === "pending" && (
                          <>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setIsUserDetailDialogOpen(false);
                                  setIsRejectionDialogOpen(true);
                                }}
                            >
                              Reject User
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  handleApprove(selectedUser.id);
                                  setIsUserDetailDialogOpen(false);
                                }}
                            >
                              Approve User
                            </Button>
                          </>
                      )}
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsUserDetailDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Profile Details Dialog */}
        <Dialog open={isProfileDetailDialogOpen} onOpenChange={setIsProfileDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                {selectedUser?.userType === "trucker"
                    ? "Trucker Application Information"
                    : "Broker Application Information"}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Applicant Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                            <span className="text-sm col-span-2">{selectedUser.firstName} {selectedUser.lastName}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Application ID:</span>
                            <span className="text-sm col-span-2">
                          {selectedUser.userType === "trucker"
                              ? `T-${selectedUser.id.toString().padStart(4, '0')}`
                              : `B-${selectedUser.id.toString().padStart(4, '0')}`}
                        </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Email:</span>
                            <span className="text-sm col-span-2">{selectedUser.email}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                            <span className="text-sm col-span-2">{selectedUser.phone || "Not provided"}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">User Type:</span>
                            <span className="text-sm col-span-2">{getUserTypeLabel(selectedUser.userType)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                            <span className="text-sm col-span-2">{getUserStatusBadge(selectedUser.status)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Registered:</span>
                            <span className="text-sm col-span-2">{formatDate(selectedUser.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser.userType === "trucker" ? "Trucker Profile" : "Broker Profile"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedUser.userType === "trucker"
                          ? "Information submitted for trucker registration"
                          : "Information submitted for broker/importer registration"}
                    </p>

                    {/* Fetch profile data */}
                    <ProfileDataSection userId={selectedUser.id} userType={selectedUser.userType} />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Actions</h3>
                    <div className="flex space-x-2">
                      {selectedUser.status === "pending" && (
                          <>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setIsProfileDetailDialogOpen(false);
                                  setIsRejectionDialogOpen(true);
                                }}
                            >
                              Reject Application
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  handleApprove(selectedUser.id);
                                  setIsProfileDetailDialogOpen(false);
                                }}
                            >
                              Approve Application
                            </Button>
                          </>
                      )}
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsProfileDetailDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}

// Component to display profile data based on user type
interface ProfileDataSectionProps {
  userId: number;
  userType: string;
}

function ProfileDataSection({ userId, userType }: ProfileDataSectionProps) {
  const { toast } = useToast();

  // Fetch the user profile data
  const { data, isLoading, error } = useQuery<{ user: User, profile: TruckerProfile | BrokerProfile | null }>({
    queryKey: [`/api/admin/user-profile/${userId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
        <div className="space-y-4">
          <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
    );
  }

  if (error || !data) {
    return (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading profile</AlertTitle>
          <AlertDescription>
            {error?.message || "Could not load the user profile data."}
          </AlertDescription>
        </Alert>
    );
  }

  const { user, profile } = data;

  if (!profile) {
    return (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No profile data available</AlertTitle>
          <AlertDescription>
            This user has not completed their profile information.
          </AlertDescription>
        </Alert>
    );
  }

  if (userType === "trucker") {
    const truckerProfile = profile as TruckerProfile;
    return (
        <div className="space-y-4">
          {/* Basic Information Section */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Building className="h-4 w-4" />
              Company Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{truckerProfile.companyName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Address</p>
                <p className="font-medium">{truckerProfile.address}, {truckerProfile.city}, {truckerProfile.state} {truckerProfile.zip}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {truckerProfile.contactNumber || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {truckerProfile.businessEmail || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <FileCheck className="h-4 w-4" />
              Legal & Compliance Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">BIR 2303 Certificate</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{truckerProfile.bir2303Certificate ? "Uploaded" : "Not uploaded"}</p>
                  {truckerProfile.bir2303Certificate && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Permit</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{truckerProfile.businessPermit ? "Uploaded" : "Not uploaded"}</p>
                  {truckerProfile.businessPermit && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Insurance Coverage</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{truckerProfile.insuranceCoverage ? "Uploaded" : "Not uploaded"}</p>
                  {truckerProfile.insuranceCoverage && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permit to Operate</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{truckerProfile.permitToOperate ? "Uploaded" : "Not uploaded"}</p>
                  {truckerProfile.permitToOperate && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4" />
              Registered Vehicles
            </h4>
            {truckerProfile.vehicles && Array.isArray(truckerProfile.vehicles) && truckerProfile.vehicles.length > 0 ? (
                <div className="space-y-3">
                  {truckerProfile.vehicles.map((vehicle, index) => (
                      <div key={index} className="border border-border p-3 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Vehicle Type</p>
                            <p className="font-medium">{vehicle.vehicleType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Make/Model</p>
                            <p className="font-medium">{vehicle.vehicleMake}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Plate Number</p>
                            <p className="font-medium">{vehicle.plateNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Weight Capacity</p>
                            <p className="font-medium">{vehicle.weightCapacity} kg</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Truck Documents (OR/CR)</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm italic">{vehicle.truckDocuments ? "Uploaded" : "Not uploaded"}</p>
                              {vehicle.truckDocuments && (
                                  <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">No vehicles registered</p>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Info className="h-4 w-4" />
              Additional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Service Areas</p>
                <p className="font-medium">
                  {truckerProfile.serviceAreas && Array.isArray(truckerProfile.serviceAreas) && truckerProfile.serviceAreas.length > 0
                      ? truckerProfile.serviceAreas.join(", ")
                      : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability Status</p>
                <Badge variant={truckerProfile.available ? "default" : "secondary"} className={truckerProfile.available ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                  {truckerProfile.available ? "Available for Jobs" : "Not Available"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
    );
  } else if (userType === "broker") {
    const brokerProfile = profile as BrokerProfile;
    return (
        <div className="space-y-4">
          {/* Basic Information Section */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Building className="h-4 w-4" />
              Company Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{brokerProfile.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Address</p>
                <p className="font-medium">{brokerProfile.companyAddress}, {brokerProfile.companyCity}, {brokerProfile.companyState} {brokerProfile.companyZip}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  {brokerProfile.contactPersonName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">
                  {brokerProfile.contactPersonPosition || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {brokerProfile.contactNumber || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {brokerProfile.businessEmail || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <FileCheck className="h-4 w-4" />
              Legal & Compliance Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">DTI/SEC Registration</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{brokerProfile.dtiSecRegistration ? "Uploaded" : "Not uploaded"}</p>
                  {brokerProfile.dtiSecRegistration && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BIR 2303 Certificate</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{brokerProfile.bir2303Certificate ? "Uploaded" : "Not uploaded"}</p>
                  {brokerProfile.bir2303Certificate && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mayor's Permit</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{brokerProfile.mayorsPermit ? "Uploaded" : "Not uploaded"}</p>
                  {brokerProfile.mayorsPermit && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bureau of Customs Accreditation</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm italic">{brokerProfile.bocAccreditation ? "Uploaded" : "Not uploaded"}</p>
                  {brokerProfile.bocAccreditation && (
                      <Button variant="outline" size="sm" className="h-6 text-xs" title="View document">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-muted/30 p-4 rounded-md">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Info className="h-4 w-4" />
              Additional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="font-medium">{brokerProfile.businessType || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax ID</p>
                <p className="font-medium">{brokerProfile.taxId || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unknown user type</AlertTitle>
        <AlertDescription>
          Cannot display profile information for this user type.
        </AlertDescription>
      </Alert>
  );
}