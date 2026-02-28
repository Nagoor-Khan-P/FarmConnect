
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { YieldCard } from "@/components/YieldCard";
import { AiRecommendations } from "@/components/AiRecommendations";
import { Button } from "@/components/ui/button";
import { Sprout, Users, Truck, ShieldCheck, ArrowRight, Leaf, LayoutDashboard, ShoppingBag, PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [featuredYields, setFeaturedYields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFarmer = user?.roles.includes('ROLE_FARMER');

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (response.ok) {
          const data = await response.json();
          // Take only the first 4 for the seasonal harvest
          setFeaturedYields(data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center">
          <Image
            src="https://picsum.photos/seed/farmhero/1600/900"
            alt="FarmConnect Hero"
            fill
            className="object-cover brightness-[0.4]"
            priority
            data-ai-hint="lush green farm"
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl text-white space-y-6">
              {isFarmer ? (
                <>
                  <h1 className="text-5xl md:text-7xl font-bold font-headline leading-tight">
                    Manage Your Harvest, <span className="text-primary italic">Grow Your Business</span>
                  </h1>
                  <p className="text-xl text-zinc-200 font-medium">
                    Welcome back, {user?.firstName}! List your latest yields, track your orders, and reach thousands of local buyers directly from your farm.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                      <Link href="/dashboard" className="gap-2">
                        <LayoutDashboard className="h-5 w-5" /> Go to Dashboard
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="bg-transparent text-white border-white hover:bg-white/10 px-8">
                      <Link href="/dashboard?tab=inventory" className="gap-2">
                        <PlusCircle className="h-5 w-5" /> Add New Yield
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-7xl font-bold font-headline leading-tight">
                    Fresh Farm Yields, <span className="text-primary italic">Delivered Direct</span>
                  </h1>
                  <p className="text-xl text-zinc-200 font-medium">
                    Support local farmers and get the freshest produce, dairy, and artisanal goods delivered from the farm straight to your doorstep.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8">
                      <Link href="/explore" className="gap-2">
                        <ShoppingBag className="h-5 w-5" /> Shop Now
                      </Link>
                    </Button>
                    {!isAuthenticated && (
                      <Button size="lg" variant="outline" asChild className="bg-transparent text-white border-white hover:bg-white/10 px-8">
                        <Link href="/farmer/register">Register as Farmer</Link>
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 space-y-24">
          
          {/* Features Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/20 p-4 rounded-full">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold font-headline text-xl">100% Organic</h3>
              <p className="text-sm text-muted-foreground">Highest quality produce grown with love and care.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/20 p-4 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold font-headline text-xl">Direct Trade</h3>
              <p className="text-sm text-muted-foreground">Connecting you directly with the people who grow your food.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/20 p-4 rounded-full">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold font-headline text-xl">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">From the soil to your table in less than 24 hours.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/20 p-4 rounded-full">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold font-headline text-xl">Quality Guaranteed</h3>
              <p className="text-sm text-muted-foreground">Every purchase is protected by our freshness guarantee.</p>
            </div>
          </section>

          {/* Featured Yields Section - Visible to All */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Seasonal Harvest</h2>
                <p className="text-muted-foreground">Discover what's fresh this week from our local farms.</p>
              </div>
              <Link href="/explore" className="text-primary font-bold flex items-center gap-1 hover:underline">
                View all yields <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredYields.map((item) => (
                  <YieldCard 
                    key={item.id} 
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    price={item.price}
                    unit={item.unit}
                    farmer={item.farmName || "Local Farmer"}
                    location={item.farmLocation || "Local Farm"}
                    rating={item.rating || 5.0}
                    image={item.imageUrl || ""}
                    imageHint={item.name}
                  />
                ))}
              </div>
            )}
          </section>

          {/* AI Recommendations Section - Personalized for logged in users */}
          {isAuthenticated && <AiRecommendations userId={user?.id || "guest"} />}

          {/* Call to Action Section - Role Specific */}
          {!isFarmer && (
            <section className="bg-primary/10 rounded-3xl p-12 overflow-hidden relative">
              <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 space-y-6">
                  <h2 className="text-4xl font-bold font-headline">Ready to start selling your yields?</h2>
                  <p className="text-lg text-muted-foreground">
                    Join thousands of local farmers who are reaching more customers and growing their business with FarmConnect.
                  </p>
                  <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
                    <Link href="/farmer/register">Become a Farmer Partner</Link>
                  </Button>
                </div>
                <div className="flex-1 relative aspect-square w-full max-w-md">
                  <Image
                    src="https://picsum.photos/seed/farmer3/600/600"
                    alt="Happy Farmer"
                    fill
                    className="object-cover rounded-2xl shadow-2xl"
                    data-ai-hint="smiling farmer"
                  />
                </div>
              </div>
            </section>
          )}

          {isFarmer && (
            <section className="bg-primary/5 rounded-3xl p-12 border-2 border-dashed border-primary/20">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <h2 className="text-4xl font-bold font-headline text-primary">Grow Your Farm Online</h2>
                  <p className="text-lg text-muted-foreground italic">
                    "FarmConnect helped me reach 3x more customers in just two months. The inventory management tools are so simple to use!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">Harvest Manager Pro</p>
                      <p className="text-sm text-muted-foreground">Tip: Keep your stock quantities updated for better search visibility.</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
                    <p className="text-3xl font-bold text-primary">24h</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Direct Delivery</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
                    <p className="text-3xl font-bold text-primary">0%</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Middleman Fees</p>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      <footer className="bg-zinc-900 text-zinc-400 py-12 border-t border-zinc-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold font-headline text-white">FarmConnect</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Empowering local farmers and bringing fresh, sustainable produce to every kitchen across the country.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore" className="hover:text-primary">All Yields</Link></li>
              <li><Link href="/explore?category=Fruits" className="hover:text-primary">Fruits</Link></li>
              <li><Link href="/explore?category=Vegetables" className="hover:text-primary">Vegetables</Link></li>
              <li><Link href="/explore?category=Dairy" className="hover:text-primary">Dairy & Eggs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/farmers" className="hover:text-primary">Our Farmers</Link></li>
              <li><Link href="/sustainability" className="hover:text-primary">Sustainability</Link></li>
              <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe to get seasonal updates and farm stories.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-zinc-800 border-none rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" className="bg-primary text-primary-foreground font-bold">Join</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-12 mt-12 border-t border-zinc-800 text-xs text-center">
          © {new Date().getFullYear()} FarmConnect Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
