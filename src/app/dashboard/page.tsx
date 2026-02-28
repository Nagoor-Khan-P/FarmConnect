
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs";
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
  Image as ImageIcon,
  Upload
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
      zipCode: ""
    }
  });

  // Product Management State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  
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
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const farmsList = Array.isArray(data) ? data : [data];
        setFarms(farmsList);
        if (farmsList.length > 0 && !newProduct.farmId) {
          setNewProduct(prev => ({ ...prev, farmId: farmsList[0].id }));
        }
      } else if (response.status === 404) {
        setFarms([]);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setIsLoadingFarms(false);
    }
  }, [token, newProduct.farmId]);

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
    }
  }, [isAuthenticated, isFarmer, fetchMyFarms, fetchMyProducts, fetchMySales, router]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, { farm: any; products: any[] }> = {};
    products.forEach((p) => {
      const farmId = p.farm?.id || "unassigned";
      if (!groups[farmId]) {
        groups[farmId] = {
          farm: p.farm || { name: "Unassigned Yields", address: {} },
          products: [],
        };
      }
      groups[farmId].products.push(p);
    });
    return groups;
  }, [products]);

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
      
      if (farmImageFile) {
        formData.append('image', farmImageFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': token || '',
        },
        body: formData,
      });

      if (response.ok) {
        setIsFarmDialogOpen(false);
        setEditingFarm(null);
        setFarmImageFile(null);
        setFarmFormData({
          name: "",
          description: "",
          address: { street: "", city: "", state: "", zipCode: "" }
        });
        toast({
          title: editingFarm ? "Farm Updated" : "Farm Registered!",
          description: editingFarm ? "Your farm details have been updated." : "Your new farm has been successfully added.",
        });
        fetchMyFarms();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save farm details");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message,
      });
    } finally {
      setIsSavingFarm(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.farmId) {
      toast({ variant: "destructive", title: "Missing Farm", description: "Please select a farm for this yield." });
      return;
    }

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

      if (productImageFile) {
        formData.append('image', productImageFile);
      }

      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
        },
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Yield Added", description: `${newProduct.name} is now live!` });
        setIsDialogOpen(false);
        setProductImageFile(null);
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          category: "Vegetables",
          unit: "kg",
          quantity: 10,
          farmId: farms[0]?.id || "",
        });
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add product");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const formData = new FormData();
      
      const productData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        unit: editingProduct.unit,
        quantity: editingProduct.quantity
      };

      const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
      formData.append('product', productBlob);

      if (productImageFile) {
        formData.append('image', productImageFile);
      }

      const response = await fetch(`http://localhost:8080/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token || '',
        },
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Yield Updated", description: `${editingProduct.name} details have been updated.` });
        setIsEditDialogOpen(false);
        setProductImageFile(null);
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update yield");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
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
        toast({ title: "Stock Updated", description: "Inventory quantity adjusted." });
        setIsStockDialogOpen(false);
        fetchMyProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update stock");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Stock Update Failed", 
        description: error.message 
      });
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

  const handleConfirmDeleteFarm = async () => {
    if (!farmToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/farms/${farmToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token || '',
        },
      });

      if (response.ok) {
        toast({ title: "Farm Deleted", description: "The farm storefront has been removed." });
        setIsFarmDeleteOpen(false);
        setFarmToDelete(null);
        fetchMyFarms();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete farm");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    }
  };

  const openAddFarmDialog = () => {
    setEditingFarm(null);
    setFarmImageFile(null);
    setFarmFormData({
      name: "",
      description: "",
      address: { street: "", city: "", state: "", zipCode: "" }
    });
    setIsFarmDialogOpen(true);
  };

  const openEditFarmDialog = (farm: any) => {
    setEditingFarm(farm);
    setFarmImageFile(null);
    setFarmFormData({
      name: farm.name,
      description: farm.description,
      address: farm.address || { street: "", city: "", state: "", zipCode: "" }
    });
    setIsFarmDialogOpen(true);
  };

  const openDeleteFarmDialog = (farm: any) => {
    setFarmToDelete(farm);
    setIsFarmDeleteOpen(true);
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
            </div>
            
            <Tabs defaultValue={isFarmer ? "farm" : "orders"} className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                {isFarmer ? (
                  <>
                    <TabsTrigger value="farm" className="gap-2">
                      <Store className="h-4 w-4" /> My Farms
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
                  </>
                )}
                <TabsTrigger value="profile" className="gap-2">
                  <Shield className="h-4 w-4" /> Profile
                </TabsTrigger>
              </TabsList>

              {isFarmer && (
                <>
                  <TabsContent value="farm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold font-headline">Manage Your Farm Storefronts</h3>
                      <Button onClick={openAddFarmDialog} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Another Farm
                      </Button>
                    </div>

                    {isLoadingFarms ? (
                      <Card className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </Card>
                    ) : farms.length === 0 ? (
                      <Card className="text-center py-20 border-2 border-dashed">
                        <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-bold">No Farms Registered</h4>
                        <p className="text-muted-foreground mb-6">Register your first farm to start selling.</p>
                        <Button onClick={openAddFarmDialog}>Register Now</Button>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {farms.map((farm) => {
                          const farmImg = resolveImageUrl(farm.image || farm.imageUrl);
                          return (
                            <Card key={farm.id} className="border-t-4 border-t-primary shadow-md overflow-hidden">
                              <CardHeader className="flex flex-row items-start justify-between bg-primary/5">
                                <div className="flex gap-4">
                                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                                    {farmImg ? (
                                      <Image 
                                        src={farmImg} 
                                        alt={farm.name} 
                                        fill 
                                        className="object-cover" 
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <Store className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <CardTitle className="text-2xl">{farm.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" /> 
                                      {farm.address?.street}, {farm.address?.city}, {farm.address?.state} {farm.address?.zipCode}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditFarmDialog(farm)} className="hover:text-primary hover:bg-primary/5">
                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => openDeleteFarmDialog(farm)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="bg-muted p-4 rounded-lg">
                                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Our Story</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {farm.description || "No description provided yet."}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inventory">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Yield Inventory</CardTitle>
                          <CardDescription>Grouped by your farm storefronts.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={fetchMyProducts} 
                            disabled={isProductsLoading}
                          >
                            <RefreshCcw className={`h-4 w-4 ${isProductsLoading ? 'animate-spin' : ''}`} />
                          </Button>
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button disabled={farms.length === 0} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
                                <Plus className="h-4 w-4" /> Add New Yield
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <form onSubmit={handleAddProduct}>
                                <DialogHeader>
                                  <DialogTitle>Add New Yield</DialogTitle>
                                  <DialogDescription>Fill in the details to list your fresh harvest.</DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[70vh] pr-4">
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="prod-farm">Select Farm</Label>
                                      <select 
                                        id="prod-farm"
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                        value={newProduct.farmId}
                                        onChange={(e) => setNewProduct({...newProduct, farmId: e.target.value})}
                                      >
                                        {farms.map((f) => (
                                          <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                      </select>
                                    </div>
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
                                      <Label htmlFor="prod-image">Yield Image</Label>
                                      <div className="flex items-center gap-4">
                                        <Input 
                                          id="prod-image" 
                                          type="file" 
                                          accept="image/*"
                                          onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                                          className="cursor-pointer"
                                        />
                                        {productImageFile && <ImageIcon className="h-6 w-6 text-primary" />}
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
                                </ScrollArea>
                                <DialogFooter className="mt-4">
                                  <Button type="submit" className="w-full">List Yield</Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isProductsLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : products.length === 0 ? (
                          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">You haven't added any yields yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-10">
                            {Object.values(groupedProducts).map((group) => (
                              <div key={group.farm.id} className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                                  <Store className="h-5 w-5 text-primary" />
                                  <h3 className="text-lg font-bold font-headline">{group.farm.name}</h3>
                                  {group.farm.address?.city && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {group.farm.address.city}, {group.farm.address.state}
                                    </span>
                                  )}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-16"></TableHead>
                                      <TableHead>Yield</TableHead>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Price</TableHead>
                                      <TableHead>Stock</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {group.products.map((p) => {
                                      const prodImg = resolveImageUrl(p.image || p.imageUrl);
                                      return (
                                        <TableRow key={p.id}>
                                          <TableCell>
                                            <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted border">
                                              {prodImg ? (
                                                <Image 
                                                  src={prodImg} 
                                                  alt={p.name} 
                                                  fill 
                                                  className="object-cover" 
                                                  unoptimized
                                                />
                                              ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                  <Package className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell className="font-medium">{p.name}</TableCell>
                                          <TableCell>{p.category}</TableCell>
                                          <TableCell>₹{p.price} / {p.unit}</TableCell>
                                          <TableCell>
                                            <Badge variant={p.quantity < 10 ? "destructive" : "secondary"}>
                                              {p.quantity} {p.unit}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => { setStockUpdate({ id: p.id, quantity: p.quantity }); setIsStockDialogOpen(true); }}>
                                                <Box className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => { setEditingProduct(p); setIsEditDialogOpen(true); }}>
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => { setProductToDelete(p); setIsDeleteConfirmOpen(true); }}>
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sales">
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Farm Sales</CardTitle>
                          <CardDescription>Track orders from buyers.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchMySales} disabled={isSalesLoading}>
                          <RefreshCcw className={`h-4 w-4 ${isSalesLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isSalesLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : sales.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No sales activity yet.</p>
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
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                  <TableCell className="font-mono text-xs">{sale.id.substring(0, 8)}</TableCell>
                                  <TableCell className="font-medium">{sale.productName || sale.product?.name}</TableCell>
                                  <TableCell>{sale.buyerName || (sale.user?.firstName + ' ' + sale.user?.lastName)}</TableCell>
                                  <TableCell>{sale.quantity}</TableCell>
                                  <TableCell className="font-bold text-primary">₹{sale.totalPrice}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px]">
                                      {sale.status || 'Paid'}
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

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your identity on FarmConnect.</CardDescription>
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Farm Add/Edit Dialog */}
        <Dialog open={isFarmDialogOpen} onOpenChange={setIsFarmDialogOpen}>
          <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh]">
            <form onSubmit={handleSaveFarm} className="flex flex-col h-full">
              <DialogHeader>
                <DialogTitle>{editingFarm ? "Edit Farm Details" : "Register New Farm"}</DialogTitle>
                <DialogDescription>
                  {editingFarm ? "Update your farm's public information." : "Enter your farm details to start listing your yields."}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-grow pr-4">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm-name">Farm Name</Label>
                    <Input 
                      id="farm-name" 
                      placeholder="e.g. Green Valley Organic Farm" 
                      required 
                      value={farmFormData.name}
                      onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farm-image">Farm Storefront Image</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="farm-image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFarmImageFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {farmImageFile && <Upload className="h-6 w-6 text-primary" />}
                    </div>
                    {editingFarm?.image && !farmImageFile && (
                      <p className="text-xs text-muted-foreground">Currently using stored image. Upload to change.</p>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" /> Farm Address
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input 
                          id="street" 
                          required 
                          value={farmFormData.address.street}
                          onChange={(e) => setFarmFormData({...farmFormData, address: {...farmFormData.address, street: e.target.value}})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            required 
                            value={farmFormData.address.city}
                            onChange={(e) => setFarmFormData({...farmFormData, address: {...farmFormData.address, city: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input 
                            id="state" 
                            required 
                            value={farmFormData.address.state}
                            onChange={(e) => setFarmFormData({...farmFormData, address: {...farmFormData.address, state: e.target.value}})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">Zip Code</Label>
                        <Input 
                          id="zip" 
                          required 
                          value={farmFormData.address.zipCode}
                          onChange={(e) => setFarmFormData({...farmFormData, address: {...farmFormData.address, zipCode: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 pb-4">
                    <Label htmlFor="desc">Farm Story</Label>
                    <textarea 
                      id="desc" 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Tell us about your farm..."
                      value={farmFormData.description}
                      onChange={(e) => setFarmFormData({...farmFormData, description: e.target.value})}
                    />
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="pt-4 border-t">
                <Button type="submit" className="w-full font-bold h-11" disabled={isSavingFarm}>
                  {isSavingFarm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingFarm ? "Update Farm Profile" : "Add Farm Storefront"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Farm Confirmation */}
        <AlertDialog open={isFarmDeleteOpen} onOpenChange={setIsFarmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the farm <span className="font-bold">"{farmToDelete?.name}"</span> and all its associated yields. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteFarm} className="bg-destructive text-destructive-foreground">
                Delete Farm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Product Dialogs (Edit/Stock/Delete) */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {editingProduct && (
              <form onSubmit={handleUpdateProduct}>
                <DialogHeader>
                  <DialogTitle>Edit Yield: {editingProduct.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-prod-name">Yield Name</Label>
                      <Input id="edit-prod-name" required value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-prod-cat">Category</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}>
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
                      <Label>Price (₹)</Label>
                      <Input type="number" required value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input required value={editingProduct.unit} onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prod-image">Change Image</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="edit-prod-image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {productImageFile && <ImageIcon className="h-6 w-6 text-primary" />}
                    </div>
                  </div>
                </div>
                <DialogFooter><Button type="submit" className="w-full">Save Changes</Button></DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <form onSubmit={handleUpdateStock}>
              <DialogHeader><DialogTitle>Update Inventory Stock</DialogTitle></DialogHeader>
              <div className="py-6">
                <Label className="mb-2 block">Quantity</Label>
                <Input type="number" required value={stockUpdate.quantity} onChange={(e) => setStockUpdate({...stockUpdate, quantity: parseInt(e.target.value) || 0})} />
              </div>
              <DialogFooter><Button type="submit" className="w-full">Update Stock</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Yield?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <span className="font-bold">"{productToDelete?.name}"</span> from your active listings? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
