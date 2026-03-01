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
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  const { cart, cartTotal, cartCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        setAddresses(data);
        const defaultAddr = data.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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

  if (cart.length === 0) {
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
                  <Button variant="outline" size="sm" onClick={openAddDialog} className="gap-1 border-primary text-primary">
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
                      className={`relative cursor-pointer transition-all border-2 ${selectedAddressId === addr.id ? 'border-primary shadow-md bg-primary/5' : 'border-transparent hover:border-muted-foreground/30'}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <CardContent className="p-4 pt-6">
                        {addr.isDefault && (
                          <Badge className="absolute top-2 right-2 bg-primary/20 text-primary border-none text-[10px] uppercase font-bold">
                            Default
                          </Badge>
                        )}
                        <div className="space-y-1">
                          <p className="font-bold text-lg">{addr.street}</p>
                          <p className="text-sm text-muted-foreground">{addr.city}, {addr.state}</p>
                          <p className="text-sm text-muted-foreground">{addr.zipCode}</p>
                          <p className="text-xs font-bold text-primary flex items-center gap-1 mt-2">
                            <Globe className="h-3 w-3" /> {addr.country}
                          </p>
                        </div>
                      </CardContent>
                      <Separator />
                      <CardFooter className="p-2 flex justify-between bg-muted/20">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => { e.stopPropagation(); openEditDialog(addr); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {!addr.isDefault && (
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}>
                            Set Default
                          </Button>
                        )}
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
            <Card className="sticky top-24 border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Order Review</CardTitle>
                <CardDescription>Items in your basket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
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
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-primary font-bold uppercase text-[10px] tracking-widest mt-0.5">Calculated based on address</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full h-12 text-lg font-bold gap-2" disabled={!selectedAddressId}>
                  Confirm Order <ChevronRight className="h-5 w-5" />
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
                      required 
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" required value={addressForm.zipCode} onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})} />
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
