import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Receipt,
  Download,
  Wallet,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const CreditsBilling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState(25);

  // Fetch credits
  const { data: credits, isLoading } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch resource costs for billing overview
  const { data: vpsInstances } = useQuery({
    queryKey: ['vps_instances_billing', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('vps_instances')
        .select('name, monthly_cost, status')
        .eq('user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: databases } = useQuery({
    queryKey: ['databases_billing', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('managed_databases')
        .select('name, monthly_cost, status')
        .eq('user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: storageBuckets } = useQuery({
    queryKey: ['storage_billing', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('storage_buckets')
        .select('name, monthly_cost')
        .eq('user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Purchase credits mutation
  const purchaseCredits = useMutation({
    mutationFn: async (amount: number) => {
      // In a real app, this would integrate with a payment processor
      const { error } = await supabase
        .from('credits')
        .insert({
          user_id: user?.id,
          amount: amount,
          transaction_type: 'purchase',
          description: `Credit purchase - $${amount.toFixed(2)}`
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      setIsBuyCreditsOpen(false);
      toast({ title: 'Credits purchased', description: 'Credits have been added to your account.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to purchase credits', variant: 'destructive' });
    }
  });

  // Calculate totals
  const totalCredits = credits?.reduce((sum, credit) => {
    return sum + (credit.transaction_type === 'purchase' ? parseFloat(String(credit.amount)) : -parseFloat(String(credit.amount)));
  }, 0) || 0;

  const monthlySpend = [
    ...(vpsInstances || []),
    ...(databases || []),
    ...(storageBuckets || [])
  ].reduce((sum, resource) => sum + parseFloat(String(resource.monthly_cost || 0)), 0);

  const creditPackages = [
    { amount: 25, bonus: 0, popular: false },
    { amount: 50, bonus: 5, popular: false },
    { amount: 100, bonus: 15, popular: true },
    { amount: 250, bonus: 50, popular: false },
    { amount: 500, bonus: 125, popular: false },
  ];

  const getTransactionIcon = (type: string) => {
    return type === 'purchase' ? (
      <ArrowUpRight className="w-4 h-4 text-success" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-destructive" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'purchase' ? 'text-success' : 'text-destructive';
  };

  const BillingOverviewCard = ({ title, resources, icon: Icon, color }: { 
    title: string; 
    resources: any[]; 
    icon: any; 
    color: string;
  }) => {
    const totalCost = resources.reduce((sum, resource) => sum + parseFloat(String(resource.monthly_cost || 0)), 0);
    const activeResources = resources.filter(r => r.status === 'running').length;

    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
            <Badge variant="outline">{resources.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}/mo</div>
            <p className="text-sm text-muted-foreground">{activeResources} active resources</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Credits & Billing</h1>
          <p className="text-muted-foreground">Manage your account credits and billing information</p>
        </div>
        <Dialog open={isBuyCreditsOpen} onOpenChange={setIsBuyCreditsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase Credits</DialogTitle>
              <DialogDescription>
                Add credits to your account for cloud resources and services
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.amount}
                    className={`cursor-pointer border-2 transition-all duration-200 ${
                      creditAmount === pkg.amount + pkg.bonus 
                        ? 'border-primary shadow-glow/20' 
                        : 'border-border/50 hover:border-primary/50'
                    } ${pkg.popular ? 'ring-2 ring-primary/20' : ''}`}
                    onClick={() => setCreditAmount(pkg.amount + pkg.bonus)}
                  >
                    {pkg.popular && (
                      <div className="bg-gradient-primary text-primary-foreground text-xs font-medium text-center py-1 rounded-t-lg">
                        Most Popular
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-bold">${pkg.amount}</div>
                        {pkg.bonus > 0 && (
                          <div className="text-sm text-success">+${pkg.bonus} bonus</div>
                        )}
                        <div className="text-lg font-semibold text-primary">
                          ${pkg.amount + pkg.bonus} credits
                        </div>
                        {pkg.bonus > 0 && (
                          <Badge className="bg-success/10 text-success">
                            {Math.round((pkg.bonus / pkg.amount) * 100)}% bonus
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <span className="font-medium">Total Credits</span>
                  <span className="text-xl font-bold text-primary">${creditAmount.toFixed(2)}</span>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Credits never expire</p>
                  <p>• Use credits for any cloud resources</p>
                  <p>• Secure payment processing</p>
                  <p>• Instant credit activation</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBuyCreditsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => purchaseCredits.mutate(creditAmount)}
                disabled={purchaseCredits.isPending}
                className="bg-gradient-primary"
              >
                {purchaseCredits.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Purchase ${creditAmount.toFixed(2)} Credits
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Credit Balance & Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Available Credits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${totalCredits.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">
              {totalCredits > 100 ? 'Excellent balance' : 
               totalCredits > 25 ? 'Good balance' : 
               'Consider adding credits'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Monthly Spend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlySpend.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Estimated monthly cost</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Receipt className="w-4 h-4" />
              <span>Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Runway</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlySpend > 0 ? Math.floor(totalCredits / monthlySpend) : '∞'} 
              <span className="text-sm font-normal"> months</span>
            </div>
            <p className="text-sm text-muted-foreground">At current usage</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="billing">Billing Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        </TabsList>

        {/* Transaction History */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <span>Transaction History</span>
                  </CardTitle>
                  <CardDescription>All credit transactions and usage</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {credits && credits.length > 0 ? (
                <div className="space-y-3">
                  {credits.slice(0, 10).map((credit) => (
                    <div key={credit.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted/20 rounded-lg flex items-center justify-center">
                          {getTransactionIcon(credit.transaction_type)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{credit.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(credit.created_at).toLocaleDateString()} at{' '}
                            {new Date(credit.created_at).toLocaleTimeString()}
                          </p>
                          {credit.service_type && (
                            <Badge variant="outline" className="mt-1">
                              {credit.service_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`text-right ${getTransactionColor(credit.transaction_type)}`}>
                        <div className="text-lg font-bold">
                          {credit.transaction_type === 'purchase' ? '+' : '-'}${parseFloat(String(credit.amount)).toFixed(2)}
                        </div>
                        <Badge 
                          variant={credit.transaction_type === 'purchase' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {credit.transaction_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Overview */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <BillingOverviewCard
              title="VPS Instances"
              resources={vpsInstances || []}
              icon={Zap}
              color="bg-blue-500"
            />
            <BillingOverviewCard
              title="Databases"
              resources={databases || []}
              icon={Receipt}
              color="bg-green-500"
            />
            <BillingOverviewCard
              title="Storage"
              resources={storageBuckets || []}
              icon={Wallet}
              color="bg-purple-500"
            />
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Cost Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vpsInstances?.filter(vps => parseFloat(String(vps.monthly_cost || 0)) > 0).map((vps, index) => (
                  <div key={`vps-${index}`} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{vps.name}</p>
                        <p className="text-sm text-muted-foreground">VPS Instance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${parseFloat(String(vps.monthly_cost)).toFixed(2)}/mo</div>
                      <Badge variant={vps.status === 'running' ? 'default' : 'secondary'}>
                        {vps.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {databases?.filter(db => parseFloat(String(db.monthly_cost || 0)) > 0).map((db, index) => (
                  <div key={`db-${index}`} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{db.name}</p>
                        <p className="text-sm text-muted-foreground">Database</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${parseFloat(String(db.monthly_cost)).toFixed(2)}/mo</div>
                      <Badge variant={db.status === 'running' ? 'default' : 'secondary'}>
                        {db.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {(!vpsInstances?.length && !databases?.length) && (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No billable resources yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Analytics */}
        <TabsContent value="usage" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Usage Analytics</span>
              </CardTitle>
              <CardDescription>Credit usage patterns and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Credit Usage Trends</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Month</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Monthly</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Resource Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VPS Instances</span>
                      <span className="font-medium">
                        {vpsInstances?.length || 0} ({Math.round((vpsInstances?.reduce((sum, vps) => sum + parseFloat(String(vps.monthly_cost || 0)), 0) || 0) / monthlySpend * 100) || 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Databases</span>
                      <span className="font-medium">
                        {databases?.length || 0} ({Math.round((databases?.reduce((sum, db) => sum + parseFloat(String(db.monthly_cost || 0)), 0) || 0) / monthlySpend * 100) || 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage</span>
                      <span className="font-medium">
                        {storageBuckets?.length || 0} ({Math.round((storageBuckets?.reduce((sum, bucket) => sum + parseFloat(String(bucket.monthly_cost || 0)), 0) || 0) / monthlySpend * 100) || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditsBilling;