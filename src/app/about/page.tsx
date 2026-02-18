
"use client";

import { Navbar } from "@/components/Navbar";
import { Leaf, Users, ShieldCheck, Heart } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-primary/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold font-headline mb-6">Our Mission</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting communities with local farms to build a more transparent, sustainable, and delicious food system.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/about1/800/600" 
                alt="Community Farming" 
                fill 
                className="object-cover"
                data-ai-hint="community farm"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-headline">Why FarmConnect?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that everyone deserves access to fresh, healthy food, and that farmers deserve fair compensation for their hard work. FarmConnect bypasses the long, wasteful supply chains of traditional retail, bringing the harvest directly from the soil to your door.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Leaf className="h-8 w-8 text-primary" />
                  <h4 className="font-bold">Eco-Friendly</h4>
                  <p className="text-sm text-muted-foreground">Reduced carbon footprint through local sourcing.</p>
                </div>
                <div className="space-y-2">
                  <Users className="h-8 w-8 text-primary" />
                  <h4 className="font-bold">Support Local</h4>
                  <p className="text-sm text-muted-foreground">Every purchase goes directly to family-owned farms.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-headline text-center mb-16">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Transparency", icon: ShieldCheck, desc: "Know exactly where your food comes from and how it's grown." },
                { title: "Quality", icon: Leaf, desc: "We only partner with farmers who meet our strict quality and freshness standards." },
                { title: "Community", icon: Heart, desc: "Building meaningful relationships between producers and consumers." }
              ].map((val, idx) => (
                <div key={idx} className="bg-background p-8 rounded-xl shadow-sm text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <val.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{val.title}</h3>
                  <p className="text-muted-foreground">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
