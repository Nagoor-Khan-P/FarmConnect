
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, MapPin } from "lucide-react";

interface YieldCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  farmer: string;
  location: string;
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
  farmer,
  location,
  rating,
  image,
  imageHint
}: YieldCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card/50">
      <Link href={`/yields/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={imageHint}
          />
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
            {category}
          </Badge>
        </div>
      </Link>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <Link href={`/yields/${id}`}>
            <h3 className="text-lg font-bold font-headline group-hover:text-primary transition-colors">{name}</h3>
          </Link>
          <div className="flex items-center gap-1 text-xs font-bold text-secondary">
            <Star className="h-3 w-3 fill-current" />
            {rating}
          </div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {location}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground">Sold by <span className="font-semibold text-foreground">{farmer}</span></p>
        <div className="mt-2 text-xl font-bold text-primary">
          ₹{price.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ {unit}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
          <ShoppingBag className="h-4 w-4" /> Add to Basket
        </Button>
      </CardFooter>
    </Card>
  );
}
