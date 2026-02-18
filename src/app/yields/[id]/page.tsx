
"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Truck, ShieldCheck, ShoppingBag, ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function YieldDetailPage() {
  const { id } = useParams();

  // Mock data for detail view
  const yieldItem = {
    id: id,
    name: "Crisp Orchard Apples",
    category: "Fruits",
    price: 180.00,
    unit: "kg",
    farmer: "Sarah Jenkins",
    location: "Oak Ridge Farms",
    rating: 4.8,
    reviews: 124,
    description: "Our hand-picked Fuji apples are grown without synthetic pesticides. Each apple is selected for its perfect snap and balance of sweetness and tartness. Harvested at peak ripeness to ensure maximum flavor and nutrition.",
    features: ["Organic Certified", "Freshly Harvested", "No Added Wax", "Locally Grown"],
    images: ["https://picsum.photos/seed/apples/800/600"]
  };

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
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src={yieldItem.images[0]} 
                alt={yieldItem.name} 
                fill 
                className="object-cover"
                data-ai-hint="fresh apples"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                {yieldItem.category}
              </Badge>
              <h1 className="text-4xl font-bold font-headline">{yieldItem.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-secondary font-bold">
                  <Star className="h-4 w-4 fill-current" /> {yieldItem.rating}
                  <span className="text-muted-foreground font-normal">({yieldItem.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {yieldItem.location}
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              ₹{yieldItem.price.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">/ {yieldItem.unit}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {yieldItem.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {yieldItem.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 gap-2 h-14 text-lg">
                <ShoppingBag className="h-5 w-5" /> Add to Basket
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14 p-0">
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span>Fast local delivery (within 24h)</span>
              </div>
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>Sold by <Link href="/farmers/f1" className="font-bold hover:underline">{yieldItem.farmer}</Link></span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function UserCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
