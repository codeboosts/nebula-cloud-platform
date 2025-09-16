import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Plus, 
  Power, 
  PowerOff, 
  Trash2, 
  Settings, 
  BarChart3, 
  Copy,
  Download,
  Upload,
  RefreshCw,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  DollarSign
} from 'lucide-react';

const DatabasesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDb, setSelectedDb] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    database_type: 'postgresql',
    version: '15',
    instance_size: 'db.t3.micro',
    storage_gb: 20,
    region: 'us-east-1'
  });

  // Fetch databases
  const { data: databases, isLoading } = useQuery({
    queryKey: ['managed_databases', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('managed_databases')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create database mutation
  const createDatabase = useMutation({
    mutationFn: async (dbData: any) => {
      const instanceSizes: Record<string, number> = {
        'db.t3.micro': 9.99,
        'db.t3.small': 19.99,
        'db.t3.medium': 39.99,
        'db.t3.large': 79.99,
        'db.t3.xlarge': 159.99
      };

      const { error } = await supabase
        .from('managed_databases')
        .insert({
          ...dbData,
          user_id: user?.id,
          monthly_cost: instanceSizes[dbData.instance_size] || 9.99,
          status: 'creating'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_databases'] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        database_type: 'postgresql',
        version: '15',
        instance_size: 'db.t3.micro',
        storage_gb: 20,
        region: 'us-east-1'
      });
      toast({ title: 'Database creation started', description: 'Your database is being provisioned.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to create database', variant: 'destructive' });
    }
  });

  // Update database status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('managed_databases')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_databases'] });
    }
  });

  // Delete database
  const deleteDatabase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('managed_databases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_databases'] });
      toast({ title: 'Database deleted', description: 'Database has been successfully removed.' });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success text-success-foreground';
      case 'creating': return 'bg-warning text-warning-foreground';
      case 'stopped': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast({ title: 'Error', description: 'Database name is required', variant: 'destructive' });
      return;
    }
    createDatabase.mutate(createForm);
  };

  const DatabaseCard = ({ db }: { db: any }) => (
    <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg">{db.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>{db.database_type} {db.version}</span>
                <span>•</span>
                <span>{db.instance_size}</span>
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(db.status)}>{db.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span>{db.storage_gb} GB Storage</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>${parseFloat(String(db.monthly_cost)).toFixed(2)}/mo</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span>{db.region}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(db.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {db.connection_string && (
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection String</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(db.connection_string)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <code className="text-xs text-muted-foreground break-all">
              {db.connection_string.replace(/password=[^;]*/g, 'password=***')}
            </code>
          </div>
        )}

        <div className="flex space-x-2">
          {db.status === 'running' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus.mutate({ id: db.id, status: 'stopped' })}
            >
              <PowerOff className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : db.status === 'stopped' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus.mutate({ id: db.id, status: 'running' })}
            >
              <Power className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => setSelectedDb(db)}>
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteDatabase.mutate(db.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Management</h1>
          <p className="text-muted-foreground">Manage your database instances and configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Database
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Database</DialogTitle>
              <DialogDescription>
                Configure and deploy a new managed database instance
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDatabase} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Database Name</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="my-database"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database_type">Database Type</Label>
                  <Select
                    value={createForm.database_type}
                    onValueChange={(value) => setCreateForm({ ...createForm, database_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Select
                    value={createForm.version}
                    onValueChange={(value) => setCreateForm({ ...createForm, version: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {createForm.database_type === 'postgresql' && (
                        <>
                          <SelectItem value="15">PostgreSQL 15</SelectItem>
                          <SelectItem value="14">PostgreSQL 14</SelectItem>
                          <SelectItem value="13">PostgreSQL 13</SelectItem>
                        </>
                      )}
                      {createForm.database_type === 'mysql' && (
                        <>
                          <SelectItem value="8.0">MySQL 8.0</SelectItem>
                          <SelectItem value="5.7">MySQL 5.7</SelectItem>
                        </>
                      )}
                      {createForm.database_type === 'mongodb' && (
                        <>
                          <SelectItem value="7.0">MongoDB 7.0</SelectItem>
                          <SelectItem value="6.0">MongoDB 6.0</SelectItem>
                        </>
                      )}
                      {createForm.database_type === 'redis' && (
                        <>
                          <SelectItem value="7.2">Redis 7.2</SelectItem>
                          <SelectItem value="6.2">Redis 6.2</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instance_size">Instance Size</Label>
                  <Select
                    value={createForm.instance_size}
                    onValueChange={(value) => setCreateForm({ ...createForm, instance_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="db.t3.micro">db.t3.micro - $9.99/mo</SelectItem>
                      <SelectItem value="db.t3.small">db.t3.small - $19.99/mo</SelectItem>
                      <SelectItem value="db.t3.medium">db.t3.medium - $39.99/mo</SelectItem>
                      <SelectItem value="db.t3.large">db.t3.large - $79.99/mo</SelectItem>
                      <SelectItem value="db.t3.xlarge">db.t3.xlarge - $159.99/mo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage_gb">Storage (GB)</Label>
                  <Input
                    id="storage_gb"
                    type="number"
                    min="20"
                    max="1000"
                    value={createForm.storage_gb}
                    onChange={(e) => setCreateForm({ ...createForm, storage_gb: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={createForm.region}
                    onValueChange={(value) => setCreateForm({ ...createForm, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDatabase.isPending}>
                  {createDatabase.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Create Database
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Databases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databases?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {databases?.filter(db => db.status === 'running').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${databases?.reduce((sum, db) => sum + parseFloat(String(db.monthly_cost || 0)), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {databases?.reduce((sum, db) => sum + db.storage_gb, 0) || 0} GB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Databases List */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : databases && databases.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {databases.map((db) => (
            <DatabaseCard key={db.id} db={db} />
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="text-center py-12">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">No databases yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first managed database to get started with data storage and analytics.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Database
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabasesManagement;