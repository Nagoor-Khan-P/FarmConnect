"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Search, ShoppingBag, User, Menu, LogOut, LayoutDashboard, Bell, Trash2, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { history, clearHistory } = useToast();
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isFarmer = user?.roles.includes('ROLE_FARMER');

  const buyerLinks = [
    { href: "/explore", label: "Explore Yields" },
    { href: "/farmers", label: "Meet Farmers" },
    { href: "/about", label: "Our Mission" },
  ];

  const farmerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/explore", label: "Explore" },
    { href: "/about", label: "Our Mission" },
  ];

  const navLinks = isFarmer ? farmerLinks : buyerLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline text-primary tracking-tight whitespace-nowrap">FarmConnect</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary whitespace-nowrap flex items-center gap-1.5",
                pathname === link.href 
                  ? "text-primary font-bold" 
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions Section */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Search Bar */}
          <div className="relative hidden md:block shrink">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search yields..."
              className="pl-8 h-9 w-40 lg:w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Notifications Bell */}
          {mounted && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative shrink-0">
                  <Bell className="h-5 w-5" />
                  {history.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-bold text-sm">Notifications</h4>
                  {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="h-8 text-xs text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {history.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No recent notifications
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {history.map((item) => {
                        const copyText = `${item.title ? item.title + ': ' : ''}${item.description || ''}`;
                        return (
                          <div key={item.id} className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors group relative">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-sm pr-6">{item.title || "Notification"}</p>
                              <button 
                                onClick={() => handleCopy(item.id, copyText)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded-md"
                              >
                                {copiedId === item.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                              <Clock className="h-2 w-2" />
                              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <ShoppingBag className={cn("h-5 w-5", pathname === "/cart" && "text-primary")} />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className={cn("rounded-full shrink-0", (pathname.startsWith("/dashboard") || isAuthenticated) && "border-primary")}>
                {isAuthenticated && user ? (
                  <div className="bg-primary/10 w-full h-full flex items-center justify-center rounded-full text-xs font-bold text-primary">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                ) : (
                  <User className={cn("h-5 w-5", pathname.startsWith("/dashboard") && "text-primary")} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated && user ? (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium">
                    <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/auth/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/auth/register">Create Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/farmer/register" className="font-bold text-primary">Become a Farmer Partner</Link>
                  </DropdownMenuItem>
                </>
              )}
              {isAuthenticated && !isFarmer && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/farmer/register" className="font-bold text-primary">Upgrade to Farmer</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
