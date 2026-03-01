'use client';

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Loader2, Store, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to resolve backend image paths
  const resolveImageUrl = (item: CartItem) => {
    const path = item.image;
    if (!path) return `https://picsum.photos/seed/${item.productId || item.id}/400/300`;
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">Your Shopping Basket</h1>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="mx-auto bg-muted w-24 h-24 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-headline">Your basket is empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Looks like you haven't added any fresh yields yet. Explore our latest harvest and support local farmers!
            </p>
            <Button size="lg" asChild>
              <Link href="/explore">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="overflow-hidden border-none shadow-sm bg-card/60">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-32 h-32">
                      <Image 
                        src={resolveImageUrl(item)} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-primary">{item.name}</h3>
                          <div className="flex flex-col gap-0.5">
                            {item.farmName && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Store className="h-3 w-3 text-primary" />
                                <span className="font-medium">Farm: {item.farmName}</span>
                              </div>
                            )}
                            {item.farmerName && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3 text-primary" />
                                <span>Farmer: {item.farmerName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border rounded-md bg-background overflow-hidden">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-none"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 transition-colors rounded-none"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} / {item.unit}</p>
                          <p className="font-bold text-lg text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="pt-4">
                <Button variant="outline" asChild className="gap-2 border-primary text-primary hover:bg-primary/5">
                  <Link href="/explore">
                    Continue Shopping <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Card className="sticky top-24 border-primary/20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-primary font-medium italic">Calculated at next step</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full h-12 text-lg font-bold" asChild>
                    <Link href={isAuthenticated ? "/checkout" : "/auth/login?redirect=checkout"}>
                      Secure Checkout
                    </Link>
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{isAuthenticated ? "Secure Encrypted Transaction" : "Safe & Secure Guest Shopping"}</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}