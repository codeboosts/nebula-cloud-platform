import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Server, 
  Plus, 
  Play, 
  Square, 
  Trash2, 
  Monitor, 
  Cpu, 
  HardDrive,
  DollarSign,
  Clock,
  MapPin
} from 'lucide-react';

interface VPSInstance {
  id: string;
  name: string;
  instance_type: string;
  cpu_cores: number;
  ram_gb: number;
  storage_gb: number;
  status: string;
  region: string;
  image: string;
  ip_address: string | null;
  monthly_cost: number;
  created_at: string;
}

const instanceTypes = [
  { id: 'nano', name: 'Nano', cpu: 1, ram: 1, cost: 5.99 },
  { id: 'micro', name: 'Micro', cpu: 1, ram: 2, cost: 10.99 },
  { id: 'small', name: 'Small', cpu: 2, ram: 4, cost: 20.99 },
  { id: 'medium', name: 'Medium', cpu: 2, ram: 8, cost: 40.99 },
  { id: 'large', name: 'Large', cpu: 4, ram:16, cost: 80.99 },
  { id: 'xlarge', name: 'X-Large', cpu: 8, ram: 32, cost: 160.99 },
];

const regions = [
  { id: 'us-east-1', name: 'US East (Virginia)' },
  { id: 'us-west-2', name: 'US West (Oregon)' },
  { id: 'eu-west-1', name: 'EU (Ireland)' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
];

const images = [
  { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS' },
  { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS' },
  { id: 'centos-8', name: 'CentOS 8' },
  { id: 'debian-11', name: 'Debian 11' },
];

const VPSManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVPS, setNewVPS] = useState({
    name: '',
    instance_type: '',
    region: 'us-east-1',
    image: 'ubuntu-22.04',
    storage_gb: 20
  });

  const { data: vpsInstances, isLoading } = useQuery({
    queryKey: ['vps_instances', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('vps_instances')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data as VPSInstance[];
    },
    enabled: !!user?.id
  });

  const createVPSMutation = useMutation({
    mutationFn: async (vpsData: any) => {
      const selectedType = instanceTypes.find(t => t.id === vpsData.instance_type);
      if (!selectedType) throw new Error('Invalid instance type');

      const { data, error } = await supabase
        .from('vps_instances')
        .insert([{
          user_id: user?.id,
          name: vpsData.name,
          instance_type: vpsData.instance_type,
          cpu_cores: selectedType.cpu,
          ram_gb: selectedType.ram,
          storage_gb: vpsData.storage_gb,
          region: vpsData.region,
          image: vpsData.image,
          monthly_cost: selectedType.cost,
          status: 'stopped',
          ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "VPS Created",
        description: "Your VPS instance has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['vps_instances'] });
      setIsCreateDialogOpen(false);
      setNewVPS({ name: '', instance_type: '', region: 'us-east-1', image: 'ubuntu-22.04', storage_gb: 20 });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateVPSStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('vps_instances')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vps_instances'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteVPSMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vps_instances')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "VPS Deleted",
        description: "VPS instance has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['vps_instances'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success text-success-foreground';
      case 'stopped': return 'bg-destructive text-destructive-foreground';
      case 'starting': return 'bg-warning text-warning-foreground';
      case 'stopping': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VPS Management</h1>
          <p className="text-muted-foreground">Manage your virtual private servers</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create VPS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New VPS Instance</DialogTitle>
              <DialogDescription>
                Configure your virtual private server settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vps-name">Instance Name</Label>
                  <Input
                    id="vps-name"
                    placeholder="my-web-server"
                    value={newVPS.name}
                    onChange={(e) => setNewVPS({ ...newVPS, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Instance Type</Label>
                  <Select value={newVPS.instance_type} onValueChange={(value) => setNewVPS({ ...newVPS, instance_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {instanceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - {type.cpu} vCPU, {type.ram}GB RAM (${type.cost}/mo)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={newVPS.region} onValueChange={(value) => setNewVPS({ ...newVPS, region: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Operating System</Label>
                  <Select value={newVPS.image} onValueChange={(value) => setNewVPS({ ...newVPS, image: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {images.map((image) => (
                        <SelectItem key={image.id} value={image.id}>
                          {image.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  type="number"
                  min="20"
                  max="1000"
                  value={newVPS.storage_gb}
                  onChange={(e) => setNewVPS({ ...newVPS, storage_gb: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createVPSMutation.mutate(newVPS)}
                  disabled={!newVPS.name || !newVPS.instance_type || createVPSMutation.isPending}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {createVPSMutation.isPending ? 'Creating...' : 'Create VPS'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your VPS instances...</p>
          </div>
        </div>
      ) : !vpsInstances || vpsInstances.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No VPS Instances</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create your first virtual private server to start building your cloud infrastructure.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First VPS
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vpsInstances.map((instance) => (
            <Card key={instance.id} className="border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Server className="w-5 h-5 text-primary" />
                    <span>{instance.name}</span>
                  </CardTitle>
                  <Badge className={getStatusColor(instance.status)}>
                    {instance.status}
                  </Badge>
                </div>
                <CardDescription>{instance.instance_type} • {instance.region}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span>{instance.cpu_cores} vCPU</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span>{instance.ram_gb}GB RAM</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span>{instance.storage_gb}GB SSD</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>${instance.monthly_cost}/mo</span>
                  </div>
                </div>

                {instance.ip_address && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">IP Address:</p>
                    <p className="text-sm text-muted-foreground font-mono">{instance.ip_address}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {instance.status === 'stopped' && (
                    <Button
                      size="sm"
                      onClick={() => updateVPSStatusMutation.mutate({ id: instance.id, status: 'running' })}
                      disabled={updateVPSStatusMutation.isPending}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {instance.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateVPSStatusMutation.mutate({ id: instance.id, status: 'stopped' })}
                      disabled={updateVPSStatusMutation.isPending}
                      className="flex-1"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteVPSMutation.mutate(instance.id)}
                    disabled={deleteVPSMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VPSManagement;