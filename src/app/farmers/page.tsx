
"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight, Loader2, Users } from "lucide-react";
import Link from "next/link";

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFarmers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/farmers');
      if (response.ok) {
        const data = await response.json();
        setFarmers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching farmers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline mb-4 text-primary">Meet Our Local Farmers</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get to know the hardworking people who bring fresh, high-quality produce to your table.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-medium text-muted-foreground">Finding local partners...</p>
          </div>
        ) : farmers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farmers.map((farmer) => (
              <Card key={farmer.id} className="hover:shadow-md transition-shadow group border-none bg-card/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={`https://picsum.photos/seed/${farmer.id}/200/200`} alt={farmer.username} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{farmer.firstName?.[0]}{farmer.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{farmer.firstName} {farmer.lastName}</CardTitle>
                    <CardDescription className="flex items-center gap-1 font-medium">
                      @{farmer.username}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary rounded-sm uppercase text-[10px] font-bold px-2 py-0.5">
                      Verified Partner
                    </Badge>
                    <div className="flex items-center gap-1 text-sm font-bold text-secondary">
                      <Star className="h-4 w-4 fill-current" /> 5.0
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 italic">
                    Dedicated to providing the freshest yields from our soil to your doorstep. Supporting local agriculture through sustainable practices.
                  </p>
                  <Button variant="outline" className="w-full group/btn border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold" asChild>
                    <Link href={`/farmers/${farmer.id}`}>
                      View Farm Profile <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="bg-muted inline-block p-6 rounded-full">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-headline">No farmers found</h3>
            <p className="text-muted-foreground">We are currently growing our network of local partners.</p>
            <Button onClick={fetchFarmers} variant="outline" className="gap-2">
              Refresh List
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
