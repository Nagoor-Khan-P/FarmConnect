
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
  CheckCircle2,
  Loader2,
  Trash2,
  AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AiYieldDescription } from "@/components/AiYieldDescription";

export default function DashboardPage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [hasFarm, setHasFarm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFarm, setIsLoadingFarm] = useState(true);
  const [farmData, setFarmData] = useState({
    name: "",
    address: "",
    description: ""
  });

  // Product Management State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Vegetables",
    unit: "kg",
    stockQuantity: 10,
    image: "https://picsum.photos/seed/product/400/300"
  });

  const isFarmer = user?.roles.includes('ROLE_FARMER');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (isFarmer && token) {
      fetchFarmDetails();
      fetchMyProducts();
    } else {
      setIsLoadingFarm(false);
    }
  }, [isAuthenticated, isFarmer, token, router]);

  const fetchFarmDetails = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/farms/my-farm', {
        method: 'GET',
        headers: {
          'Authorization': token || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          setFarmData({
            name: data.name,
            address: data.address,
            description: data.description
          });
          setHasFarm(true);
        }
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
    } finally {
      setIsLoadingFarm(false);
    }
  };

  const fetchMyProducts = async () => {
    setIsProductsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/products/my-products', {
        headers: { 'Authorization': token || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:8080/api/farms/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        body: JSON.stringify({
          name: farmData.name,
          address: farmData.address,
          description: farmData.description
        }),
      });

      if (response.ok) {
        setHasFarm(true);
        toast({
          title: "Farm Registered!",
          description: "Your farm storefront has been successfully created.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to register farm");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not connect to the server.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);

    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        toast({
          title: "Yield Added",
          description: `${newProduct.name} is now live on the marketplace.`,
        });
        setIsDialogOpen(false);
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          category: "Vegetables",
          unit: "kg",
          stockQuantity: 10,
          image: "https://picsum.photos/seed/product/400/300"
        });
        fetchMyProducts();
      } else {
        throw new Error("Failed to add product");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this yield?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });

      if (response.ok) {
        toast({ title: "Yield Deleted" });
        fetchMyProducts();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

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
                  className="mt-6 w-full text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-colors"
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

              {isFarmer && (
                <>
                  <TabsContent value="farm">
                    {isLoadingFarm ? (
                      <Card className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </Card>
                    ) : !hasFarm ? (
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
                              <Label htmlFor="address">Address</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  id="address" 
                                  className="pl-9" 
                                  placeholder="e.g. 123 Farm Road, Countryside" 
                                  required 
                                  value={farmData.address}
                                  onChange={(e) => setFarmData({...farmData, address: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="desc">Farm Story</Label>
                              <textarea 
                                id="desc" 
                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Tell us about your organic vegetables and fruits..."
                                value={farmData.description}
                                onChange={(e) => setFarmData({...farmData, description: e.target.value})}
                              />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button type="submit" className="w-full font-bold" disabled={isSaving}>
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Registering Farm...
                                </>
                              ) : "Launch Farm Storefront"}
                            </Button>
                          </CardFooter>
                        </form>
                      </Card>
                    ) : (
                      <Card className="border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>{farmData.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" /> {farmData.address}
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
                              <p className="text-2xl font-bold">{products.length}</p>
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
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button disabled={!hasFarm} className="gap-2">
                              <Plus className="h-4 w-4" /> Add New Yield
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleAddProduct}>
                              <DialogHeader>
                                <DialogTitle>Add New Yield</DialogTitle>
                                <DialogDescription>Fill in the details to list your fresh harvest.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="prod-name">Yield Name</Label>
                                    <Input 
                                      id="prod-name" 
                                      placeholder="e.g. Fuji Apples" 
                                      required
                                      value={newProduct.name}
                                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="prod-cat">Category</Label>
                                    <select 
                                      id="prod-cat"
                                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      value={newProduct.category}
                                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                    >
                                      <option>Vegetables</option>
                                      <option>Fruits</option>
                                      <option>Dairy & Eggs</option>
                                      <option>Bakery</option>
                                      <option>Pantry</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="prod-price">Price (₹)</Label>
                                    <Input 
                                      id="prod-price" 
                                      type="number" 
                                      required
                                      value={newProduct.price}
                                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="prod-unit">Unit</Label>
                                    <Input 
                                      id="prod-unit" 
                                      placeholder="kg, bunch" 
                                      required
                                      value={newProduct.unit}
                                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="prod-stock">Stock</Label>
                                    <Input 
                                      id="prod-stock" 
                                      type="number" 
                                      required
                                      value={newProduct.stockQuantity}
                                      onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value)})}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <AiYieldDescription 
                                    yieldType={newProduct.name}
                                    characteristics={["fresh", "local", "organic"]}
                                    onGenerated={(desc) => setNewProduct({...newProduct, description: desc})}
                                  />
                                  <textarea 
                                    id="prod-desc"
                                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Describe your yield..."
                                    required
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={isAddingProduct}>
                                  {isAddingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : "List Yield"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        {!hasFarm ? (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Please register your farm first to add yields.</p>
                          </div>
                        ) : isProductsLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : products.length === 0 ? (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">You haven't added any yields yet.</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Yield</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {products.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell className="font-medium">{p.name}</TableCell>
                                  <TableCell>{p.category}</TableCell>
                                  <TableCell>₹{p.price} / {p.unit}</TableCell>
                                  <TableCell>{p.stockQuantity}</TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-destructive"
                                      onClick={() => handleDeleteProduct(p.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
