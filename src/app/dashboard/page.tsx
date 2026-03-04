
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  LogOut, 
  Mail, 
  Shield, 
  Plus, 
  Store, 
  Package, 
  TrendingUp,
  MapPin,
  Loader2,
  Trash2,
  RefreshCcw,
  Pencil,
  Home,
  Globe,
  Calendar,
  Clock,
  History,
  XCircle,
  CheckCircle2,
  Camera,
  Truck,
  PlusCircle,
  Check,
  Heart,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Shared utility to resolve backend image paths
const resolveImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:8080${cleanPath}`;
};

export default function DashboardPage() {
  const { user: authUser, token, logout, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  // Farm State
  const [farms, setFarms] = useState<any[]>([]);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [isFarmDialogOpen, setIsFarmDialogOpen] = useState(false);
  const [isFarmSaving, setIsFarmSaving] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any>(null);
  const [farmImageFile, setFarmImageFile] = useState<File | null>(null);
  const [farmFormData, setFarmFormData] = useState({
    name: "",
    description: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "India" }
  });
  const [farmToDelete, setFarmToDelete] = useState<any>(null);
  const [isDeleteFarmConfirmOpen, setIsDeleteFarmConfirmOpen] = useState(false);

  // Product State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: "", 
    description: "", 
    price: 0, 
    category: "Vegetables", 
    unit: "kg", 
    quantity: 10, 
    farmId: ""
  });
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Stock Update State
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [productForStock, setProductForStock] = useState<any>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [isStockSaving, setIsStockSaving] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "", city: "", state: "", zipCode: "", country: "India"
  });

  // Orders State (Buyer)
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [isActiveOrdersLoading, setIsActiveOrdersLoading] = useState(false);
  const [isHistoryOrdersLoading, setIsHistoryOrdersLoading] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);

  // Sales State (Farmer)
  const [sales, setSales] = useState<any[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState(false);

  const isFarmer = authUser?.roles.includes('ROLE_FARMER');

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setIsProfileLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/profile', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || ""
        });
        updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          profileImage: data.profileImage
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [token, updateUser]);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setIsLoadingAddresses(true);
    try {
      const response = await fetch('http://localhost:8080/api/addresses', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.map((a: any) => ({ ...a, isDefault: a.default === true })));
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [token]);

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

    fetchProfile();
    if (isFarmer) {
      fetchMyFarms();
      fetchMyProducts();
      fetchMySales();
    } else {
      fetchActiveOrders();
      fetchHistoryOrders();
    }
    fetchAddresses();
  }, [isAuthenticated, isFarmer, fetchMyFarms, fetchMyProducts, fetchMySales, fetchActiveOrders, fetchHistoryOrders, fetchAddresses, fetchProfile, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', profileFormData.firstName);
      formData.append('lastName', profileFormData.lastName);
      formData.append('email', profileFormData.email);
      if (profileImageFile) {
        formData.append('image', profileImageFile);
      }

      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': token || '' },
        body: formData
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData);
        updateUser({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          profileImage: updatedData.profileImage
        });
        toast({ title: "Profile Updated", description: "Your account details have been saved successfully." });
        setIsEditProfileOpen(false);
        setProfileImageFile(null);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/orders/item/${itemId}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        toast({ title: "Status Updated", description: `Item marked as ${status.toLowerCase()}.` });
        fetchMySales();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddressSaving(true);
    const url = editingAddress ? `http://localhost:8080/api/addresses/${editingAddress.id}` : 'http://localhost:8080/api/addresses';
    const method = editingAddress ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
        body: JSON.stringify(addressForm)
      });
      if (response.ok) {
        toast({ title: editingAddress ? "Address Updated" : "Address Added" });
        setIsAddressDialogOpen(false);
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save address." });
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });
      if (response.ok) {
        toast({ title: "Address Removed" });
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete address." });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/addresses/${id}/set-default`, {
        method: 'PATCH',
        headers: { 'Authorization': token || '' }
      });
      if (response.ok) {
        toast({ title: "Default Address Updated" });
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update default address." });
    }
  };

  const openEditAddressDialog = (addr: any) => {
    setEditingAddress(addr);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country || "India"
    });
    setIsAddressDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderToCancel.id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        toast({ title: "Order Cancelled", description: "Your order has been successfully cancelled." });
        fetchActiveOrders();
        fetchHistoryOrders();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Cancellation Failed", description: error.message });
    } finally {
      setIsCancelOrderOpen(false);
      setOrderToCancel(null);
    }
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFarmSaving(true);
    try {
      const formData = new FormData();
      const farmData = {
        name: farmFormData.name,
        description: farmFormData.description,
        address: farmFormData.address
      };
      
      const farmBlob = new Blob([JSON.stringify(farmData)], { type: 'application/json' });
      formData.append('farm', farmBlob);
      if (farmImageFile) {
        formData.append('image', farmImageFile);
      }

      const url = editingFarm 
        ? `http://localhost:8080/api/farms/${editingFarm.id}` 
        : 'http://localhost:8080/api/farms/register';
      const method = editingFarm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': token || '' },
        body: formData,
      });

      if (response.ok) {
        toast({ title: editingFarm ? "Farm Updated" : "Farm Registered" });
        setIsFarmDialogOpen(false);
        setEditingFarm(null);
        setFarmImageFile(null);
        fetchMyFarms();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save farm.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsFarmSaving(false);
    }
  };

  const handleDeleteFarm = async () => {
    if (!farmToDelete || !token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/farms/${farmToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        toast({ title: "Farm Deleted" });
        fetchMyFarms();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete farm.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsDeleteFarmConfirmOpen(false);
      setFarmToDelete(null);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.farmId) return;
    setIsProductSaving(true);
    try {
      const formData = new FormData();
      const productPayload = {
        name: productFormData.name,
        description: productFormData.description,
        price: productFormData.price,
        category: productFormData.category,
        unit: productFormData.unit,
        quantity: productFormData.quantity,
        farmId: productFormData.farmId
      };
      
      const productBlob = new Blob([JSON.stringify(productPayload)], { type: 'application/json' });
      formData.append('product', productBlob);
      if (productImageFile) {
        formData.append('image', productImageFile);
      }

      const url = editingProduct ? `http://localhost:8080/api/products/${editingProduct.id}` : 'http://localhost:8080/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': token || '' },
        body: formData,
      });
      if (response.ok) {
        toast({ title: editingProduct ? "Yield Updated" : "Yield Added" });
        setIsProductDialogOpen(false);
        setEditingProduct(null);
        setProductImageFile(null);
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save product.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForStock || !token) return;
    setIsStockSaving(true);
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productForStock.id}/stock`, {
        method: 'PATCH',
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStockValue)
      });
      if (response.ok) {
        toast({ title: "Stock Updated", description: `New stock level for ${productForStock.name}: ${newStockValue}` });
        setIsStockDialogOpen(false);
        setProductForStock(null);
        fetchMyProducts();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsStockSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        toast({ title: "Product Deleted" });
        fetchMyProducts();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
    } finally {
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const openEditFarm = (farm: any) => {
    setEditingFarm(farm);
    setFarmFormData({
      name: farm.name,
      description: farm.description,
      address: farm.address || { street: "", city: "", state: "", zipCode: "", country: "India" }
    });
    setIsFarmDialogOpen(true);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      unit: product.unit,
      quantity: product.quantity,
      farmId: product.farmId || ""
    });
    setIsProductDialogOpen(true);
  };

  const openStockUpdate = (product: any) => {
    setProductForStock(product);
    setNewStockValue(product.quantity || 0);
    setIsStockDialogOpen(true);
  };

  if (!authUser) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative h-24 w-24 rounded-full bg-primary/20 mx-auto mb-4 border-2 border-primary/20 overflow-hidden">
                  {profile?.profileImage ? (
                    <Image 
                      src={resolveImageUrl(profile.profileImage)!} 
                      alt={profile.username} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg">{profile?.firstName || authUser.firstName} {profile?.lastName || authUser.lastName}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">
                  {authUser.roles[0]?.replace('ROLE_', '') || 'User'}
                </p>
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="h-3 w-3" /> {profile?.email || authUser.email}
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
              <p className="text-muted-foreground mt-1">Welcome back, {profile?.username || authUser.username}!</p>
            </div>
            
            <Tabs defaultValue={isFarmer ? "sales" : "active-orders"} className="space-y-6">
              <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
                {isFarmer ? (
                  <>
                    <TabsTrigger value="sales" className="gap-2"><Truck className="h-4 w-4" /> My Sales</TabsTrigger>
                    <TabsTrigger value="farm" className="gap-2"><Store className="h-4 w-4" /> My Farms</TabsTrigger>
                    <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4" /> Inventory</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="active-orders" className="gap-2"><Clock className="h-4 w-4" /> Active Orders</TabsTrigger>
                    <TabsTrigger value="order-history" className="gap-2"><History className="h-4 w-4" /> History</TabsTrigger>
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
                  <TabsContent value="sales">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>My Sales</CardTitle>
                          <CardDescription>Manage incoming orders for your yields.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchMySales} disabled={isSalesLoading}>
                          <RefreshCcw className={`h-4 w-4 ${isSalesLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isSalesLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : sales.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No sales recorded yet. Keep growing!</p>
                          </div>
                        ) : (
                          <SalesTable items={sales} onUpdateStatus={handleUpdateItemStatus} />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="farm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold font-headline">My Farm Storefronts</h3>
                      <Button onClick={() => { setEditingFarm(null); setFarmFormData({ name: "", description: "", address: { street: "", city: "", state: "", zipCode: "", country: "India" } }); setIsFarmDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Add Farm</Button>
                    </div>
                    {isLoadingFarms ? (
                      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : farms.length === 0 ? (
                      <Card className="text-center py-20 border-2 border-dashed">
                        <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-bold">No Farms Registered</h4>
                        <Button onClick={() => setIsFarmDialogOpen(true)} className="mt-4">Register Farm</Button>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {farms.map((farm) => (
                          <Card key={farm.id} className="border-t-4 border-t-primary shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                            <div className="relative h-32 w-full bg-muted border-b">
                              {resolveImageUrl(farm.imageUrl || farm.image) ? (
                                <Image 
                                  src={resolveImageUrl(farm.imageUrl || farm.image)!} 
                                  alt={farm.name} 
                                  fill 
                                  className="object-cover" 
                                  unoptimized 
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <Store className="h-10 w-10 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <CardHeader className="p-4 flex-grow">
                              <CardTitle className="text-xl">{farm.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" /> {farm.address?.city}, {farm.address?.state}
                              </CardDescription>
                              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{farm.description}</p>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-2">
                               {farm.address && (
                                <div className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded">
                                  <p className="font-bold flex items-center gap-1 mb-0.5">
                                    <Home className="h-2.5 w-2.5" /> Full Address
                                  </p>
                                  <p className="truncate">
                                    {farm.address.street}, {farm.address.city}, {farm.address.state} {farm.address.zipCode}, {farm.address.country || "India"}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="p-3 bg-muted/10 border-t flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5"
                                onClick={() => openEditFarm(farm)}
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                onClick={() => { setFarmToDelete(farm); setIsDeleteFarmConfirmOpen(true); }}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="inventory" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-bold font-headline">Yield Inventory</h3>
                        <p className="text-sm text-muted-foreground">Manage all your products in one list.</p>
                      </div>
                      <Button onClick={() => { setEditingProduct(null); setProductFormData({ name: "", description: "", price: 0, category: "Vegetables", unit: "kg", quantity: 10, farmId: farms[0]?.id || "" }); setIsProductDialogOpen(true); }} disabled={farms.length === 0} className="gap-2 font-bold"><Plus className="h-4 w-4" /> Add Yield</Button>
                    </div>

                    {isProductsLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : products.length === 0 ? (
                      <Card className="text-center py-20 border-2 border-dashed">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-bold">No Yields Listed</h4>
                        <p className="text-sm text-muted-foreground">Start adding products to your farm storefronts.</p>
                      </Card>
                    ) : (
                      <Card className="shadow-sm border-t-2 border-t-primary/20">
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/5">
                                <TableHead className="text-left w-[80px]">Image</TableHead>
                                <TableHead className="text-left">Yield</TableHead>
                                <TableHead className="text-left">Farm</TableHead>
                                <TableHead className="text-left">Price</TableHead>
                                <TableHead className="text-left">Stock</TableHead>
                                <TableHead className="text-left w-[140px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {products.map(p => (
                                <TableRow key={p.id} className="hover:bg-muted/5 transition-colors">
                                  <TableCell>
                                    <div className="relative h-12 w-12 rounded-md overflow-hidden border bg-muted flex-shrink-0">
                                      {resolveImageUrl(p.imageUrl || p.image) ? (
                                        <Image 
                                          src={resolveImageUrl(p.imageUrl || p.image)!} 
                                          alt={p.name} 
                                          fill 
                                          className="object-cover" 
                                          unoptimized 
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full w-full">
                                          <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-bold text-left">{p.name}</TableCell>
                                  <TableCell className="text-left italic text-muted-foreground">{p.farmName || "Unassigned"}</TableCell>
                                  <TableCell className="text-left font-medium">₹{p.price}/{p.unit}</TableCell>
                                  <TableCell className="text-left">
                                    <Badge 
                                      variant="secondary" 
                                      className={cn(
                                        "rounded-sm px-2 font-bold",
                                        p.quantity === 0 ? "bg-red-100 text-red-700 hover:bg-red-100" : 
                                        p.quantity < 10 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : 
                                        "bg-green-100 text-green-700 hover:bg-green-100"
                                      )}
                                    >
                                      {p.quantity} {p.unit}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-left">
                                    <div className="flex justify-start items-center gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Update Stock" 
                                        onClick={() => openStockUpdate(p)} 
                                        className="hover:bg-primary/10 group h-9 w-9"
                                      >
                                        <Package className="h-4.5 w-4.5 text-primary group-hover:text-primary transition-colors" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Edit Product" 
                                        onClick={() => openEditProduct(p)}
                                        className="h-9 w-9 hover:bg-muted group/edit"
                                      >
                                        <Pencil className="h-4 w-4 text-muted-foreground group-hover/edit:text-foreground transition-colors" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Delete Product" 
                                        className="h-9 w-9 hover:bg-destructive/10" 
                                        onClick={() => { setProductToDelete(p); setIsDeleteConfirmOpen(true); }}
                                      >
                                        <Trash2 className="h-4.5 w-4.5 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </>
              )}

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Details</CardTitle>
                      <CardDescription>View and manage your account information.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)} className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                      <User className="h-4 w-4" /> Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isProfileLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">First Name</p>
                          <p className="text-lg font-medium">{profile?.firstName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Name</p>
                          <p className="text-lg font-medium">{profile?.lastName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Username</p>
                          <p className="text-lg font-medium">@{profile?.username || authUser.username}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                          <p className="text-lg font-medium">{profile?.email || authUser.email}</p>
                        </div>
                        {profile?.registeredDate && (
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
                            <p className="text-lg font-medium">
                              {format(new Date(profile.registeredDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Saved Addresses</CardTitle>
                      <CardDescription>Manage your delivery locations for faster checkout.</CardDescription>
                    </div>
                    {addresses.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setEditingAddress(null); setAddressForm({ street: "", city: "", state: "", zipCode: "", country: "India" }); setIsAddressDialogOpen(true); }} className="gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                        <Plus className="h-4 w-4" /> Add New
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isLoadingAddresses ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg space-y-4">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">No saved addresses yet.</p>
                        <Button onClick={() => { setEditingAddress(null); setAddressForm({ street: "", city: "", state: "", zipCode: "", country: "India" }); setIsAddressDialogOpen(true); }}>
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <Card key={addr.id} className="relative border-2 border-border hover:border-primary/50 transition-colors flex flex-col h-full">
                            <CardContent className="p-5 flex-grow">
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <p className="font-bold text-lg truncate leading-tight">{addr.street}</p>
                                {addr.isDefault && (
                                  <Badge className="bg-primary text-primary-foreground pointer-events-none rounded-sm px-2 text-[10px] uppercase font-bold shrink-0">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                              <p className="text-xs font-bold text-primary flex items-center gap-1 mt-2 uppercase tracking-wide">
                                <Globe className="h-3 w-3" /> {addr.country || "India"}
                              </p>
                            </CardContent>
                            <Separator />
                            <CardFooter className="p-2 flex justify-between items-center bg-muted/20">
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                                  onClick={() => openEditAddressDialog(addr)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive/60 hover:bg-destructive hover:bg-white transition-colors"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {!addr.isDefault && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-xs font-bold border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                                  onClick={() => handleSetDefaultAddress(id)}
                                >
                                  Set Default
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdateProfile}>
              <DialogHeader>
                <DialogTitle>Update Your Profile</DialogTitle>
                <DialogDescription>Modify your account details and profile picture.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full bg-muted border overflow-hidden">
                    {profileImageFile ? (
                      <Image 
                        src={URL.createObjectURL(profileImageFile)} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (profile?.profileImage) ? (
                      <Image 
                        src={resolveImageUrl(profile.profileImage)!} 
                        alt="Current" 
                        fill 
                        className="object-cover" 
                        unoptimized 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <label 
                      htmlFor="profile-image-upload" 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </label>
                    <input 
                      id="profile-image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Click the image to upload a new photo</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profileFormData.firstName} 
                      onChange={(e) => setProfileFormData({...profileFormData, firstName: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profileFormData.lastName} 
                      onChange={(e) => setProfileFormData({...profileFormData, lastName: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileFormData.email} 
                    onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-11 font-bold" disabled={isProfileSaving}>
                  {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stock Update Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <form onSubmit={handleUpdateStock}>
              <DialogHeader>
                <DialogTitle>Update Inventory Stock</DialogTitle>
                <DialogDescription>
                  Enter the new total stock level for <span className="font-bold text-primary">{productForStock?.name}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="stock">Available Quantity ({productForStock?.unit})</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    min="0"
                    required 
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-11 font-bold" disabled={isStockSaving}>
                  {isStockSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Stock Quantity
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Global Address Dialogs */}
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveAddress}>
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                <DialogDescription>Enter your delivery details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="street" className="pl-9" placeholder="e.g. 123 Farm Lane" required value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} /></div>
                  <div className="space-y-2"><Label>State</Label><Input placeholder="State" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Zip Code</Label><Input placeholder="Zip Code" required value={addressForm.zipCode} onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" required value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-11 font-bold" disabled={isAddressSaving}>
                  {isAddressSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Yield?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogDescription>Are you sure you want to remove this yield from your inventory? This action cannot be undone.</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteFarmConfirmOpen} onOpenChange={setIsDeleteFarmConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Farm Storefront?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogDescription>Are you sure you want to remove this farm? All products associated with this farm may also be affected. This action cannot be undone.</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFarm} className="bg-destructive text-white">Delete Farm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isCancelOrderOpen} onOpenChange={setIsCancelOrderOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-destructive" /> Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>This action will permanently cancel your order.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-white">Confirm Cancellation</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Farm Form Dialog */}
        <Dialog open={isFarmDialogOpen} onOpenChange={setIsFarmDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveFarm} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{editingFarm ? "Edit Farm Storefront" : "Register New Farm"}</DialogTitle>
                <DialogDescription>Update your farm's public profile and contact info.</DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative h-24 w-full rounded-md bg-muted border overflow-hidden">
                  {farmImageFile ? (
                    <Image src={URL.createObjectURL(farmImageFile)} alt="Preview" fill className="object-cover" />
                  ) : resolveImageUrl(editingFarm?.imageUrl || editingFarm?.image) ? (
                    <Image src={resolveImageUrl(editingFarm?.imageUrl || editingFarm?.image)!} alt="Current" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Store className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <label htmlFor="farm-image-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </label>
                  <input id="farm-image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setFarmImageFile(e.target.files?.[0] || null)} />
                </div>
                <p className="text-xs text-muted-foreground">Click to upload farm cover photo</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2"><Label>Farm Name</Label><Input required value={farmFormData.name} onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Description</Label><Input required value={farmFormData.description} onChange={(e) => setFarmFormData({...farmFormData, description: e.target.value})} /></div>
                
                <Separator />
                <p className="text-sm font-bold text-primary uppercase tracking-wider">Farm Address</p>
                
                <div className="space-y-2">
                  <Label>Street</Label>
                  <Input 
                    placeholder="e.g. 123 Farm Lane"
                    required 
                    value={farmFormData.address.street} 
                    onChange={(e) => setFarmFormData({...farmFormData, address: { ...farmFormData.address, street: e.target.value }})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input placeholder="City" required value={farmFormData.address.city} onChange={(e) => setFarmFormData({...farmFormData, address: { ...farmFormData.address, city: e.target.value }})} /></div>
                  <div className="space-y-2"><Label>State</Label><Input placeholder="State" required value={farmFormData.address.state} onChange={(e) => setFarmFormData({...farmFormData, address: { ...farmFormData.address, state: e.target.value }})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Zip Code</Label><Input placeholder="Zip Code" required value={farmFormData.address.zipCode} onChange={(e) => setFarmFormData({...farmFormData, address: { ...farmFormData.address, zipCode: e.target.value }})} /></div>
                  <div className="space-y-2"><Label>Country</Label><Input placeholder="Country" required value={farmFormData.address.country} onChange={(e) => setFarmFormData({...farmFormData, address: { ...farmFormData.address, country: e.target.value }})} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-11 font-bold" disabled={isFarmSaving}>
                  {isFarmSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingFarm ? "Update Farm" : "Register Farm"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Product Form Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveProduct} className="space-y-4">
               <DialogHeader>
                 <DialogTitle>{editingProduct ? "Edit Yield Details" : "Add New Yield"}</DialogTitle>
                 <DialogDescription>Update pricing, availability, and stock levels.</DialogDescription>
               </DialogHeader>
               
               <div className="flex flex-col items-center gap-4 py-2">
                 <div className="relative h-24 w-32 rounded-md bg-muted border overflow-hidden">
                    {productImageFile ? (
                      <Image src={URL.createObjectURL(productImageFile)} alt="Preview" fill className="object-cover" />
                    ) : resolveImageUrl(editingProduct?.imageUrl || editingProduct?.image) ? (
                      <Image src={resolveImageUrl(editingProduct?.imageUrl || editingProduct?.image)!} alt="Current" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <label htmlFor="product-image-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                    </label>
                    <input id="product-image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setProductImageFile(e.target.files?.[0] || null)} />
                 </div>
                 <p className="text-xs text-muted-foreground">Product Photo</p>
               </div>

               <div className="space-y-4">
                 <div className="space-y-2">
                    <Label>Source Farm</Label>
                    <select 
                      className="w-full h-10 rounded-md border px-3 text-sm focus:ring-2 focus:ring-primary outline-none" 
                      required 
                      value={productFormData.farmId} 
                      onChange={(e) => setProductFormData({...productFormData, farmId: e.target.value})}
                      disabled={!!editingProduct}
                    >
                      <option value="">Choose your farm...</option>
                      {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Yield Name</Label><Input required value={productFormData.name} onChange={(e) => setProductFormData({...productFormData, name: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Category</Label><Input required value={productFormData.category} onChange={(e) => setProductFormData({...productFormData, category: e.target.value})} /></div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" required value={productFormData.price} onChange={(e) => setProductFormData({...productFormData, price: parseFloat(e.target.value)})} /></div>
                    <div className="space-y-2"><Label>Unit</Label><Input required placeholder="kg, jar, bunch" value={productFormData.unit} onChange={(e) => setProductFormData({...productFormData, unit: e.target.value})} /></div>
                    <div className="space-y-2">
                      <Label>Stock Qty</Label>
                      <Input type="number" required value={productFormData.quantity} onChange={(e) => setProductFormData({...productFormData, quantity: parseInt(e.target.value)})} />
                    </div>
                 </div>
                 <div className="space-y-2"><Label>Description</Label><Input required value={productFormData.description} onChange={(e) => setProductFormData({...productFormData, description: e.target.value})} /></div>
               </div>
               <DialogFooter>
                 <Button type="submit" className="w-full h-11 font-bold" disabled={isProductSaving}>
                   {isProductSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {editingProduct ? "Update Yield" : "List Yield"}
                 </Button>
               </DialogFooter>
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
          <TableHead className="text-left">Order ID</TableHead>
          <TableHead className="text-left">Date</TableHead>
          <TableHead className="text-left">Items</TableHead>
          <TableHead className="text-left">Total</TableHead>
          <TableHead className="text-left">Status</TableHead>
          <TableHead className="text-left">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs text-left">{order.id.substring(0, 8)}</TableCell>
            <TableCell className="text-xs text-left">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {order.orderDate ? format(new Date(order.orderDate), 'MMM dd, yyyy') : "N/A"}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1 text-left">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="text-sm font-medium">
                    {item.product?.name} <span className="text-xs text-muted-foreground font-normal">x {item.quantity}</span>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell className="font-bold text-primary text-left">₹{order.totalPrice?.toFixed(2)}</TableCell>
            <TableCell className="text-left">
              <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px] rounded-sm">
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-left">
              {onCancel && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => onCancel(order)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SalesTable({ items, onUpdateStatus }: { items: any[], onUpdateStatus: (id: string, status: string) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left w-[80px]">Image</TableHead>
          <TableHead className="text-left">Item</TableHead>
          <TableHead className="text-left">Quantity</TableHead>
          <TableHead className="text-left">Total Price</TableHead>
          <TableHead className="text-left">Status</TableHead>
          <TableHead className="text-left">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="relative h-10 w-10 rounded overflow-hidden border bg-muted flex-shrink-0">
                {resolveImageUrl(item.product?.imageUrl) ? (
                  <Image 
                    src={resolveImageUrl(item.product?.imageUrl)!} 
                    alt={item.product?.name || 'Yield'} 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium text-left">
              <div className="flex flex-col text-left">
                <span>{item.product?.name || 'Unknown Yield'}</span>
                <span className="text-[10px] text-muted-foreground font-mono">Order Item ID: {item.id.substring(0, 8)}</span>
              </div>
            </TableCell>
            <TableCell className="text-left">{item.quantity} {item.product?.unit || 'kg'}</TableCell>
            <TableCell className="font-bold text-primary text-left">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
            <TableCell className="text-left">
              <Badge 
                variant="secondary" 
                className={cn(
                  "uppercase text-[10px] rounded-sm",
                  (!item.status || item.status === 'PENDING') ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                )}
              >
                {item.status || 'PENDING'}
              </Badge>
            </TableCell>
            <TableCell className="text-left">
              {(!item.status || item.status === 'PENDING') ? (
                <Button 
                  size="sm" 
                  className="h-8 font-bold gap-1.5"
                  onClick={() => onUpdateStatus(item.id, 'SHIPPED')}
                >
                  <Package className="h-3 w-3" /> Mark as Shipped
                </Button>
              ) : (
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Fulfilled
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
