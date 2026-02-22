
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  RefreshCcw,
  Pencil,
  Box,
  Home
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useEffect, useState, useCallback } from "react";
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
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  
  const [farmData, setFarmData] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  // Product Management State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  
  // Sales Management State
  const [sales, setSales] = useState<any[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState(false);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Vegetables",
    unit: "kg",
    quantity: 10,
    image: "https://picsum.photos/seed/product/400/300"
  });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [stockUpdate, setStockUpdate] = useState({ id: "", quantity: 0 });
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const isFarmer = user?.roles.includes('ROLE_FARMER');

  const fetchFarmDetails = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/farms/my-farm', {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          setFarmData({
            name: data.name,
            description: data.description,
            address: data.address || { street: "", city: "", state: "", zipCode: "" }
          });
          setHasFarm(true);
        }
      } else if (response.status === 404) {
        setHasFarm(false);
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
    } finally {
      setIsLoadingFarm(false);
    }
  }, [token]);

  const fetchMyProducts = useCallback(async () => {
    if (!token) return;
    setIsProductsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/products/my-products', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Inventory Load Failed",
          description: errorData.message || `Error ${response.status}: Failed to fetch products.`,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the product API.",
      });
    } finally {
      setIsProductsLoading(false);
    }
  }, [token, toast]);

  const fetchMySales = useCallback(async () => {
    if (!token) return;
    setIsSalesLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/my-sales', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setSales(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Sales Load Failed",
          description: errorData.message || `Error ${response.status}: Failed to fetch sales history.`,
        });
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the sales API.",
      });
    } finally {
      setIsSalesLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (isFarmer) {
      fetchFarmDetails();
      fetchMyProducts();
      fetchMySales();
    } else {
      setIsLoadingFarm(false);
    }
  }, [isAuthenticated, isFarmer, fetchFarmDetails, fetchMyProducts, fetchMySales, router]);

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const url = hasFarm 
      ? 'http://localhost:8080/api/farms/my-farm' 
      : 'http://localhost:8080/api/farms/register';
    const method = hasFarm ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        body: JSON.stringify(farmData),
      });

      if (response.ok) {
        setHasFarm(true);
        setIsEditingFarm(false);
        toast({
          title: hasFarm ? "Farm Updated" : "Farm Registered!",
          description: hasFarm ? "Your farm details have been updated." : "Your farm storefront has been successfully created.",
        });
        fetchFarmDetails();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save farm details");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message || "Could not connect to the server.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
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
          description: `${newProduct.name} is now live!`,
        });
        setIsDialogOpen(false);
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          category: "Vegetables",
          unit: "kg",
          quantity: 10,
          image: "https://picsum.photos/seed/product/400/300"
        });
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add product");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        body: JSON.stringify(editingProduct),
      });

      if (response.ok) {
        toast({
          title: "Yield Updated",
          description: `${editingProduct.name} details have been updated.`,
        });
        setIsEditDialogOpen(false);
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update yield");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockUpdate.id) return;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${stockUpdate.id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        body: JSON.stringify(stockUpdate.quantity),
      });

      if (response.ok) {
        toast({
          title: "Stock Updated",
          description: "Inventory quantity has been adjusted.",
        });
        setIsStockDialogOpen(false);
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const description = response.status === 403 
          ? "Preflight check failed (CORS/Security). Please ensure your Spring Boot backend allows OPTIONS requests globally."
          : (errorData.message || "Failed to update stock.");
        
        throw new Error(description);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Stock Update Failed",
        description: error.message,
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': token || '' 
        }
      });

      if (response.ok) {
        toast({ title: "Yield Deleted" });
        setIsDeleteConfirmOpen(false);
        setProductToDelete(null);
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete product");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to delete", description: error.message });
    }
  };

  const openDeleteDialog = (product: any) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      unit: product.unit,
      quantity: product.quantity,
      image: product.image || "https://picsum.photos/seed/product/400/300"
    });
    setIsEditDialogOpen(true);
  };

  const openStockDialog = (product: any) => {
    setStockUpdate({ id: product.id, quantity: product.quantity });
    setIsStockDialogOpen(true);
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
                <div className="h-20 w-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center border-2 border-primary/20">
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
                    ) : (!hasFarm || isEditingFarm) ? (
                      <Card className="border-t-4 border-t-primary shadow-lg">
                        <CardHeader>
                          <CardTitle>{hasFarm ? "Edit Farm Details" : "Register Your Farm"}</CardTitle>
                          <CardDescription>
                            {hasFarm ? "Update your farm's public information." : "Enter your farm details to start listing your yields."}
                          </CardDescription>
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
                            
                            <div className="space-y-4 pt-2">
                              <h4 className="text-sm font-bold flex items-center gap-2">
                                <Home className="h-4 w-4 text-primary" /> Farm Address
                              </h4>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="street">Street Address</Label>
                                  <Input 
                                    id="street" 
                                    placeholder="123 Farm Road" 
                                    required 
                                    value={farmData.address.street}
                                    onChange={(e) => setFarmData({
                                      ...farmData, 
                                      address: { ...farmData.address, street: e.target.value }
                                    })}
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input 
                                      id="city" 
                                      placeholder="City" 
                                      required 
                                      value={farmData.address.city}
                                      onChange={(e) => setFarmData({
                                        ...farmData, 
                                        address: { ...farmData.address, city: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input 
                                      id="state" 
                                      placeholder="State" 
                                      required 
                                      value={farmData.address.state}
                                      onChange={(e) => setFarmData({
                                        ...farmData, 
                                        address: { ...farmData.address, state: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="zip">Zip Code</Label>
                                    <Input 
                                      id="zip" 
                                      placeholder="12345" 
                                      required 
                                      value={farmData.address.zipCode}
                                      onChange={(e) => setFarmData({
                                        ...farmData, 
                                        address: { ...farmData.address, zipCode: e.target.value }
                                      })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-2">
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
                          <CardFooter className="gap-3">
                            {isEditingFarm && (
                              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditingFarm(false)}>
                                Cancel
                              </Button>
                            )}
                            <Button type="submit" className="flex-[2] font-bold h-11" disabled={isSaving}>
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : hasFarm ? "Update Farm Profile" : "Launch Farm Storefront"}
                            </Button>
                          </CardFooter>
                        </form>
                      </Card>
                    ) : (
                      <Card className="border-t-4 border-t-primary shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl">{farmData.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" /> 
                              {farmData.address.street}, {farmData.address.city}, {farmData.address.state} {farmData.address.zipCode}
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setIsEditingFarm(true)}>Edit Profile</Button>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Our Story</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {farmData.description || "No description provided yet."}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-muted p-4 rounded-lg text-center border border-transparent hover:border-primary/20 transition-colors">
                              <p className="text-2xl font-bold">{products.length}</p>
                              <p className="text-xs text-muted-foreground uppercase">Active Yields</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg text-center border border-transparent hover:border-primary/20 transition-colors">
                              <p className="text-2xl font-bold">{sales.length}</p>
                              <p className="text-xs text-muted-foreground uppercase">Total Sales</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg text-center border border-transparent hover:border-primary/20 transition-colors">
                              <p className="text-2xl font-bold">5.0</p>
                              <p className="text-xs text-muted-foreground uppercase">Rating</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="inventory">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Yield Inventory</CardTitle>
                          <CardDescription>Manage your active listings and stock levels.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={fetchMyProducts} 
                            disabled={isProductsLoading || !hasFarm}
                            title="Refresh Inventory"
                          >
                            <RefreshCcw className={`h-4 w-4 ${isProductsLoading ? 'animate-spin' : ''}`} />
                          </Button>
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button disabled={!hasFarm} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
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
                                        value={newProduct.quantity}
                                        onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value)})}
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
                                  <Button type="submit" className="w-full">List Yield</Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {!hasFarm ? (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Please register your farm first to add yields.</p>
                          </div>
                        ) : isProductsLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading your yields...</p>
                          </div>
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
                                  <TableCell>{p.quantity}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-primary hover:bg-primary/10 hover:text-primary"
                                        onClick={() => openStockDialog(p)}
                                        title="Quick Stock Update"
                                      >
                                        <Box className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-muted-foreground hover:bg-muted hover:text-foreground"
                                        onClick={() => openEditDialog(p)}
                                        title="Edit Yield"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => openDeleteDialog(p)}
                                        title="Delete Yield"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
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
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Farm Sales</CardTitle>
                          <CardDescription>Track orders from buyers for your farm yields.</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={fetchMySales} 
                          disabled={isSalesLoading}
                          title="Refresh Sales"
                        >
                          <RefreshCcw className={`h-4 w-4 ${isSalesLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isSalesLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading your sales history...</p>
                          </div>
                        ) : sales.length === 0 ? (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No sales activity yet. Your sales will appear here once buyers place orders.</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Buyer</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                  <TableCell className="font-mono text-xs">{sale.id.substring(0, 8)}...</TableCell>
                                  <TableCell className="font-medium">{sale.productName || sale.product?.name}</TableCell>
                                  <TableCell>{sale.buyerName || (sale.user?.firstName + ' ' + sale.user?.lastName)}</TableCell>
                                  <TableCell>{sale.quantity} {sale.unit || sale.product?.unit || 'kg'}</TableCell>
                                  <TableCell className="font-bold text-primary">₹{sale.totalPrice || sale.price}</TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {new Date(sale.orderDate || sale.createdAt || Date.now()).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                                      {sale.status?.toLowerCase() || 'completed'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
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

        {/* Edit Yield Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {editingProduct && (
              <form onSubmit={handleUpdateProduct}>
                <DialogHeader>
                  <DialogTitle>Edit Yield: {editingProduct.name}</DialogTitle>
                  <DialogDescription>Update the details of your harvest listing.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-prod-name">Yield Name</Label>
                      <Input 
                        id="edit-prod-name" 
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-prod-cat">Category</Label>
                      <select 
                        id="edit-prod-cat"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      >
                        <option>Vegetables</option>
                        <option>Fruits</option>
                        <option>Dairy & Eggs</option>
                        <option>Bakery</option>
                        <option>Pantry</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-prod-price">Price (₹)</Label>
                      <Input 
                        id="edit-prod-price" 
                        type="number" 
                        required
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-prod-unit">Unit</Label>
                      <Input 
                        id="edit-prod-unit" 
                        required
                        value={editingProduct.unit}
                        onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prod-desc">Description</Label>
                    <textarea 
                      id="edit-prod-desc"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Save Changes</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Stock Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <form onSubmit={handleUpdateStock}>
              <DialogHeader>
                <DialogTitle>Update Inventory Stock</DialogTitle>
                <DialogDescription>Adjust the available quantity for this yield.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="stock-qty">Current Stock Quantity</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="stock-qty" 
                      type="number" 
                      required
                      className="text-lg font-bold"
                      value={stockUpdate.quantity}
                      onChange={(e) => setStockUpdate({...stockUpdate, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-11">Update Stock Levels</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-bold text-foreground">"{productToDelete?.name}"</span> from your inventory and remove it from the marketplace. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteProduct}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Yield
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

