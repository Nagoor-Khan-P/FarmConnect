
"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Leaf, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login logic
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4 py-20 bg-muted/30">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-headline">Welcome Back</CardTitle>
            <CardDescription>Sign in to your FarmConnect account to continue.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11 text-lg" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-primary font-bold hover:underline">
                  Create Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
