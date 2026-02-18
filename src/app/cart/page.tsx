
"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  // Empty state for demo
  const cartItems: any[] = [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-headline mb-8">Your Shopping Basket</h1>

        {cartItems.length === 0 ? (
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
              {/* Cart items would go here */}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-primary font-medium">Calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹0.00</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full h-12 text-lg">Proceed to Checkout</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
