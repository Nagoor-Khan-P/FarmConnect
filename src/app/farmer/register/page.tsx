
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AiYieldDescription } from "@/components/AiYieldDescription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, MapPin, Store, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FarmerRegisterPage() {
  const [step, setStep] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Form States
  const [yieldType, setYieldType] = useState("");
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const handleCharacteristicAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && !characteristics.includes(val)) {
        setCharacteristics([...characteristics, val]);
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Successful!",
        description: "Your farm profile is now live. Welcome to the FarmConnect family!",
      });
      setStep("success");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {step !== "success" && (
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold font-headline mb-4">Start Your Farm Journey</h1>
              <p className="text-muted-foreground text-lg">Direct access to thousands of customers looking for fresh produce.</p>
            </div>
          )}

          {step === "success" ? (
            <Card className="text-center py-12 px-6 border-2 border-primary/20 bg-primary/5">
              <CardContent className="space-y-6">
                <div className="mx-auto bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold font-headline">Welcome, Farmer Partner!</h2>
                <p className="text-lg max-w-md mx-auto text-muted-foreground">
                  Your farm is now connected. Start adding your first yield listings to begin selling.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">Go to Dashboard</Button>
                  <Button variant="outline" size="lg">Add New Yield</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={step} onValueChange={setStep} className="space-y-8">
              <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto bg-muted/50">
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Farm Profile</TabsTrigger>
                <TabsTrigger value="yield" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Initial Yield</TabsTrigger>
                <TabsTrigger value="payment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Payouts</TabsTrigger>
              </TabsList>

              <form onSubmit={handleRegister}>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" /> Farm Details
                      </CardTitle>
                      <CardDescription>Tell us about your farm and what makes it special.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="farm-name">Farm Name</Label>
                          <Input id="farm-name" placeholder="e.g. Sunny Meadows Farm" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="location" className="pl-8" placeholder="City, State" required />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about">About the Farm</Label>
                        <Textarea id="about" placeholder="Describe your farming practices, history, and mission..." className="min-h-[120px]" />
                      </div>
                      <Button type="button" onClick={() => setStep("yield")} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
                        Continue to First Yield
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="yield">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-primary" /> First Yield Listing
                      </CardTitle>
                      <CardDescription>Add your first product to start selling immediately.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="yield-type">Yield Type</Label>
                            <Input 
                              id="yield-type" 
                              placeholder="e.g. Organic Red Fuji Apples" 
                              value={yieldType}
                              onChange={(e) => setYieldType(e.target.value)}
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="characteristics">Key Features (Press Enter to add)</Label>
                            <Input 
                              id="characteristics" 
                              placeholder="e.g. Sweet, Organic, Local" 
                              onKeyDown={handleCharacteristicAdd}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {characteristics.map(c => (
                                <span key={c} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                  {c} <button type="button" onClick={() => setCharacteristics(characteristics.filter(x => x !== c))} className="hover:text-destructive">×</button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Yield Image</Label>
                            <div className="border-2 border-dashed rounded-lg aspect-video flex flex-col items-center justify-center text-muted-foreground bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                              <ImageIcon className="h-8 w-8 mb-2" />
                              <span className="text-xs">Upload product photo</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <AiYieldDescription 
                          yieldType={yieldType} 
                          characteristics={characteristics} 
                          onGenerated={setDescription} 
                        />
                        <Textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Your generated description will appear here..."
                          className="min-h-[150px]"
                          required
                        />
                      </div>

                      <Button type="button" onClick={() => setStep("payment")} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
                        Almost Done: Payment Info
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payout Information</CardTitle>
                      <CardDescription>Tell us where to send your earnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank">Bank Name</Label>
                        <Input id="bank" placeholder="Enter bank name" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="account">Account Number</Label>
                          <Input id="account" type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="routing">Routing Number</Label>
                          <Input id="routing" type="password" placeholder="••••••••" />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting} 
                          className="w-full bg-primary hover:bg-primary/90 h-12 text-lg font-bold"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                          Finish Registration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </form>
            </Tabs>
          )}

        </div>
      </main>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
