
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Settings, User, LogOut, Mail, Shield, ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

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
                <h3 className="font-bold text-lg">{user.firstName} {user.lastName}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
                  {user.roles[0]?.replace('ROLE_', '') || 'User'}
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Mail className="h-3 w-3" /> {user.email}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-6 w-full text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 w-full">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-headline">Account Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user.username}!</p>
              </div>
              <Button asChild className="gap-2 bg-primary hover:bg-primary/90 font-bold">
                <Link href="/explore">
                  <ShoppingBag className="h-4 w-4" /> Start Shopping
                </Link>
              </Button>
            </div>
            
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="orders" className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Recent Orders
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="gap-2">
                  <Heart className="h-4 w-4" /> Wishlist
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                  <Shield className="h-4 w-4" /> Account Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>Manage and track your recent farm-fresh purchases.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 space-y-4 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">No orders placed yet. Start exploring fresh yields!</p>
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
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      Your wishlist is empty.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your identity and roles on FarmConnect.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Full Name</p>
                        <p className="text-lg">{user.firstName} {user.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Username</p>
                        <p className="text-lg">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Email Address</p>
                        <p className="text-lg">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Assigned Roles</p>
                        <div className="flex gap-2 mt-1">
                          {user.roles.map(role => (
                            <span key={role} className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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
