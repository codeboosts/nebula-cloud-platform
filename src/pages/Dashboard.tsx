import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  Users,
  HardDrive,
  Shield,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch user's resources and credits
  const { data: credits } = useQuery({
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

  const { data: vpsInstances } = useQuery({
    queryKey: ['vps_instances', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('vps_instances')
        .select('*')
        .eq('user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: databases } = useQuery({
    queryKey: ['managed_databases', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('managed_databases')
        .select('*')
        .eq('user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: storageBuckets } = useQuery({
    queryKey: ['storage_buckets', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('storage_buckets')
        .select('*')
        .eq('user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Calculate totals
  const totalCredits = credits?.reduce((sum, credit) => {
    return sum + (credit.transaction_type === 'purchase' ? parseFloat(String(credit.amount)) : -parseFloat(String(credit.amount)));
  }, 0) || 0;

  const runningVPS = vpsInstances?.filter(instance => instance.status === 'running').length || 0;
  const runningDatabases = databases?.filter(db => db.status === 'running').length || 0;
  const monthlyCost = [
    ...(vpsInstances || []),
    ...(databases || []),
    ...(storageBuckets || [])
  ].reduce((sum, resource) => sum + parseFloat(String(resource.monthly_cost || 0)), 0);

  const quickActions = [
    { title: 'Launch VPS', description: 'Create a new virtual server', icon: Server, href: '/dashboard/vps', color: 'bg-blue-500' },
    { title: 'Create Database', description: 'Deploy managed database', icon: Database, href: '/dashboard/databases', color: 'bg-green-500' },
    { title: 'Buy Credits', description: 'Add credits to your account', icon: CreditCard, href: '/dashboard/credits', color: 'bg-purple-500' },
    { title: 'Setup Security', description: 'Configure security groups', icon: Shield, href: '/dashboard/security', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your cloud infrastructure today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalCredits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalCredits > 50 ? 'Good balance' : 'Consider adding credits'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active VPS</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningVPS}</div>
            <p className="text-xs text-muted-foreground">
              {vpsInstances?.length || 0} total instances
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Databases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningDatabases}</div>
            <p className="text-xs text-muted-foreground">
              {databases?.length || 0} total databases
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Get started with these common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href} className="group">
                <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow/20 bg-gradient-to-br from-card to-muted/20">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Resources */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent VPS Instances */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-primary" />
                <span>Recent VPS Instances</span>
              </CardTitle>
              <CardDescription>Your latest virtual servers</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/vps">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {vpsInstances && vpsInstances.length > 0 ? (
              <div className="space-y-3">
                {vpsInstances.slice(0, 3).map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Server className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{instance.name}</p>
                        <p className="text-sm text-muted-foreground">{instance.instance_type} • {instance.region}</p>
                      </div>
                    </div>
                    <Badge variant={instance.status === 'running' ? 'default' : 'secondary'}>
                      {instance.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No VPS instances yet</p>
                <Button asChild>
                  <Link to="/dashboard/vps">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First VPS
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Databases */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary" />
                <span>Managed Databases</span>
              </CardTitle>
              <CardDescription>Your database instances</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/databases">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {databases && databases.length > 0 ? (
              <div className="space-y-3">
                {databases.slice(0, 3).map((database) => (
                  <div key={database.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{database.name}</p>
                        <p className="text-sm text-muted-foreground">{database.database_type} {database.version}</p>
                      </div>
                    </div>
                    <Badge variant={database.status === 'running' ? 'default' : 'secondary'}>
                      {database.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No databases yet</p>
                <Button asChild>
                  <Link to="/dashboard/databases">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Database
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;