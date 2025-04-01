import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MessageList from "@/components/messages/message-list";
import MessageThread from "@/components/messages/message-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Message, Conversation } from "@shared/schema";
import { MessagesSquare, Users, PlusCircle, Search, Loader2 } from "lucide-react";

interface ConversationWithDetails extends Conversation {
  otherUser: User;
  latestMessage: Message | null;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams();
  const conversationId = params.id ? parseInt(params.id) : undefined;

  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Fetch all conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations
  } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // If conversationId is provided, fetch messages for that conversation
  // Otherwise, don't fetch any messages
  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId && !!user,
  });

  // Get other user from the selected conversation
  const selectedConversation = conversationId
      ? conversations?.find(c => c.id === conversationId)
      : undefined;

  const otherUser = selectedConversation?.otherUser;

  // Fetch all users for new message dialog
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: newUserDialogOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!otherUser && !selectedUserId) return;

      const receiverId = otherUser?.id || selectedUserId;
      if (!receiverId) return;

      await apiRequest("POST", "/api/messages", {
        receiverId,
        content
      });
    },
    onSuccess: () => {
      setNewMessage("");

      // If it was a new conversation, we need to refresh the conversations list
      // and potentially navigate to the new conversation
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });

      // If we already have a conversation open, refresh its messages
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/conversations/${conversationId}/messages`]
        });
      }

      // Close the new message dialog if it was open
      setNewUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message.",
        variant: "destructive",
      });
    },
  });

  // Function to handle sending a message
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessageMutation.mutate(content);
  };

  // Handle creation of a new conversation
  const handleStartNewConversation = () => {
    if (!selectedUserId) {
      toast({
        title: "No user selected",
        description: "Please select a user to message",
        variant: "destructive",
      });
      return;
    }

    // Check if conversation already exists
    const existingConversation = conversations?.find(
        c => c.otherUser.id === selectedUserId
    );

    if (existingConversation) {
      // Navigate to existing conversation
      navigate(`/messages/${existingConversation.id}`);
      setNewUserDialogOpen(false);
      return;
    }

    // If the conversation doesn't exist yet, we'll create it by sending a message
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    } else {
      toast({
        title: "No message content",
        description: "Please enter a message to start the conversation",
        variant: "destructive",
      });
    }
  };

  // If no conversation is selected and there are conversations available,
  // automatically select the first one
  useEffect(() => {
    if (!conversationId && conversations && conversations.length > 0 && !isLoadingConversations) {
      navigate(`/messages/${conversations[0].id}`);
    }
  }, [conversationId, conversations, isLoadingConversations, navigate]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow bg-secondary-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-secondary-900 mb-1">Messages</h1>
            <p className="text-sm text-secondary-500 mb-6">
              Communicate with your shipping partners
            </p>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Conversations List */}
                <div className="md:col-span-1 bg-white border-r border-secondary-200">
                  <div className="py-4 px-4 border-b border-secondary-200 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-secondary-900">Conversations</h2>
                    <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                          <PlusCircle className="h-5 w-5" />
                          <span className="sr-only">New Conversation</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New Message</DialogTitle>
                          <DialogDescription>
                            Select a user to start a new conversation
                          </DialogDescription>
                        </DialogHeader>

                        {isLoadingUsers ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            </div>
                        ) : (
                            <div className="py-4 space-y-4">
                              <Select onValueChange={(value) => setSelectedUserId(Number(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allUsers?.filter(u => u.id !== user.id).map((u) => (
                                      <SelectItem key={u.id} value={u.id.toString()}>
                                        {u.firstName} {u.lastName} - {u.userType}
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <div className="mt-4">
                                <Input
                                    placeholder="Write your first message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full"
                                />
                              </div>
                            </div>
                        )}

                        <DialogFooter>
                          <Button
                              variant="outline"
                              onClick={() => setNewUserDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                              onClick={handleStartNewConversation}
                              disabled={isLoadingUsers || !selectedUserId || sendMessageMutation.isPending}
                          >
                            {sendMessageMutation.isPending ? "Sending..." : "Start Conversation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {isLoadingConversations ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                      </div>
                  ) : conversations && conversations.length > 0 ? (
                      <div className="h-[calc(100vh-16rem)] overflow-y-auto">
                        <MessageList
                            conversations={conversations}
                            selectedConversationId={conversationId}
                        />
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                        <MessagesSquare className="h-12 w-12 text-secondary-400 mb-4" />
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">No conversations yet</h3>
                        <p className="text-secondary-500 mb-6">
                          Start a conversation with a shipping partner to coordinate deliveries and ask questions.
                        </p>
                        <Button onClick={() => setNewUserDialogOpen(true)}>
                          <Users className="mr-2 h-4 w-4" />
                          New Conversation
                        </Button>
                      </div>
                  )}
                </div>

                {/* Message Thread */}
                <div className="md:col-span-2 flex flex-col h-[calc(100vh-16rem)]">
                  {selectedConversation && otherUser ? (
                      <>
                        <div className="py-4 px-4 border-b border-secondary-200 flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600">
                        <span className="font-medium">
                          {otherUser.firstName.charAt(0)}{otherUser.lastName.charAt(0)}
                        </span>
                          </div>
                          <div className="ml-3">
                            <h2 className="text-lg font-medium text-secondary-900">
                              {otherUser.firstName} {otherUser.lastName}
                            </h2>
                            <p className="text-sm text-secondary-500">
                              {otherUser.userType === 'trucker' ? 'Trucker' : 'Broker'}
                            </p>
                          </div>
                        </div>

                        <MessageThread
                            currentUser={user}
                            otherUser={otherUser}
                            messages={messages || []}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoadingMessages || sendMessageMutation.isPending}
                        />
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <MessagesSquare className="h-16 w-16 text-secondary-300 mb-4" />
                        <h3 className="text-xl font-medium text-secondary-900 mb-2">
                          Select a conversation
                        </h3>
                        <p className="text-secondary-500 max-w-md">
                          Choose a conversation from the sidebar or start a new one to begin messaging
                        </p>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
  );
}
