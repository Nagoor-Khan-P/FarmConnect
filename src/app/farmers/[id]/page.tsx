
"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { YieldCard } from "@/components/YieldCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Star, 
  ArrowLeft, 
  Loader2, 
  Store, 
  Package, 
  Mail, 
  Calendar,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function FarmerProfilePage() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [farmerRes, farmsRes, productsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/farmers/${id}`),
        fetch(`http://localhost:8080/api/farmers/${id}/farms`),
        fetch(`http://localhost:8080/api/farmers/${id}/products`)
      ]);

      if (farmerRes.ok) setFarmer(await farmerRes.json());
      if (farmsRes.ok) setFarms(await farmsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (error) {
      console.error("Error fetching farmer data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold font-headline mb-4">Farmer Not Found</h1>
          <Button asChild><Link href="/farmers">Back to Farmers</Link></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Header/Hero Area */}
        <section className="bg-primary/10 py-12 border-b">
          <div className="container mx-auto px-4">
            <Link href="/farmers" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Partners
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={`https://picsum.photos/seed/${farmer.id}/400/400`} alt={farmer.username} />
                <AvatarFallback className="text-4xl bg-primary/20 text-primary font-bold">
                  {farmer.firstName?.[0]}{farmer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold font-headline text-primary">
                      {farmer.firstName} {farmer.lastName}
                    </h1>
                    <Badge variant="secondary" className="bg-primary text-white rounded-sm text-[10px] uppercase font-bold tracking-wider">
                      Verified Farmer
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">@{farmer.username}</p>
                </div>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" /> {farmer.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4 text-secondary fill-current" /> 
                    <span className="font-bold text-foreground">5.0</span> (New Partner)
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" /> Joined FarmConnect
                  </div>
                </div>

                <p className="max-w-3xl text-muted-foreground leading-relaxed italic">
                  "Growing fresh, organic, and sustainable produce for our community is more than a job – it's our passion. Every seed planted is a promise of quality and health for your family."
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="products" className="space-y-8">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" /> Current Harvest ({products.length})
              </TabsTrigger>
              <TabsTrigger value="farms" className="gap-2">
                <Store className="h-4 w-4" /> Our Farms ({farms.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {products.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No yields available currently. Check back soon for the next harvest!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((item) => (
                    <YieldCard 
                      key={item.id} 
                      id={item.id}
                      name={item.name}
                      category={item.category}
                      price={item.price}
                      unit={item.unit}
                      farmName={item.farm?.name || farmer.firstName + "'s Farm"}
                      farmerName={`${farmer.firstName} ${farmer.lastName}`}
                      location={item.farm?.address?.city}
                      rating={5.0}
                      image={item.imageUrl || ""}
                      imageHint={item.name}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="farms">
              {farms.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                  <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No farm locations registered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {farms.map((farm) => (
                    <Card key={farm.id} className="overflow-hidden border-t-4 border-t-primary shadow-lg bg-card/50">
                      <div className="relative h-48 w-full bg-muted">
                        <Image 
                          src={farm.imageUrl ? `http://localhost:8080${farm.imageUrl}` : `https://picsum.photos/seed/${farm.id}/800/400`} 
                          alt={farm.name} 
                          fill 
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-2xl text-primary">{farm.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-2">
                          <MapPin className="h-4 w-4 text-primary" /> 
                          <span className="font-bold text-foreground">
                            {farm.address?.street}, {farm.address?.city}, {farm.address?.state} {farm.address?.zipCode}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {farm.description || "A beautiful local farm dedicated to organic and sustainable agriculture practices."}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-sm uppercase tracking-wider">
                            <Globe className="h-3.5 w-3.5" /> {farm.address?.country || "India"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
