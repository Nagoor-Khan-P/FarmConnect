'use client';

import { useEffect, useState } from "react";
import { yieldAndFarmerRecommendations, type YieldAndFarmerRecommendationsOutput } from "@/ai/flows/recommendation-engine";
import { Sparkles, ArrowRight, UserCheck, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function AiRecommendations({ userId }: { userId: string }) {
  const [data, setData] = useState<YieldAndFarmerRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const result = await yieldAndFarmerRecommendations({
          userId,
          preferences: ["organic", "fresh", "local"],
          purchaseHistory: [
            {
              yieldId: "y1",
              yieldName: "Organic Red Apples",
              farmerId: "f1",
              farmerName: "Sarah Jenkins",
              category: "Fruits",
              quantity: 2
            }
          ]
        });
        setData(result);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId]);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.yieldId,
      name: item.yieldName,
      price: item.price,
      image: item.image,
      unit: item.unit,
      farmer: item.farmer
    });
    toast({
      title: "Added to basket",
      description: `${item.yieldName} has been added to your basket.`,
    });
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </section>
    );
  }

  if (!data || (data.recommendedYields.length === 0 && data.recommendedFarmers.length === 0)) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-headline">Specially Picked for You</h2>
            <p className="text-muted-foreground">AI-powered suggestions based on your tastes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold font-headline flex items-center gap-2 text-primary">
            Recommended Yields
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendedYields.map((item) => (
              <Card key={item.yieldId} className="border-l-4 border-l-primary bg-card/40 flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.yieldName}</CardTitle>
                    <span className="text-xs px-2 py-1 bg-primary/10 rounded-sm text-primary font-bold">
                      {item.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground italic mb-2">&quot;{item.reason}&quot;</p>
                  <p className="text-sm font-bold text-primary">₹{item.price.toFixed(2)} / {item.unit}</p>
                </CardContent>
                <CardContent className="pt-0 flex flex-col gap-2">
                  <Button 
                    onClick={() => handleAddToCart(item)}
                    size="sm" 
                    className="w-full gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Basket
                  </Button>
                  <Button variant="link" asChild className="p-0 h-auto text-muted-foreground font-bold group">
                    <Link href={`/yields/${item.yieldId}`}>
                      View Details <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-headline flex items-center gap-2 text-primary">
            Local Heroes
          </h3>
          <div className="space-y-4">
            {data.recommendedFarmers.map((farmer) => (
              <Card key={farmer.farmerId} className="bg-primary/5 border-none">
                <CardContent className="p-4 flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">{farmer.farmerName}</h4>
                    <p className="text-xs text-primary font-medium">{farmer.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{farmer.reason}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
