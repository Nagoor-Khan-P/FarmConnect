
"use client";

import Link from "next/link";
import { Leaf, Search, ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Navbar() {
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

        {/* Desktop Navigation - Hidden on medium and smaller screens */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/explore" className="hover:text-primary transition-colors whitespace-nowrap">Explore Yields</Link>
          <Link href="/farmers" className="hover:text-primary transition-colors whitespace-nowrap">Meet Farmers</Link>
          <Link href="/about" className="hover:text-primary transition-colors whitespace-nowrap">Our Mission</Link>
        </nav>

        {/* Actions Section */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Search Bar - Hidden on small screens, shown on medium+ */}
          <div className="relative hidden md:block shrink">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search yields..."
              className="pl-8 h-9 w-40 lg:w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center text-white">0</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shrink-0">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/register">Sign Up</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/farmer/register">Register as Farmer</Link>
              </DropdownMenuItem>
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
