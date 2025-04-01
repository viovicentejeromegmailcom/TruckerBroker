import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Bell, Truck } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Safely get user initials - handle potential undefined values
  const userInitials = user
      ? `${(user.firstName || '').charAt(0) || ''}${(user.lastName || '').charAt(0) || ''}` || 'U'
      : "U";

  // Determine which dashboard link to use based on user type
  const dashboardLink = user ?
      user.userType === "admin" ? "/admin" :
          user.userType === "trucker" ? "/trucker/dashboard" :
              "/broker/dashboard" : "/";

  return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Truck className="h-6 w-6 text-primary-500 mr-2" />
                <Link href="/">
                  <span className="cursor-pointer font-bold text-xl text-secondary-900">TruckLink</span>
                </Link>
              </div>

              {user && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link href={dashboardLink} className={`${location === dashboardLink ? 'border-primary-500 text-secondary-900' : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                      Dashboard
                    </Link>
                    <Link href="/jobs" className={`${location.startsWith('/jobs') ? 'border-primary-500 text-secondary-900' : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                      Jobs
                    </Link>
                    <Link href="/messages" className={`${location === '/messages' ? 'border-primary-500 text-secondary-900' : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                      Messages
                    </Link>
                    <Link href="/profile" className={`${location === '/profile' ? 'border-primary-500 text-secondary-900' : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}>
                      Profile
                    </Link>
                  </div>
              )}
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                  <>
                    <button className="p-1 rounded-full text-secondary-500 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <Bell className="h-6 w-6" />
                    </button>
                    <div className="ml-3 relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <span className="sr-only">Open user menu</span>
                            <Avatar className="h-8 w-8 bg-primary-500 text-white">
                              <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            <div className="text-sm font-medium">{user.firstName || ''} {user.lastName || ''}</div>
                            <div className="text-xs text-secondary-500">{user.email || ''}</div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer w-full">
                              Your Profile
                            </Link>
                          </DropdownMenuItem>
                          {user.userType === "admin" && (
                              <DropdownMenuItem asChild>
                                <Link href="/admin" className="cursor-pointer w-full">
                                  Admin Dashboard
                                </Link>
                              </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
              ) : (
                  <div className="flex space-x-4">
                    <Button variant="outline" asChild>
                      <Link href="/auth">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth">Sign up</Link>
                    </Button>
                  </div>
              )}
            </div>

            <div className="flex items-center sm:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button className="inline-flex items-center justify-center p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                    <span className="sr-only">Open main menu</span>
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>TruckLink</SheetTitle>
                    {user && (
                        <SheetDescription className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 bg-primary-500 text-white">
                            <AvatarFallback>{userInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{user.firstName || ''} {user.lastName || ''}</div>
                            <div className="text-xs text-secondary-500">{user.email || ''}</div>
                          </div>
                        </SheetDescription>
                    )}
                  </SheetHeader>
                  <div className="py-4 space-y-2">
                    {user ? (
                        <>
                          <Button
                              variant="ghost"
                              className="w-full justify-start"
                              asChild
                          >
                            <Link href={dashboardLink} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                          </Button>
                          <Button
                              variant="ghost"
                              className="w-full justify-start"
                              asChild
                          >
                            <Link href="/jobs" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
                          </Button>
                          <Button
                              variant="ghost"
                              className="w-full justify-start"
                              asChild
                          >
                            <Link href="/messages" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                          </Button>
                          <Button
                              variant="ghost"
                              className="w-full justify-start"
                              asChild
                          >
                            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                          </Button>

                          {user.userType === "admin" && (
                              <Button
                                  variant="ghost"
                                  className="w-full justify-start"
                                  asChild
                              >
                                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                              </Button>
                          )}

                          <div className="pt-2 border-t border-gray-200">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  handleLogout();
                                }}
                            >
                              Sign out
                            </Button>
                          </div>
                        </>
                    ) : (
                        <>
                          <Button
                              variant="ghost"
                              className="w-full justify-start"
                              asChild
                          >
                            <Link href="/auth" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                          </Button>
                          <Button
                              className="w-full"
                              asChild
                          >
                            <Link href="/auth" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                          </Button>
                        </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
  );
}
