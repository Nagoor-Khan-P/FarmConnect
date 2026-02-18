
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Settings, User } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground">Member since 2024</p>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold font-headline mb-8">Account Dashboard</h1>
            
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="orders" className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Recent Orders
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="gap-2">
                  <Heart className="h-4 w-4" /> Wishlist
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" /> Profile Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>Manage and track your recent farm-fresh purchases.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      No orders placed yet. Start exploring fresh yields!
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist">
                <Card>
                  <CardHeader>
                    <CardTitle>Wishlist</CardTitle>
                    <CardDescription>Your favorite yields saved for later.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Your wishlist is empty.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information and delivery address.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Settings configuration coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
