
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
  Home,
  ImageIcon,
  Upload,
  Globe,
  Calendar,
  Clock,
  History,
  XCircle
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
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { AiYieldDescription } from "@/components/AiYieldDescription";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [farms, setFarms] = useState<any[]>([]);
  const [isSavingFarm, setIsSavingFarm] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [isFarmDialogOpen, setIsFarmDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any>(null);
  const [farmToDelete, setFarmToDelete] = useState<any>(null);
  const [isFarmDeleteOpen, setIsFarmDeleteOpen] = useState(false);
  const [farmImageFile, setFarmImageFile] = useState<File | null>(null);
  
  const [farmFormData, setFarmFormData] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India"
    }
  });

  // Product Management State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  
  // Sales Management State (for Farmers)
  const [sales, setSales] = useState<any[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState(false);

  // Orders Management State (for Buyers)
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [isActiveOrdersLoading, setIsActiveOrdersLoading] = useState(false);
  const [isHistoryOrdersLoading, setIsHistoryOrdersLoading] = useState(false);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Vegetables",
    unit: "kg",
    quantity: 10,
    farmId: ""
  });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [stockUpdate, setStockUpdate] = useState({ id: "", quantity: 0 });
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const isFarmer = user?.roles.includes('ROLE_FARMER');

  // Helper to resolve backend image paths
  const resolveImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8080${cleanPath}`;
  };

  const fetchMyFarms = useCallback(async () => {
    if (!token) return;
    setIsLoadingFarms(true);
    try {
      const response = await fetch('http://localhost:8080/api/farms/my-farms', {
        headers: { 'Authorization': token },
      });
      if (response.ok) {
        const data = await response.json();
        setFarms(Array.isArray(data) ? data : [data]);
      } else {
        setFarms([]);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setIsLoadingFarms(false);
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
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsProductsLoading(false);
    }
  }, [token]);

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
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsSalesLoading(false);
    }
  }, [token]);

  const fetchActiveOrders = useCallback(async () => {
    if (!token) return;
    setIsActiveOrdersLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/active', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching active orders:", error);
    } finally {
      setIsActiveOrdersLoading(false);
    }
  }, [token]);

  const fetchHistoryOrders = useCallback(async () => {
    if (!token) return;
    setIsHistoryOrdersLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/history', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching history orders:", error);
    } finally {
      setIsHistoryOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (isFarmer) {
      fetchMyFarms();
      fetchMyProducts();
      fetchMySales();
    } else {
      setIsLoadingFarms(false);
      fetchActiveOrders();
      fetchHistoryOrders();
    }
  }, [isAuthenticated, isFarmer, fetchMyFarms, fetchMyProducts, fetchMySales, fetchActiveOrders, fetchHistoryOrders, router]);

  const handleCancelOrder = async () => {
    if (!orderToCancel || !token) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderToCancel.id}/cancel`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        toast({
          title: "Order Cancelled",
          description: "Your order has been successfully cancelled.",
        });
        fetchActiveOrders();
        fetchHistoryOrders();
      } else {
        throw new Error("Failed to cancel order");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.message
      });
    } finally {
      setIsCancelOrderOpen(false);
      setOrderToCancel(null);
    }
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFarm(true);

    const url = editingFarm 
      ? `http://localhost:8080/api/farms/${editingFarm.id}` 
      : 'http://localhost:8080/api/farms/register';
    const method = editingFarm ? 'PUT' : 'POST';

    try {
      const formData = new FormData();
      const farmData = {
        name: farmFormData.name,
        description: farmFormData.description,
        address: farmFormData.address
      };
      const farmBlob = new Blob([JSON.stringify(farmData)], { type: 'application/json' });
      formData.append('farm', farmBlob);
      if (farmImageFile) formData.append('image', farmImageFile);

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': token || '' },
        body: formData,
      });

      if (response.ok) {
        setIsFarmDialogOpen(false);
        setEditingFarm(null);
        setFarmImageFile(null);
        setFarmFormData({
          name: "",
          description: "",
          address: { street: "", city: "", state: "", zipCode: "", country: "India" }
        });
        toast({ title: editingFarm ? "Farm Updated" : "Farm Registered!" });
        fetchMyFarms();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    } finally {
      setIsSavingFarm(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.farmId) return;
    try {
      const formData = new FormData();
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        unit: newProduct.unit,
        quantity: newProduct.quantity,
        farmId: newProduct.farmId
      };
      const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
      formData.append('product', productBlob);
      if (productImageFile) formData.append('image', productImageFile);

      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Authorization': token || '' },
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Yield Added" });
        setIsDialogOpen(false);
        setProductImageFile(null);
        setNewProduct({
          name: "", description: "", price: 0, category: "Vegetables", unit: "kg", quantity: 10, farmId: ""
        });
        fetchMyProducts();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });
      if (response.ok) {
        toast({ title: "Yield Deleted" });
        setIsDeleteConfirmOpen(false);
        fetchMyProducts();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  const openAddFarmDialog = () => {
    setEditingFarm(null);
    setFarmImageFile(null);
    setFarmFormData({
      name: "", description: "", address: { street: "", city: "", state: "", zipCode: "", country: "India" }
    });
    setIsFarmDialogOpen(true);
  };

  if (!user) return null;

  const fileInputClass = "cursor-pointer h-auto p-1 file:cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all border-2 border-primary/20 hover:border-primary/50 bg-white shadow-sm";

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
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="h-3 w-3" /> {user.email}
                  </div>
                </div>
                <Button 
                  variant="outline" size="sm" 
                  className="mt-6 w-full text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-colors"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-headline">
                {isFarmer ? "Farmer Command Center" : "Account Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user.username}!</p>
            </div>
            
            <Tabs defaultValue={isFarmer ? "farm" : "active-orders"} className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                {isFarmer ? (
                  <>
                    <TabsTrigger value="farm" className="gap-2"><Store className="h-4 w-4" /> My Farms</TabsTrigger>
                    <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4" /> Inventory</TabsTrigger>
                    <TabsTrigger value="sales" className="gap-2"><TrendingUp className="h-4 w-4" /> Sales</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="active-orders" className="gap-2"><Clock className="h-4 w-4" /> Active Orders</TabsTrigger>
                    <TabsTrigger value="order-history" className="gap-2"><History className="h-4 w-4" /> Order History</TabsTrigger>
                  </>
                )}
                <TabsTrigger value="profile" className="gap-2"><Shield className="h-4 w-4" /> Profile</TabsTrigger>
              </TabsList>

              {!isFarmer && (
                <>
                  <TabsContent value="active-orders">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Active Orders</CardTitle>
                          <CardDescription>Tracking your current farm-to-table deliveries.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchActiveOrders} disabled={isActiveOrdersLoading}>
                          <RefreshCcw className={`h-4 w-4 ${isActiveOrdersLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isActiveOrdersLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : activeOrders.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No active orders found.</p>
                            <Button asChild className="mt-4"><Link href="/explore">Shop Now</Link></Button>
                          </div>
                        ) : (
                          <OrderTable 
                            orders={activeOrders} 
                            onCancel={(order) => {
                              setOrderToCancel(order);
                              setIsCancelOrderOpen(true);
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="order-history">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Past Purchases</CardTitle>
                          <CardDescription>Your completed and cancelled orders history.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchHistoryOrders} disabled={isHistoryOrdersLoading}>
                          <RefreshCcw className={`h-4 w-4 ${isHistoryOrdersLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isHistoryOrdersLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : historyOrders.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Your order history is empty.</p>
                          </div>
                        ) : (
                          <OrderTable orders={historyOrders} />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}

              {isFarmer && (
                <>
                  <TabsContent value="farm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold font-headline">Manage Your Farm Storefronts</h3>
                      <Button onClick={openAddFarmDialog} className="gap-2"><Plus className="h-4 w-4" /> Add Farm</Button>
                    </div>
                    {isLoadingFarms ? (
                      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : farms.length === 0 ? (
                      <Card className="text-center py-20 border-2 border-dashed">
                        <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-bold">No Farms Registered</h4>
                        <Button onClick={openAddFarmDialog} className="mt-4">Register Farm</Button>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {farms.map((farm) => (
                          <Card key={farm.id} className="border-t-4 border-t-primary shadow-md overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between bg-primary/5">
                              <div className="flex gap-4">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                                  {farm.image && <Image src={resolveImageUrl(farm.image)!} alt={farm.name} fill className="object-cover" unoptimized />}
                                </div>
                                <div>
                                  <CardTitle className="text-2xl">{farm.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" /> {farm.address?.city}, {farm.address?.state}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">{farm.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="inventory">
                     <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Yield Inventory</CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button disabled={farms.length === 0} className="gap-2"><Plus className="h-4 w-4" /> Add Yield</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[550px]">
                            <form onSubmit={handleAddProduct} className="space-y-4">
                               <DialogHeader><DialogTitle>Add New Yield</DialogTitle></DialogHeader>
                               <div className="space-y-4">
                                 <div className="space-y-2">
                                    <Label>Select Farm</Label>
                                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" required value={newProduct.farmId} onChange={(e) => setNewProduct({...newProduct, farmId: e.target.value})}>
                                      <option value="">Choose a farm...</option>
                                      {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Yield Name</Label>
                                      <Input required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Category</Label>
                                      <Input required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label>Price (₹)</Label>
                                      <Input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Unit</Label>
                                      <Input required value={newProduct.unit} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Stock</Label>
                                      <Input type="number" required value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value)})} />
                                    </div>
                                 </div>
                               </div>
                               <DialogFooter><Button type="submit" className="w-full">List Yield</Button></DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        {isProductsLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : products.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">No yields listed.</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Yield</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {products.map(p => (
                                <TableRow key={p.id}>
                                  <TableCell className="font-medium">{p.name}</TableCell>
                                  <TableCell>₹{p.price}/{p.unit}</TableCell>
                                  <TableCell>{p.quantity}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setProductToDelete(p); setIsDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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

              <TabsContent value="profile">
                <Card>
                  <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div><p className="text-xs font-bold text-muted-foreground uppercase">Full Name</p><p className="text-lg font-medium">{user.firstName} {user.lastName}</p></div>
                      <div><p className="text-xs font-bold text-muted-foreground uppercase">Username</p><p className="text-lg font-medium">{user.username}</p></div>
                      <div><p className="text-xs font-bold text-muted-foreground uppercase">Email Address</p><p className="text-lg font-medium">{user.email}</p></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Delete Confirm */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Yield?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Order Confirm */}
        <AlertDialog open={isCancelOrderOpen} onOpenChange={setIsCancelOrderOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" /> Cancel Order?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Farm Dialog */}
        <Dialog open={isFarmDialogOpen} onOpenChange={setIsFarmDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSaveFarm} className="space-y-4">
              <DialogHeader><DialogTitle>Register New Farm</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Farm Name</Label><Input required value={farmFormData.name} onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Farm Image</Label><Input type="file" onChange={(e) => setFarmImageFile(e.target.files?.[0] || null)} className={fileInputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input required value={farmFormData.address.city} onChange={(e) => setFarmFormData({...farmFormData, address: {...farmFormData.address, city: e.target.value}})} /></div>
                  <div className="space-y-2"><Label>State</Label><Input required value={farmFormData.address.state} onChange={(e) => setFarmFormData({...farmFormData, address: {...farmFormData.address, state: e.target.value}})} /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><textarea className="w-full h-24 rounded-md border p-2" value={farmFormData.description} onChange={(e) => setFarmFormData({...farmFormData, description: e.target.value})} /></div>
              </div>
              <DialogFooter><Button type="submit" className="w-full">Save Farm</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function OrderTable({ orders, onCancel }: { orders: any[], onCancel?: (order: any) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          {onCancel && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
            <TableCell className="text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {order.orderDate ? format(new Date(order.orderDate), 'MMM dd, yyyy') : "N/A"}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="text-sm font-medium">
                    {item.product?.name} <span className="text-xs text-muted-foreground font-normal">x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell className="font-bold text-primary">₹{order.totalPrice?.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px]">
                {order.status}
              </Badge>
            </TableCell>
            {onCancel && (
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => onCancel(order)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
