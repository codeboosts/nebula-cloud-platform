import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, Zap, Shield, Database } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Cloud className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Nebula Cloud
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-lg">
              The simplified cloud platform that gives you AWS-level power with incredible ease of use.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Deploy VPS instances, databases, and storage in seconds
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                Military-grade security with advanced IAM and security groups
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Managed Services</h3>
              <p className="text-sm text-muted-foreground">
                Fully managed databases, storage, and CI/CD pipelines
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-semibold">Credit System</h3>
              <p className="text-sm text-muted-foreground">
                Pay only for what you use with our flexible credit system
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-border/50 backdrop-blur-sm bg-card/50">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center space-x-2 lg:hidden mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Nebula Cloud
                </h1>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>🎉 Get <span className="text-accent font-semibold">100 free credits</span> when you sign up!</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;