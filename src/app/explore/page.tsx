
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { YieldCard } from "@/components/YieldCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Search as SearchIcon, X } from "lucide-react";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);

  const allYields = [
    {
      id: "y1",
      name: "Crisp Orchard Apples",
      category: "Fruits",
      price: 4.50,
      unit: "lb",
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
      price: 12.00,
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
      price: 3.25,
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
      price: 5.50,
      unit: "dozen",
      farmer: "Sunny Side Poultry",
      location: "East Hills",
      rating: 4.9,
      image: "https://picsum.photos/seed/eggs/400/300",
      imageHint: "fresh eggs"
    },
    {
      id: "y5",
      name: "Artisanal Sourdough",
      category: "Bakery",
      price: 7.00,
      unit: "loaf",
      farmer: "Golden Grains",
      location: "Valley Meadows",
      rating: 4.6,
      image: "https://picsum.photos/seed/bread/400/300",
      imageHint: "sourdough bread"
    },
    {
      id: "y6",
      name: "Grass-Fed Butter",
      category: "Dairy & Eggs",
      price: 8.50,
      unit: "block",
      farmer: "Happy Cows Dairy",
      location: "North Fields",
      rating: 4.8,
      image: "https://picsum.photos/seed/butter/400/300",
      imageHint: "farm butter"
    }
  ];

  const filteredYields = allYields.filter(y => 
    y.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    y.price >= priceRange[0] && y.price <= priceRange[1]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h2 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <div className="space-y-2">
                    {["Fruits", "Vegetables", "Dairy & Eggs", "Bakery", "Pantry"].map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox id={cat} />
                        <label htmlFor={cat} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {cat}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold">Price Range</label>
                    <span className="text-xs text-muted-foreground">${priceRange[0]} - ${priceRange[1]}</span>
                  </div>
                  <Slider 
                    defaultValue={[0, 100]} 
                    max={100} 
                    step={1} 
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Sort By</label>
                  <Select defaultValue="newest">
                    <SelectTrigger>
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary/10">
              <X className="h-4 w-4" /> Reset Filters
            </Button>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold font-headline">Explore Fresh Yields</h1>
                <p className="text-muted-foreground">Showing {filteredYields.length} results</p>
              </div>
              <div className="relative w-full sm:w-auto">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search yields..."
                  className="pl-8 w-full sm:w-72"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredYields.length > 0 ? (
                filteredYields.map((item) => (
                  <YieldCard key={item.id} {...item} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center space-y-4">
                  <div className="bg-muted inline-block p-6 rounded-full">
                    <SearchIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">No yields found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                  <Button onClick={() => {setSearchQuery(""); setPriceRange([0, 100]);}}>Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
