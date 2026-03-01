"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, MapPin, Check, Store, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface YieldCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  farmName: string;
  farmerName: string;
  location?: string;
  rating: number;
  image: string;
  imageHint: string;
}

export function YieldCard({
  id,
  name,
  category,
  price,
  unit,
  farmName,
  farmerName,
  location,
  rating,
  image,
  imageHint
}: YieldCardProps) {
  const { addToCart, cart } = useCart();
  const { toast } = useToast();

  const isInCart = cart.some(item => item.productId === id || item.id === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ 
      id, 
      name, 
      price, 
      image, 
      unit, 
      farmName, 
      farmerName 
    });
    toast({
      title: "Added to basket",
      description: `${name} has been added to your shopping basket.`,
    });
  };

  const imageSrc = (function() {
    if (!image) return `https://picsum.photos/seed/${id}/400/300`;
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    return `http://localhost:8080${cleanPath}`;
  })();

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card/50 flex flex-col h-full">
      <Link href={`/yields/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={imageHint}
            unoptimized
          />
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground rounded-sm">
            {category}
          </Badge>
        </div>
      </Link>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/yields/${id}`}>
            <h3 className="text-lg font-bold font-headline group-hover:text-primary transition-colors line-clamp-2">{name}</h3>
          </Link>
          <div className="flex items-center gap-1 text-xs font-bold text-secondary shrink-0">
            <Star className="h-3 w-3 fill-current" />
            {rating}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 mt-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Store className="h-3 w-3 text-primary" /> 
            <span className="font-medium">{farmName || "Local Farm"}</span>
          </p>
          {location && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 ml-4.5">
              <MapPin className="h-2.5 w-2.5" /> {location}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>Sold by <span className="font-semibold text-foreground">{farmerName || "Local Farmer"}</span></span>
        </div>
        <div className="mt-3 text-xl font-bold text-primary">
          ₹{price.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ {unit}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        {isInCart ? (
          <Button 
            asChild
            className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold border border-primary/20"
          >
            <Link href="/cart">
              <Check className="h-4 w-4" /> View In Basket
            </Link>
          </Button>
        ) : (
          <Button 
            onClick={handleAddToCart}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <ShoppingBag className="h-4 w-4" /> Add to Basket
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
