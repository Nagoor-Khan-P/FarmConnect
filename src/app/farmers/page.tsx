
"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FarmersPage() {
  const farmers = [
    {
      id: "f1",
      name: "Sarah Jenkins",
      farm: "Oak Ridge Farms",
      location: "East Hills",
      rating: 4.8,
      specialty: "Organic Fruits",
      image: "https://picsum.photos/seed/farmer1/200/200",
      description: "Sarah has been farming for over 15 years, focusing on sustainable orchard management."
    },
    {
      id: "f2",
      name: "Ben Miller",
      farm: "Ben's Bees",
      location: "Valley Meadows",
      rating: 4.9,
      specialty: "Artisanal Honey",
      image: "https://picsum.photos/seed/farmer2/200/200",
      description: "A local beekeeper dedicated to preserving natural wildflower habitats."
    },
    {
      id: "f3",
      name: "Organic Roots",
      farm: "Green Glade",
      location: "North Fields",
      rating: 4.7,
      specialty: "Root Vegetables",
      image: "https://picsum.photos/seed/farmer3/200/200",
      description: "Small family farm specializing in heritage and heirloom vegetable varieties."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline mb-4">Meet Our Local Farmers</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get to know the hardworking people who bring fresh, high-quality produce to your table.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {farmers.map((farmer) => (
            <Card key={farmer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={farmer.image} alt={farmer.name} />
                  <AvatarFallback>{farmer.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{farmer.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {farmer.location}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {farmer.specialty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm font-bold text-secondary">
                    <Star className="h-4 w-4 fill-current" /> {farmer.rating}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {farmer.description}
                </p>
                <Button variant="outline" className="w-full group" asChild>
                  <Link href={`/farmers/${farmer.id}`}>
                    Visit Farm Profile <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
