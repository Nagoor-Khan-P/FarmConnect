
"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Pencil, 
  CheckCircle2, 
  Loader2, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  Globe,
  Home,
  Check,
  PackageCheck
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
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { token, isAuthenticated } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/addresses', {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((addr: any) => ({
          ...addr,
          isDefault: addr.default === true
        }));
        setAddresses(mappedData);
        
        // Auto-select default address on load if nothing is selected
        if (!selectedAddressId) {
          const defaultAddr = mappedData.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (mappedData.length > 0) setSelectedAddressId(mappedData[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedAddressId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, fetchAddresses, router]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const url = editingAddress 
      ? `http://localhost:8080/api/addresses/${editingAddress.id}` 
      : 'http://localhost:8080/api/addresses';
    const method = editingAddress ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(addressForm)
      });

      if (response.ok) {
        toast({ title: editingAddress ? "Address Updated" : "Address Added" });
        setIsDialogOpen(false);
        setEditingAddress(null);
        setAddressForm({ street: "", city: "", state: "", zipCode: "", country: "India" });
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save address." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId || !token) return;
    
    setIsProcessingOrder(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          addressId: selectedAddressId
        })
      });

      if (response.ok) {
        toast({
          title: "Order Processed",
          description: "Your farm-fresh yields are on their way!",
        });
        // Clear local and server cart state
        await clearCart();
        router.push('/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to process order. Please try again.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "Something went wrong while confirming your order."
      });
    } finally {
      setIsProcessingOrder(false);
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
        if (selectedAddressId === id) setSelectedAddressId(null);
        fetchAddresses();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete address." });
    }
  };

  const handleSetDefault = async (id: string) => {
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

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country || "India"
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setAddressForm({ street: "", city: "", state: "", zipCode: "", country: "India" });
    setIsDialogOpen(true);
  };

  if (cart.length === 0 && !isProcessingOrder) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8 space-y-4">
            <CardTitle>Basket is Empty</CardTitle>
            <p className="text-muted-foreground">Add some yields to your basket before checking out.</p>
            <Button onClick={() => router.push('/explore')}>Go to Shop</Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-headline mb-8">Secure Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Shipping Address
                </h2>
                {!isLoading && addresses.length > 0 && (
                  <Button variant="outline" size="sm" onClick={openAddDialog} className="gap-1 border-primary text-primary hover:bg-primary/10">
                    <Plus className="h-4 w-4" /> Add New
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : addresses.length === 0 ? (
                <Card className="bg-muted/30 border-dashed py-12 text-center">
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">You have no saved shipping addresses.</p>
                    <Button onClick={openAddDialog}>Create Your First Address</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <Card 
                      key={addr.id} 
                      className={cn(
                        "relative cursor-pointer transition-all border-2 overflow-hidden flex flex-col h-full",
                        selectedAddressId === addr.id 
                          ? "border-primary shadow-md bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      {selectedAddressId === addr.id && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground p-1 rounded-bl-lg z-10">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <CardContent className="p-5 flex-grow">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="font-bold text-lg leading-tight truncate">{addr.street}</p>
                            {addr.isDefault && (
                              <Badge className="bg-primary text-primary-foreground border-none text-[10px] uppercase font-bold shrink-0 rounded-sm pointer-events-none">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-xs font-bold text-primary flex items-center gap-1 mt-2">
                            <Globe className="h-3 w-3" /> {addr.country}
                          </p>
                        </div>
                      </CardContent>
                      <Separator />
                      <CardFooter className="p-2 flex flex-col gap-2 bg-muted/20">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:bg-primary hover:text-white transition-colors" 
                              onClick={(e) => { e.stopPropagation(); openEditDialog(addr); }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10" 
                              onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          {!addr.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs font-bold border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                            >
                              Set Default
                            </Button>
                          )}
                        </div>
                        
                        <Button 
                          variant={selectedAddressId === addr.id ? "default" : "secondary"}
                          size="sm"
                          className={cn(
                            "w-full h-8 text-xs font-bold gap-1",
                            selectedAddressId === addr.id ? "bg-primary" : ""
                          )}
                          onClick={(e) => { e.stopPropagation(); setSelectedAddressId(addr.id); }}
                        >
                          {selectedAddressId === addr.id ? (
                            <>
                              <PackageCheck className="h-3 w-3" /> Selected for Shipping
                            </>
                          ) : "Ship to this address"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Shipping Method
              </h2>
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Standard Farm-to-Table Delivery</p>
                      <p className="text-sm text-muted-foreground">Arrives within 24-48 hours of harvest.</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary font-bold">FREE</Badge>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Order Summary Column */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-t-4 border-t-primary shadow-lg">
              <CardHeader>
                <CardTitle>Order Review</CardTitle>
                <CardDescription>Items in your basket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest text-right",
                      selectedAddressId ? "text-primary" : "text-destructive"
                    )}>
                      {selectedAddressId ? "FREE" : "Select address to calculate"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full h-12 text-lg font-bold gap-2" 
                  disabled={!selectedAddressId || isProcessingOrder}
                  onClick={handleConfirmOrder}
                >
                  {isProcessingOrder ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Confirm Order <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Secure Transaction Powered by FarmConnect</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Address Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSaveAddress}>
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Edit Shipping Address" : "New Shipping Address"}</DialogTitle>
                <DialogDescription>
                  Enter your details to ensure accurate farm-to-door delivery.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="street" 
                      className="pl-9"
                      placeholder="e.g. 123 Farm Lane"
                      required 
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" placeholder="Zip Code" required value={addressForm.zipCode} onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="country" 
                        className="pl-9"
                        required 
                        value={addressForm.country} 
                        onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full font-bold h-11" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAddress ? "Save Changes" : "Save Shipping Address"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
