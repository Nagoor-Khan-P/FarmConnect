"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Truck, ShieldCheck, ShoppingBag, ArrowLeft, Heart, Loader2, Check, Store, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function YieldDetailPage() {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const { toast } = useToast();
  const [yieldItem, setYieldItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isInCart = cart.some(item => item.productId === id || item.id === id);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await fetch(`http://localhost:8080/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setYieldItem(data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not find this product."
          });
        }
      } catch (error) {
        console.error("Failed to fetch yield details:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetails();
  }, [id, toast]);

  const handleAddToCart = () => {
    if (!yieldItem) return;
    addToCart({
      id: yieldItem.id,
      name: yieldItem.name,
      price: yieldItem.price,
      image: resolveImageUrl(yieldItem.imageUrl || yieldItem.image),
      unit: yieldItem.unit,
      farmName: yieldItem.farmName,
      farmerName: yieldItem.farmerName
    });
    toast({
      title: "Added to basket",
      description: `${yieldItem.name} has been added to your shopping basket.`,
    });
  };

  const resolveImageUrl = (path: string) => {
    if (!path) return `https://picsum.photos/seed/${id}/800/600`;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8080${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!yieldItem) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold font-headline mb-4">Yield Not Found</h1>
          <p className="text-muted-foreground mb-8">The yield you are looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/explore">Back to Explore</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/explore" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border bg-muted">
              <Image 
                src={resolveImageUrl(yieldItem.imageUrl || yieldItem.image)} 
                alt={yieldItem.name} 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold rounded-sm">
                {yieldItem.category}
              </Badge>
              <h1 className="text-4xl font-bold font-headline">{yieldItem.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-secondary font-bold">
                  <Star className="h-4 w-4 fill-current" /> {yieldItem.rating || "5.0"}
                  <span className="text-muted-foreground font-normal">({yieldItem.reviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Store className="h-4 w-4 text-primary" />
                  {yieldItem.farmName || "Local Farm"}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {yieldItem.farmLocation || "Local Source"}
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              ₹{yieldItem.price.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">/ {yieldItem.unit}</span>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl">
              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {yieldItem.description || "No description provided for this fresh farm yield."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Freshly Harvested", "Locally Grown", "Quality Guaranteed", "Direct from Farm"].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4">
              {isInCart ? (
                <Button asChild size="lg" className="flex-1 gap-2 h-14 text-lg font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-primary/20">
                  <Link href="/cart">
                    <Check className="h-5 w-5" /> View In Basket
                  </Link>
                </Button>
              ) : (
                <Button onClick={handleAddToCart} size="lg" className="flex-1 gap-2 h-14 text-lg font-bold">
                  <ShoppingBag className="h-5 w-5" /> Add to Basket
                </Button>
              )}
              <Button size="lg" variant="outline" className="h-14 w-14 p-0">
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl space-y-3 text-sm border border-primary/10">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span>Fast local delivery (within 24h)</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <span>Sold by <span className="font-bold text-primary">{yieldItem.farmerName || yieldItem.farmer || "Local Farmer"}</span></span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
