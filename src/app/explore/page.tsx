"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Filter, Search as SearchIcon, X, Loader2 } from "lucide-react";

export default function ExplorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const filteredYields = products.filter(y => {
    const matchesSearch = y.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = y.price >= priceRange[0] && y.price <= priceRange[1];
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(y.category);
    return matchesSearch && matchesPrice && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0; // default newest/unsorted
  });

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 2000]);
    setSelectedCategories([]);
    setSortBy("newest");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h2>
              <div className="space-y-6">
                {/* Search in Sidebar */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Search</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Oranges, Milk..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <div className="space-y-2">
                    {["Fruits", "Vegetables", "Dairy & Eggs", "Bakery", "Pantry"].map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox 
                          id={cat} 
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <label htmlFor={cat} className="text-sm leading-none cursor-pointer">
                          {cat}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold">Price Range</label>
                    <span className="text-xs text-muted-foreground">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                  </div>
                  <Slider 
                    value={priceRange} 
                    max={2000} 
                    step={10} 
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
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

            <Button 
              variant="outline" 
              className="w-full gap-2 border-primary text-primary hover:bg-primary/10"
              onClick={resetFilters}
            >
              <X className="h-4 w-4" /> Reset Filters
            </Button>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="pb-4 border-b">
              <h1 className="text-3xl font-bold font-headline">Explore Fresh Yields</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? "Harvesting the latest data..." : `Showing ${filteredYields.length} fresh results from local farms`}
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-medium text-muted-foreground">Harvesting the latest data...</p>
              </div>
            ) : filteredYields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredYields.map((item) => (
                  <YieldCard 
                    key={item.id} 
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    price={item.price}
                    unit={item.unit}
                    farmName={item.farmName}
                    farmerName={item.farmerName}
                    location={item.farmLocation}
                    rating={item.rating || 5.0}
                    image={item.imageUrl || ""}
                    imageHint={item.name}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="bg-muted inline-block p-6 rounded-full">
                  <SearchIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold font-headline">No yields found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                <Button onClick={resetFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
