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
  Shield, 
  Plus, 
  Trash2, 
  Settings, 
  Globe, 
  Lock,
  Network,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter
} from 'lucide-react';

const SecurityGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });
  const [ruleForm, setRuleForm] = useState({
    security_group_id: '',
    rule_type: 'inbound',
    protocol: 'tcp',
    port_range: '80',
    source_destination: '0.0.0.0/0',
    description: ''
  });

  // Fetch security groups
  const { data: securityGroups, isLoading } = useQuery({
    queryKey: ['security_groups', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('security_groups')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch security group rules
  const { data: securityGroupRules } = useQuery({
    queryKey: ['security_group_rules', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('security_group_rules')
        .select(`
          *,
          security_groups!inner(user_id)
        `)
        .eq('security_groups.user_id', user?.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create security group
  const createGroup = useMutation({
    mutationFn: async (groupData: any) => {
      const { error } = await supabase
        .from('security_groups')
        .insert({
          ...groupData,
          user_id: user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_groups'] });
      setIsCreateGroupOpen(false);
      setGroupForm({ name: '', description: '' });
      toast({ title: 'Security group created', description: 'New security group has been created successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create security group', variant: 'destructive' });
    }
  });

  // Create security group rule
  const createRule = useMutation({
    mutationFn: async (ruleData: any) => {
      const { error } = await supabase
        .from('security_group_rules')
        .insert(ruleData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_group_rules'] });
      setIsCreateRuleOpen(false);
      setRuleForm({
        security_group_id: '',
        rule_type: 'inbound',
        protocol: 'tcp',
        port_range: '80',
        source_destination: '0.0.0.0/0',
        description: ''
      });
      toast({ title: 'Security rule created', description: 'New security rule has been added successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create security rule', variant: 'destructive' });
    }
  });

  // Delete security group
  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      // First delete all rules in the group
      await supabase
        .from('security_group_rules')
        .delete()
        .eq('security_group_id', id);
      
      // Then delete the group
      const { error } = await supabase
        .from('security_groups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_groups'] });
      queryClient.invalidateQueries({ queryKey: ['security_group_rules'] });
      toast({ title: 'Security group deleted', description: 'Security group and its rules have been removed.' });
    }
  });

  // Delete security group rule
  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('security_group_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_group_rules'] });
      toast({ title: 'Security rule deleted', description: 'Security rule has been removed.' });
    }
  });

  const getRulesForGroup = (groupId: string) => {
    return securityGroupRules?.filter(rule => rule.security_group_id === groupId) || [];
  };

  const isRuleSecure = (rule: any) => {
    return !(rule.source_destination === '0.0.0.0/0' && ['22', '3389', '21'].includes(rule.port_range));
  };

  const getProtocolBadgeColor = (protocol: string) => {
    switch (protocol) {
      case 'tcp': return 'bg-blue-500';
      case 'udp': return 'bg-green-500';
      case 'icmp': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRuleTypeBadgeColor = (type: string) => {
    return type === 'inbound' ? 'bg-orange-500' : 'bg-purple-500';
  };

  const SecurityGroupCard = ({ group }: { group: any }) => {
    const rules = getRulesForGroup(group.id);
    const unsecureRules = rules.filter(rule => !isRuleSecure(rule)).length;

    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>{group.description || 'No description'}</CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              {unsecureRules > 0 && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{unsecureRules} insecure</span>
                </Badge>
              )}
              <Badge variant="outline">{rules.length} rules</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span>Security Rules</span>
            </h4>
            {rules.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getRuleTypeBadgeColor(rule.rule_type)} text-white text-xs`}>
                        {rule.rule_type}
                      </Badge>
                      <Badge className={`${getProtocolBadgeColor(rule.protocol)} text-white text-xs`}>
                        {rule.protocol}
                      </Badge>
                      <span className="font-mono">{rule.port_range}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-xs">{rule.source_destination}</span>
                      {!isRuleSecure(rule) && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule.mutate(rule.id)}
                      className="text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">No rules defined</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRuleForm({ ...ruleForm, security_group_id: group.id });
                setIsCreateRuleOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedGroup(group)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteGroup.mutate(group.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
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
          <h1 className="text-3xl font-bold text-foreground">Security Groups</h1>
          <p className="text-muted-foreground">Manage firewall rules and network access control</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Security Rule</DialogTitle>
                <DialogDescription>Add a new rule to a security group</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Security Group</Label>
                  <Select
                    value={ruleForm.security_group_id}
                    onValueChange={(value) => setRuleForm({ ...ruleForm, security_group_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select security group" />
                    </SelectTrigger>
                    <SelectContent>
                      {securityGroups?.map((group) => (
                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rule Type</Label>
                    <Select
                      value={ruleForm.rule_type}
                      onValueChange={(value) => setRuleForm({ ...ruleForm, rule_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Protocol</Label>
                    <Select
                      value={ruleForm.protocol}
                      onValueChange={(value) => setRuleForm({ ...ruleForm, protocol: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                        <SelectItem value="icmp">ICMP</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Port Range</Label>
                    <Input
                      value={ruleForm.port_range}
                      onChange={(e) => setRuleForm({ ...ruleForm, port_range: e.target.value })}
                      placeholder="80, 80-443, or 1-65535"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source/Destination</Label>
                    <Input
                      value={ruleForm.source_destination}
                      onChange={(e) => setRuleForm({ ...ruleForm, source_destination: e.target.value })}
                      placeholder="0.0.0.0/0 or 192.168.1.0/24"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={ruleForm.description}
                    onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                {(ruleForm.source_destination === '0.0.0.0/0' && ['22', '3389', '21'].includes(ruleForm.port_range)) && (
                  <div className="flex items-center space-x-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Warning: This rule allows unrestricted access to a sensitive port
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateRuleOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createRule.mutate(ruleForm)}
                  disabled={!ruleForm.security_group_id || createRule.isPending}
                >
                  {createRule.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Create Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Security Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Security Group</DialogTitle>
                <DialogDescription>Create a new security group to manage network access</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="web-servers"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="Security group for web servers"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createGroup.mutate(groupForm)}
                  disabled={!groupForm.name || createGroup.isPending}
                >
                  {createGroup.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Security Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityGroups?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityGroupRules?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Secure Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {securityGroupRules?.filter(rule => isRuleSecure(rule)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Insecure Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {securityGroupRules?.filter(rule => !isRuleSecure(rule)).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Groups List */}
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
      ) : securityGroups && securityGroups.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {securityGroups.map((group) => (
            <SecurityGroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">No security groups yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first security group to start managing network access and firewall rules.
            </p>
            <Button onClick={() => setIsCreateGroupOpen(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Security Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityGroups;