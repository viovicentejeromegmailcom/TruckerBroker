import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, Search, Check, X, AlertCircle } from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

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
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Fetch all users
  const { data: allUsers, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/admin/all-users"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin" && activeTab === "users",
  });

  // Fetch approval history
  const { data: approvalHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["/api/admin/approval-history"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin" && activeTab === "history",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  // Fetch pending users
  const {
    data: pendingUsers,
    isLoading: isPendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ["/api/admin/pending-users"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && user.userType === "admin",
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
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

  const filteredUsers = pendingUsers
      ? pendingUsers.filter(
          (user: any) =>
              user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : [];

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
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="pending" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="pending">Pending Registrations</TabsTrigger>
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Registrations</CardTitle>
                <CardDescription>
                  Review and approve new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPendingLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : pendingError ? (
                    <div className="flex flex-col items-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                      <p>Failed to load pending registrations</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No matching users found" : "No pending registrations"}
                    </div>
                ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user: any) => (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                                </TableCell>
                                <TableCell>
                                  <div>{user.email}</div>
                                  <div className="text-sm text-muted-foreground">{user.phone}</div>
                                </TableCell>
                                <TableCell>{getUserTypeLabel(user.userType)}</TableCell>
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
                <CardDescription>Manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : allUsers?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers?.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              </TableCell>
                              <TableCell>{getUserTypeLabel(user.userType)}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === "approved" ? "success" : "secondary"}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>Review past approval decisions</CardDescription>
              </CardHeader>
              <CardContent>
                {isHistoryLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : approvalHistory?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No approval history found
                    </div>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Decision</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvalHistory?.map((history: any) => (
                            <TableRow key={history.id}>
                              <TableCell>
                                <div className="font-medium">{history.userName}</div>
                                <div className="text-sm text-muted-foreground">{history.userEmail}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={history.approved ? "success" : "destructive"}>
                                  {history.approved ? "Approved" : "Rejected"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(history.createdAt)}</TableCell>
                              <TableCell>{history.message || "-"}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
      </div>
  );
}