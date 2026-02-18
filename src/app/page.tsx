
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { YieldCard } from "@/components/YieldCard";
import { AiRecommendations } from "@/components/AiRecommendations";
import { Button } from "@/components/ui/button";
import { Sprout, Users, Truck, ShieldCheck, ArrowRight, Leaf } from "lucide-react";

export default function Home() {
  const featuredYields = [
    {
      id: "y1",
      name: "Crisp Orchard Apples",
      category: "Fruits",
      price: 180.00,
      unit: "kg",
      farmer: "Sarah Jenkins",
      location: "Oak Ridge Farms",
      rating: 4.8,
      image: "https://picsum.photos/seed/apples/400/300",
      imageHint: "fresh red apples"
    },
    {
      id: "y2",
      name: "Wildflower Honey",
      category: "Pantry",
      price: 650.00,
      unit: "jar",
      farmer: "Ben's Bees",
      location: "Valley Meadows",
      rating: 4.9,
      image: "https://picsum.photos/seed/honey/400/300",
      imageHint: "honey jar"
    },
    {
      id: "y3",
      name: "Organic Heirloom Carrots",
      category: "Vegetables",
      price: 120.00,
      unit: "bunch",
      farmer: "Organic Roots",
      location: "Green Glade",
      rating: 4.7,
      image: "https://picsum.photos/seed/carrots/400/300",
      imageHint: "fresh carrots"
    },
    {
      id: "y4",
      name: "Farm Fresh Large Eggs",
      category: "Dairy & Eggs",
      price: 95.00,
      unit: "dozen",
      farmer: "Sunny Side Poultry",
      location: "East Hills",
      rating: 4.9,
      image: "https://picsum.photos/seed/eggs/400/300",
      imageHint: "fresh eggs"
    }
  ];

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
              <h1 className="text-5xl md:text-7xl font-bold font-headline leading-tight">
                Fresh Farm Yields, <span className="text-primary italic">Delivered Direct</span>
              </h1>
              <p className="text-xl text-zinc-200 font-medium">
                Support local farmers and get the freshest produce, dairy, and artisanal goods delivered from the farm straight to your doorstep.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8">
                  <Link href="/explore">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-transparent text-white border-white hover:bg-white/10 px-8">
                  <Link href="/farmer/register">Register as Farmer</Link>
                </Button>
              </div>
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

          {/* Featured Yields Section */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredYields.map((item) => (
                <YieldCard key={item.id} {...item} />
              ))}
            </div>
          </section>

          {/* AI Recommendations Section */}
          <AiRecommendations userId="user-123" />

          {/* Call to Action Section */}
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
