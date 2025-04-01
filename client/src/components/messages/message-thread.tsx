import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { User, Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageThreadProps {
  currentUser: User;
  otherUser: User;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export default function MessageThread({
  currentUser,
  otherUser,
  messages,
  onSendMessage,
  isLoading = false,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (data: MessageFormValues) => {
    onSendMessage(data.content);
    reset();
  };

  // Get initials for avatar
  const getInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Format message time
  const formatMessageTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };

  // Get background color for the other user's avatar
  const getOtherUserAvatarColor = () => {
    const username = otherUser.username;
    const colors = [
      "bg-primary-200 text-primary-600",
      "bg-amber-100 text-amber-500",
      "bg-green-100 text-green-600",
      "bg-red-100 text-red-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
    ];
    
    const hash = username.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-lg font-medium text-secondary-900 mb-2">
            No messages yet
          </div>
          <p className="text-sm text-secondary-500 max-w-md">
            Send a message to {otherUser.firstName} {otherUser.lastName} to start the conversation.
          </p>
        </div>
        
        <div className="p-4 border-t border-secondary-200 bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center">
            <Button type="button" variant="ghost" size="icon" className="mr-2">
              <Paperclip className="h-5 w-5 text-secondary-400" />
            </Button>
            <div className="flex-1 relative">
              <Input
                className="pr-10"
                placeholder="Type your message..."
                {...register("content")}
              />
              {errors.content && (
                <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
              )}
            </div>
            <Button type="submit" className="ml-2" disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto bg-secondary-50">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-secondary-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-secondary-200 rounded"></div>
                  <div className="h-2 bg-secondary-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isSender = message.senderId === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isSender ? "justify-end" : "justify-start"
                  )}
                >
                  {!isSender && (
                    <div 
                      className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                        getOtherUserAvatarColor()
                      )}
                    >
                      <span className="font-medium">
                        {getInitials(otherUser)}
                      </span>
                    </div>
                  )}
                  <div className={cn("max-w-md", isSender ? "mr-3" : "ml-3")}>
                    <div
                      className={cn(
                        "p-3 rounded-lg shadow-sm",
                        isSender
                          ? "bg-primary-500 text-white"
                          : "bg-white text-secondary-700"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span
                      className={cn(
                        "text-xs text-secondary-500 mt-1",
                        isSender ? "flex justify-end" : ""
                      )}
                    >
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  {isSender && (
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary-700 flex items-center justify-center text-white">
                      <span className="font-medium">
                        {getInitials(currentUser)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-secondary-200 bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center">
          <Button type="button" variant="ghost" size="icon" className="mr-2">
            <Paperclip className="h-5 w-5 text-secondary-400" />
          </Button>
          <div className="flex-1 relative">
            <Input
              className="pr-10"
              placeholder="Type your message..."
              {...register("content")}
              disabled={isLoading}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>
          <Button type="submit" className="ml-2" disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
