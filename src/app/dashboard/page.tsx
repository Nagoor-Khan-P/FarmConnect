
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut, 
  Mail, 
  Shield, 
  ShoppingBag, 
  Plus, 
  Store, 
  Package, 
  TrendingUp,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AiYieldDescription } from "@/components/AiYieldDescription";

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasFarm, setHasFarm] = useState(false);
  const [farmData, setFarmData] = useState({
    name: "",
    location: "",
    description: ""
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const isFarmer = user.roles.includes('ROLE_FARMER');

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    setHasFarm(true);
  };

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
                  className="mt-6 w-full text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
                <h1 className="text-3xl font-bold font-headline">
                  {isFarmer ? "Farmer Command Center" : "Account Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user.username}!</p>
              </div>
              {!isFarmer && (
                <Button asChild className="gap-2 bg-primary hover:bg-primary/90 font-bold text-primary-foreground">
                  <Link href="/explore">
                    <ShoppingBag className="h-4 w-4" /> Start Shopping
                  </Link>
                </Button>
              )}
            </div>
            
            <Tabs defaultValue={isFarmer ? "farm" : "orders"} className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                {isFarmer ? (
                  <>
                    <TabsTrigger value="farm" className="gap-2">
                      <Store className="h-4 w-4" /> My Farm
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="gap-2">
                      <Package className="h-4 w-4" /> Inventory
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="gap-2">
                      <TrendingUp className="h-4 w-4" /> Sales
                    </TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="orders" className="gap-2">
                      <ShoppingCart className="h-4 w-4" /> Recent Orders
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="gap-2">
                      <Heart className="h-4 w-4" /> Wishlist
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger value="profile" className="gap-2">
                  <Shield className="h-4 w-4" /> Profile
                </TabsTrigger>
              </TabsList>

              {/* Farmer Specific Content */}
              {isFarmer && (
                <>
                  <TabsContent value="farm">
                    {!hasFarm ? (
                      <Card className="border-t-4 border-t-primary">
                        <CardHeader>
                          <CardTitle>Register Your Farm</CardTitle>
                          <CardDescription>Enter your farm details to start listing your yields.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSaveFarm}>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="farm-name">Farm Name</Label>
                              <Input 
                                id="farm-name" 
                                placeholder="e.g. Green Valley Organic Farm" 
                                required 
                                value={farmData.name}
                                onChange={(e) => setFarmData({...farmData, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  id="location" 
                                  className="pl-9" 
                                  placeholder="e.g. East Hills, California" 
                                  required 
                                  value={farmData.location}
                                  onChange={(e) => setFarmData({...farmData, location: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="desc">Farm Story</Label>
                              <textarea 
                                id="desc" 
                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                placeholder="Tell us a bit about your sustainable practices..."
                                value={farmData.description}
                                onChange={(e) => setFarmData({...farmData, description: e.target.value})}
                              />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button type="submit" className="w-full font-bold">Launch Farm Storefront</Button>
                          </CardFooter>
                        </form>
                      </Card>
                    ) : (
                      <Card className="border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>{farmData.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" /> {farmData.location}
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setHasFarm(false)}>Edit Profile</Button>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Our Story</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {farmData.description || "No description provided yet."}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-muted p-4 rounded-lg text-center">
                              <p className="text-2xl font-bold">0</p>
                              <p className="text-xs text-muted-foreground uppercase">Active Yields</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg text-center">
                              <p className="text-2xl font-bold">0</p>
                              <p className="text-xs text-muted-foreground uppercase">Monthly Sales</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg text-center">
                              <p className="text-2xl font-bold">5.0</p>
                              <p className="text-xs text-muted-foreground uppercase">Rating</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="inventory">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Yield Inventory</CardTitle>
                          <CardDescription>Manage your active listings and stock levels.</CardDescription>
                        </div>
                        <Button disabled={!hasFarm} className="gap-2">
                          <Plus className="h-4 w-4" /> Add New Yield
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {!hasFarm ? (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Please register your farm first to add yields.</p>
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">You haven't added any yields yet.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sales">
                    <Card>
                      <CardHeader>
                        <CardTitle>Farm Sales</CardTitle>
                        <CardDescription>Track orders from buyers for your farm yields.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No sales activity yet. Your sales will appear here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}

              {/* Buyer Specific Content */}
              {!isFarmer && (
                <>
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
                </>
              )}

              {/* Common Profile Content */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your identity and roles on FarmConnect.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Full Name</p>
                        <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Username</p>
                        <p className="text-lg font-medium">{user.username}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Email Address</p>
                        <p className="text-lg font-medium">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Assigned Roles</p>
                        <div className="flex gap-2 mt-1">
                          {user.roles.map(role => (
                            <span key={role} className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {role}
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
