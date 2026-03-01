
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
  Check,
  CheckCircle2,
  Camera
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
import { useAuth, type User as AuthUser } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user: authUser, token, logout, isAuthenticated } = useAuth();
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
  const [editingFarm, setEditingFarm] = useState<any>(null);
  const [farmImageFile, setFarmImageFile] = useState<File | null>(null);
  const [farmFormData, setFarmFormData] = useState({
    name: "",
    description: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "India" }
  });

  // Product State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: 0, category: "Vegetables", unit: "kg", quantity: 10, farmId: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "", city: "", state: "", zipCode: "", country: "India"
  });

  // Orders State
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [isActiveOrdersLoading, setIsActiveOrdersLoading] = useState(false);
  const [isHistoryOrdersLoading, setIsHistoryOrdersLoading] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);

  const isFarmer = authUser?.roles.includes('ROLE_FARMER');

  const resolveImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8080${cleanPath}`;
  };

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
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [token]);

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
    } else {
      fetchActiveOrders();
      fetchHistoryOrders();
    }
    fetchAddresses();
  }, [isAuthenticated, isFarmer, fetchMyFarms, fetchMyProducts, fetchActiveOrders, fetchHistoryOrders, fetchAddresses, fetchProfile, router]);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.farmId) return;
    try {
      const formData = new FormData();
      const productBlob = new Blob([JSON.stringify(newProduct)], { type: 'application/json' });
      formData.append('product', productBlob);
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Authorization': token || '' },
        body: formData,
      });
      if (response.ok) {
        toast({ title: "Yield Added" });
        setIsDialogOpen(false);
        fetchMyProducts();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
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
                  {(profile?.imageUrl || profile?.image) ? (
                    <Image 
                      src={resolveImageUrl(profile.imageUrl || profile.image)!} 
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
            
            <Tabs defaultValue={isFarmer ? "farm" : "active-orders"} className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                {isFarmer ? (
                  <>
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
                  <TabsContent value="farm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold font-headline">My Farm Storefronts</h3>
                      <Button onClick={() => setIsFarmDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Farm</Button>
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
                        <Button onClick={() => setIsDialogOpen(true)} disabled={farms.length === 0} className="gap-2"><Plus className="h-4 w-4" /> Add Yield</Button>
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Addresses Section */}
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
                                <Globe className="h-3 w-3" /> {addr.country}
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
                                  className="h-8 w-8 text-destructive/60 hover:bg-destructive hover:text-white transition-colors"
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
                                  onClick={() => handleSetDefaultAddress(addr.id)}
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
          <DialogContent className="sm:max-w-[500px]">
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
                    ) : (profile?.imageUrl || profile?.image) ? (
                      <Image 
                        src={resolveImageUrl(profile.imageUrl || profile.image)!} 
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

        {/* Global Dialogs */}
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
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
                    <Input id="street" className="pl-9" required value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} /></div>
                  <div className="space-y-2"><Label>State</Label><Input required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Zip Code</Label><Input required value={addressForm.zipCode} onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})} /></div>
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
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {}} className="bg-destructive">Delete</AlertDialogAction>
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
              <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive">Confirm Cancellation</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isFarmDialogOpen} onOpenChange={setIsFarmDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form className="space-y-4">
              <DialogHeader><DialogTitle>Register Farm</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input required value={farmFormData.name} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input required value={farmFormData.address.city} /></div>
                  <div className="space-y-2"><Label>State</Label><Input required value={farmFormData.address.state} /></div>
                </div>
              </div>
              <DialogFooter><Button className="w-full">Register</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <form onSubmit={handleAddProduct} className="space-y-4">
               <DialogHeader><DialogTitle>Add New Yield</DialogTitle></DialogHeader>
               <div className="space-y-4">
                 <div className="space-y-2">
                    <Label>Select Farm</Label>
                    <select className="w-full h-10 rounded-md border" required value={newProduct.farmId} onChange={(e) => setNewProduct({...newProduct, farmId: e.target.value})}>
                      <option value="">Choose...</option>
                      {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Name</Label><Input required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Category</Label><Input required value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} /></div>
                 </div>
               </div>
               <DialogFooter><Button type="submit" className="w-full">List Yield</Button></DialogFooter>
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
                <Clock className="h-3 w-3" />
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
              <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px] rounded-sm">
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
