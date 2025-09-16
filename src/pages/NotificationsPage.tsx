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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Plus, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Server,
  Database,
  HardDrive,
  CreditCard,
  Users,
  GitBranch,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Mail,
  Smartphone,
  Slack,
  MessageSquare
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'All notifications marked as read' });
    }
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Notification deleted' });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getServiceIcon = (serviceType: string | null) => {
    switch (serviceType) {
      case 'vps': return Server;
      case 'database': return Database;
      case 'storage': return HardDrive;
      case 'security': return Shield;
      case 'billing': return CreditCard;
      case 'iam': return Users;
      case 'pipeline': return GitBranch;
      default: return Bell;
    }
  };

  const filteredNotifications = notifications?.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !notification.read) ||
                         (selectedFilter === 'read' && notification.read) ||
                         notification.type === selectedFilter ||
                         notification.service_type === selectedFilter;
    
    const matchesSearch = searchQuery === '' || 
                         notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      types: {
        security: true,
        billing: true,
        system: false,
        updates: false
      }
    },
    push: {
      enabled: false,
      types: {
        security: true,
        billing: false,
        system: false,
        updates: false
      }
    },
    slack: {
      enabled: false,
      webhook: '',
      types: {
        security: true,
        billing: true,
        system: false,
        updates: false
      }
    }
  });

  const NotificationCard = ({ notification }: { notification: any }) => {
    const NotificationIcon = getNotificationIcon(notification.type);
    const ServiceIcon = getServiceIcon(notification.service_type);
    
    return (
      <Card className={`border-border/50 transition-all duration-300 hover:border-primary/30 ${
        !notification.read ? 'bg-primary/5' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${notification.type === 'success' ? 'success' : notification.type === 'warning' ? 'warning' : notification.type === 'error' ? 'destructive' : 'primary'}/10`}>
                  <NotificationIcon className={`w-5 h-5 ${getNotificationColor(notification.type)}`} />
                </div>
                {notification.service_type && (
                  <div className="w-6 h-6 bg-muted/20 rounded flex items-center justify-center">
                    <ServiceIcon className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                  {notification.service_type && (
                    <Badge variant="outline" className="text-xs">
                      {notification.service_type}
                    </Badge>
                  )}
                  <Badge 
                    variant={notification.type === 'success' ? 'default' : 
                           notification.type === 'warning' ? 'secondary' :
                           notification.type === 'error' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {notification.type}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead.mutate(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNotification.mutate(notification.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your cloud infrastructure alerts</p>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Mark All Read
            </Button>
          )}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>Configure how you receive notifications</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="email" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="push">Push</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={notificationSettings.email.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, enabled: checked }
                      }))}
                    />
                    <Mail className="w-4 h-4" />
                    <Label>Email notifications</Label>
                  </div>
                  <div className="space-y-3 ml-6">
                    {Object.entries(notificationSettings.email.types).map(([type, enabled]) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            email: {
                              ...prev.email,
                              types: { ...prev.email.types, [type]: checked }
                            }
                          }))}
                          disabled={!notificationSettings.email.enabled}
                        />
                        <Label className="capitalize">{type} alerts</Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="push" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={notificationSettings.push.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        push: { ...prev.push, enabled: checked }
                      }))}
                    />
                    <Smartphone className="w-4 h-4" />
                    <Label>Push notifications</Label>
                  </div>
                  <div className="space-y-3 ml-6">
                    {Object.entries(notificationSettings.push.types).map(([type, enabled]) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            push: {
                              ...prev.push,
                              types: { ...prev.push.types, [type]: checked }
                            }
                          }))}
                          disabled={!notificationSettings.push.enabled}
                        />
                        <Label className="capitalize">{type} alerts</Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="integrations" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.slack.enabled}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({
                          ...prev,
                          slack: { ...prev.slack, enabled: checked }
                        }))}
                      />
                      <MessageSquare className="w-4 h-4" />
                      <Label>Slack integration</Label>
                    </div>
                    {notificationSettings.slack.enabled && (
                      <div className="ml-6 space-y-2">
                        <Label>Webhook URL</Label>
                        <Input
                          placeholder="https://hooks.slack.com/services/..."
                          value={notificationSettings.slack.webhook}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            slack: { ...prev.slack, webhook: e.target.value }
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsSettingsOpen(false)}>
                  Save Settings
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
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {notifications?.filter(n => n.type === 'error').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications?.filter(n => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(n.created_at) > weekAgo;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="vps">VPS</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredNotifications.length} of {notifications?.length || 0} notifications
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <Card className="border-border/50">
          <CardContent className="text-center py-12">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">No notifications match your filter</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search query or filter settings.
            </p>
            <Button variant="outline" onClick={() => {
              setSelectedFilter('all');
              setSearchQuery('');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground mb-6">
              You'll receive notifications here about your cloud infrastructure, security alerts, and account updates.
            </p>
            <Button onClick={() => setIsSettingsOpen(true)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure Notifications
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;