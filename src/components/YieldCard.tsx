
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, MapPin, Check, Store, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const isInCart = cart.some(item => item.productId === id || item.id === id);
  const isWishlisted = isInWishlist(id);

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

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your wishlist.",
      });
      return;
    }

    if (isWishlisted) {
      const item = wishlist.find(i => i.productId === id);
      if (item) {
        await removeFromWishlist(item.id);
        toast({ title: "Removed from wishlist" });
      }
    } else {
      await addToWishlist(id);
      toast({ title: "Added to wishlist" });
    }
  };

  const imageSrc = (function() {
    if (!image) return `https://picsum.photos/seed/${id}/400/300`;
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    return `http://localhost:8080${cleanPath}`;
  })();

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card/50 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/yields/${id}`}>
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={imageHint}
            unoptimized
          />
        </Link>
        <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground rounded-sm">
          {category}
        </Badge>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute top-2 right-2 rounded-full shadow-md transition-colors",
            isWishlisted ? "bg-white text-destructive hover:bg-white" : "bg-white/80 hover:bg-white text-muted-foreground"
          )}
          onClick={handleToggleWishlist}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </Button>
      </div>
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
