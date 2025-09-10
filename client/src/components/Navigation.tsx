import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-slate-800">MindTrack</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium transition-colors ${
              isActive("/") && location === "/"
                ? "text-blue-600" 
                : "text-slate-600 hover:text-blue-600"
            }`}>
              Dashboard
            </Link>
            <Link href="/assessment" className={`font-medium transition-colors ${
              isActive("/assessment") 
                ? "text-blue-600" 
                : "text-slate-600 hover:text-blue-600"
            }`}>
              Assessments
            </Link>
            <Link href="/insights" className={`font-medium transition-colors ${
              isActive("/insights") 
                ? "text-blue-600" 
                : "text-slate-600 hover:text-blue-600"
            }`}>
              Insights
            </Link>
            <Link href="/progress" className={`font-medium transition-colors ${
              isActive("/progress") 
                ? "text-blue-600" 
                : "text-slate-600 hover:text-blue-600"
            }`}>
              Progress
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={(user as any)?.profileImageUrl} 
                      alt={(user as any)?.firstName || "User"} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {(user as any)?.email}
                  </p>
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
