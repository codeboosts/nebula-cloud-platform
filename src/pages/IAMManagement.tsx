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
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  UserPlus,
  Shield, 
  Key,
  Settings,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Crown,
  User,
  Lock,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Building,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const IAMManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    bio: '',
    company: ''
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (profileData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditProfileOpen(false);
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  });

  // Initialize form with current profile data
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        company: profile.company || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  };

  // Mock data for team members (in a real app, this would be from a team/organization table)
  const teamMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      last_active: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Developer',
      status: 'active',
      last_active: '2024-01-14T15:45:00Z',
      created_at: '2024-01-05T00:00:00Z'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'Viewer',
      status: 'inactive',
      last_active: '2024-01-10T09:20:00Z',
      created_at: '2024-01-10T00:00:00Z'
    }
  ];

  // Mock API keys data
  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'neb_prod_1a2b3c4d5e6f7g8h9i0j',
      created_at: '2024-01-01T00:00:00Z',
      last_used: '2024-01-15T14:30:00Z',
      permissions: ['read:all', 'write:vps', 'write:database']
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'neb_dev_k1l2m3n4o5p6q7r8s9t0',
      created_at: '2024-01-10T00:00:00Z',
      last_used: null,
      permissions: ['read:all']
    }
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'developer': return 'bg-primary text-primary-foreground';
      case 'viewer': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground';
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return Crown;
      case 'developer': return User;
      case 'viewer': return Eye;
      default: return User;
    }
  };

  const TeamMemberCard = ({ member }: { member: any }) => {
    const RoleIcon = getRoleIcon(member.role);
    
    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <RoleIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                  <Badge className={getStatusBadgeColor(member.status)}>{member.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Last active:</span>
              <span>{member.last_active ? new Date(member.last_active).toLocaleDateString() : 'Never'}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Joined:</span>
              <span>{new Date(member.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ApiKeyCard = ({ apiKey }: { apiKey: any }) => {
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    
    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-xs bg-muted/20 px-2 py-1 rounded font-mono">
                    {isKeyVisible ? apiKey.key : '•'.repeat(apiKey.key.length - 8) + apiKey.key.slice(-8)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                    className="h-6 w-6 p-0"
                  >
                    {isKeyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {apiKey.permissions.map((permission: string) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(apiKey.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Last used:</span>
              <span>{apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : 'Never'}</span>
            </div>
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
          <h1 className="text-3xl font-bold text-foreground">IAM Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and access permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Key className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-sm text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-sm text-muted-foreground">
              {apiKeys.filter(k => k.last_used).length} recently used
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.role === 'Admin').length}
            </div>
            <p className="text-sm text-muted-foreground">Administrative access</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">85%</div>
            <p className="text-sm text-muted-foreground">Good security posture</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="users">Team Members</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* My Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>Manage your account details and preferences</CardDescription>
                </div>
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Update your profile information</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          value={profileForm.display_name}
                          onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                          placeholder="Your display name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileForm.company}
                          onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                          placeholder="Your company"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateProfile.isPending}>
                          {updateProfile.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{profile?.display_name || 'No display name'}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      {profile?.company && (
                        <p className="text-sm text-muted-foreground flex items-center space-x-1 mt-1">
                          <Building className="w-4 h-4" />
                          <span>{profile.company}</span>
                        </p>
                      )}
                      {profile?.bio && (
                        <p className="text-sm mt-2">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Account Information</span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account created:</span>
                          <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last updated:</span>
                          <span>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">User ID:</span>
                          <code className="text-xs bg-muted/20 px-1 py-0.5 rounded">{user?.id}</code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Security</span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Email verified:</span>
                          <Badge className="bg-success/10 text-success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">2FA enabled:</span>
                          <Badge variant="outline">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not configured
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Team Members</span>
                  </CardTitle>
                  <CardDescription>Manage your team members and their access levels</CardDescription>
                </div>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {teamMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="apikeys" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-primary" />
                    <span>API Keys</span>
                  </CardTitle>
                  <CardDescription>Manage API keys for programmatic access</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-primary" />
                <span>Permission Management</span>
              </CardTitle>
              <CardDescription>Configure roles and permissions for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {['Admin', 'Developer', 'Viewer'].map((role) => (
                    <Card key={role} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 ${getRoleBadgeColor(role)} rounded-lg flex items-center justify-center`}>
                            {React.createElement(getRoleIcon(role), { className: "w-4 h-4 text-white" })}
                          </div>
                          <CardTitle className="text-lg">{role}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Permissions:</h4>
                          <div className="space-y-1 text-sm">
                            {role === 'Admin' && (
                              <>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span>Full access to all resources</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span>User management</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span>Billing management</span>
                                </div>
                              </>
                            )}
                            {role === 'Developer' && (
                              <>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span>Create and manage resources</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span>API key management</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <XCircle className="w-3 h-3 text-muted-foreground" />
                                  <span>Billing access</span>
                                </div>
                              </>
                            )}
                            {role === 'Viewer' && (
                              <>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-3 h-3 text-success" />
                                  <span>Read-only access</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <XCircle className="w-3 h-3 text-muted-foreground" />
                                  <span>Resource creation</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <XCircle className="w-3 h-3 text-muted-foreground" />
                                  <span>Billing access</span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="pt-2">
                            <Badge variant="outline" className="text-xs">
                              {teamMembers.filter(m => m.role === role).length} members
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning">Permission Changes</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Changes to user permissions take effect immediately. Be careful when modifying admin access.
                      </p>
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

export default IAMManagement;