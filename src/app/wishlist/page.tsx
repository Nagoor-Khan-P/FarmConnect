'use client';

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoveToCart = async (id: string, name: string) => {
    try {
      await moveToCart(id);
      toast({
        title: "Moved to Basket",
        description: `${name} is now in your shopping basket.`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to move item to basket." });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      toast({ title: "Removed from Wishlist" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove item." });
    }
  };

  // Helper to resolve backend image paths
  const resolveImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8080${cleanPath}`;
  };

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 space-y-6">
            <div className="mx-auto bg-muted w-16 h-16 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline">Sign in for Wishlist</h2>
              <p className="text-muted-foreground">Please sign in to view and manage your saved yields.</p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/auth/login?redirect=/wishlist">Sign In Now</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-destructive fill-destructive" />
            <h1 className="text-3xl font-bold font-headline">My Wishlist</h1>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="mx-auto bg-muted w-24 h-24 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-headline">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Save your favorite fresh yields for later! Explore our local farms to find what's in season.
            </p>
            <Button size="lg" asChild>
              <Link href="/explore">Explore Harvest</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="overflow-hidden border-none shadow-sm bg-card/60 flex flex-col h-full group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image 
                    src={resolveImageUrl(item.image) || `https://picsum.photos/seed/${item.productId}/400/300`} 
                    alt={item.name} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="p-4 flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Store className="h-3 w-3 text-primary" />
                    <span>{item.farmName || "Local Farm"}</span>
                  </div>
                  <div className="mt-3 text-xl font-bold text-primary">
                    ₹{item.price.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ {item.unit}</span>
                  </div>
                </CardHeader>
                <CardFooter className="p-4 pt-0 gap-2">
                  <Button 
                    className="flex-1 gap-2 font-bold" 
                    onClick={() => handleMoveToCart(item.id, item.name)}
                  >
                    <ShoppingBag className="h-4 w-4" /> Move to Basket
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {wishlist.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Button variant="outline" asChild className="gap-2 border-primary text-primary hover:bg-primary/5">
              <Link href="/explore">
                Discover More Harvests <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
