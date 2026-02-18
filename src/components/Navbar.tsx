
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Search, ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/explore", label: "Explore Yields" },
    { href: "/farmers", label: "Meet Farmers" },
    { href: "/about", label: "Our Mission" },
  ];

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
                "transition-colors hover:text-primary whitespace-nowrap",
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
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <ShoppingBag className={cn("h-5 w-5", pathname === "/cart" && "text-primary")} />
              <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center text-white">0</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className={cn("rounded-full shrink-0", pathname.startsWith("/dashboard") && "border-primary")}>
                <User className={cn("h-5 w-5", pathname.startsWith("/dashboard") && "text-primary")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className={cn(pathname === "/dashboard" && "font-bold text-primary")}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/register" className={cn(pathname === "/auth/register" && "font-bold text-primary")}>Sign Up</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/farmer/register" className={cn(pathname === "/farmer/register" && "font-bold text-primary")}>Register as Farmer</Link>
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
