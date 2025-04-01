import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { format } from "date-fns";

interface Conversation {
  id: number;
  otherUser: User;
  lastMessageTime: Date;
  latestMessage: {
    content: string;
    createdAt: Date;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

interface MessageListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
}

export default function MessageList({
                                      conversations,
                                      selectedConversationId,
                                    }: MessageListProps) {
  const [location] = useLocation();

  if (conversations.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="text-lg font-medium text-secondary-900 mb-2">No conversations yet</div>
          <p className="text-sm text-secondary-500">
            When you start conversations with shipping partners, they will appear here.
          </p>
        </div>
    );
  }

  // Get initials for avatar
  const getInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Get background color for avatar based on username (basic hashing)
  const getAvatarColor = (username: string) => {
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

  return (
      <ul className="divide-y divide-secondary-200">
        {conversations.map((conversation) => {
          const isActive = selectedConversationId === conversation.id;
          const truncatedMessage = conversation.latestMessage?.content.length ?? 0 > 30
              ? `${conversation.latestMessage?.content.slice(0, 30)}...`
              : conversation.latestMessage?.content;

          return (
              <li key={conversation.id}>
                <Link href={`/messages/${conversation.id}`}>
                  <a
                      className={cn(
                          "px-4 py-3 flex items-center hover:bg-secondary-50",
                          isActive && "bg-primary-50",
                          "cursor-pointer"
                      )}
                  >
                    <div className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                        getAvatarColor(conversation.otherUser.username)
                    )}>
                  <span className="font-medium">
                    {getInitials(conversation.otherUser)}
                  </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-secondary-900">
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                      </p>
                      <p className="text-sm text-secondary-500 truncate">
                        {truncatedMessage || "No messages yet"}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      <p className="text-xs text-secondary-500">
                        {conversation.latestMessage
                            ? format(new Date(conversation.latestMessage.createdAt), "MMM d")
                            : format(new Date(conversation.lastMessageTime), "MMM d")}
                      </p>
                      {conversation.unreadCount > 0 && (
                          <span className="inline-block w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center mt-1">
                      {conversation.unreadCount}
                    </span>
                      )}
                    </div>
                  </a>
                </Link>
              </li>
          );
        })}
      </ul>
  );
}
