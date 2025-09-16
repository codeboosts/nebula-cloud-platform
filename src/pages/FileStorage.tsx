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
import { 
  HardDrive, 
  Plus, 
  Upload,
  Download,
  Trash2, 
  Settings, 
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  Archive,
  Globe,
  Lock,
  Eye,
  Copy,
  Share,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react';

const FileStorage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateBucketOpen, setIsCreateBucketOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<any>(null);
  const [bucketForm, setBucketForm] = useState({
    name: '',
    public_access: false,
    region: 'us-east-1'
  });

  // Fetch storage buckets
  const { data: storageBuckets, isLoading } = useQuery({
    queryKey: ['storage_buckets', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('storage_buckets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create bucket mutation
  const createBucket = useMutation({
    mutationFn: async (bucketData: any) => {
      const { error } = await supabase
        .from('storage_buckets')
        .insert({
          ...bucketData,
          user_id: user?.id,
          monthly_cost: 5.00, // Base cost for storage
          file_count: 0,
          size_bytes: 0
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage_buckets'] });
      setIsCreateBucketOpen(false);
      setBucketForm({
        name: '',
        public_access: false,
        region: 'us-east-1'
      });
      toast({ title: 'Storage bucket created', description: 'New storage bucket has been created successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create storage bucket', variant: 'destructive' });
    }
  });

  // Delete bucket
  const deleteBucket = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('storage_buckets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage_buckets'] });
      toast({ title: 'Storage bucket deleted', description: 'Storage bucket has been removed.' });
    }
  });

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bucketForm.name.trim()) {
      toast({ title: 'Error', description: 'Bucket name is required', variant: 'destructive' });
      return;
    }
    createBucket.mutate(bucketForm);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return Image;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return Video;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return Music;
      case 'zip':
      case 'rar':
      case '7z':
        return Archive;
      default:
        return File;
    }
  };

  // Mock file data for demonstration
  const mockFiles = [
    {
      id: '1',
      name: 'product-image.jpg',
      size: 2048576,
      type: 'image/jpeg',
      uploaded_at: '2024-01-15T10:30:00Z',
      downloads: 45,
      public_url: 'https://example.com/file1.jpg'
    },
    {
      id: '2',
      name: 'user-manual.pdf',
      size: 5242880,
      type: 'application/pdf',
      uploaded_at: '2024-01-14T15:45:00Z',
      downloads: 12,
      public_url: 'https://example.com/file2.pdf'
    },
    {
      id: '3',
      name: 'backup-data.zip',
      size: 104857600,
      type: 'application/zip',
      uploaded_at: '2024-01-13T09:20:00Z',
      downloads: 3,
      public_url: null
    }
  ];

  const BucketCard = ({ bucket }: { bucket: any }) => {
    const fileCount = bucket.file_count || 0;
    const sizeBytes = bucket.size_bytes || 0;
    
    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{bucket.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>{bucket.region}</span>
                  <span>•</span>
                  <span>{formatFileSize(sizeBytes)}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {bucket.public_access ? (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-muted/20 rounded-lg">
              <div className="font-bold text-lg">{fileCount}</div>
              <div className="text-muted-foreground">Files</div>
            </div>
            <div className="text-center p-2 bg-muted/20 rounded-lg">
              <div className="font-bold text-lg">{formatFileSize(sizeBytes)}</div>
              <div className="text-muted-foreground">Used</div>
            </div>
            <div className="text-center p-2 bg-muted/20 rounded-lg">
              <div className="font-bold text-lg">${parseFloat(String(bucket.monthly_cost || 0)).toFixed(2)}</div>
              <div className="text-muted-foreground">Monthly</div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedBucket(bucket)}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteBucket.mutate(bucket.id)}
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

  const FileCard = ({ file }: { file: any }) => {
    const FileIcon = getFileTypeIcon(file.name);
    
    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted/20 rounded-lg flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {file.downloads} downloads
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              {file.public_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(file.public_url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
          <h1 className="text-3xl font-bold text-foreground">File Storage</h1>
          <p className="text-muted-foreground">Manage your files and storage buckets</p>
        </div>
        <Dialog open={isCreateBucketOpen} onOpenChange={setIsCreateBucketOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Bucket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Storage Bucket</DialogTitle>
              <DialogDescription>Create a new storage bucket for your files</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bucket Name</Label>
                <Input
                  id="name"
                  value={bucketForm.name}
                  onChange={(e) => setBucketForm({ ...bucketForm, name: e.target.value })}
                  placeholder="my-storage-bucket"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={bucketForm.region}
                  onValueChange={(value) => setBucketForm({ ...bucketForm, region: value })}
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="public_access"
                  checked={bucketForm.public_access}
                  onCheckedChange={(checked) => setBucketForm({ ...bucketForm, public_access: checked })}
                />
                <Label htmlFor="public_access" className="text-sm">
                  Enable public access
                </Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateBucketOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBucket.isPending}>
                  {createBucket.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Create Bucket
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
            <CardTitle className="text-sm font-medium">Storage Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageBuckets?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageBuckets?.reduce((sum, bucket) => sum + (bucket.file_count || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(storageBuckets?.reduce((sum, bucket) => sum + (bucket.size_bytes || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${storageBuckets?.reduce((sum, bucket) => sum + parseFloat(String(bucket.monthly_cost || 0)), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="buckets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buckets">Storage Buckets</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Storage Buckets */}
        <TabsContent value="buckets" className="space-y-4">
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
          ) : storageBuckets && storageBuckets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {storageBuckets.map((bucket) => (
                <BucketCard key={bucket.id} bucket={bucket} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="text-center py-12">
                <HardDrive className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">No storage buckets yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first storage bucket to start uploading and managing files.
                </p>
                <Button onClick={() => setIsCreateBucketOpen(true)} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Bucket
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Files */}
        <TabsContent value="files" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <File className="w-5 h-5 text-primary" />
                    <span>Recent Files</span>
                  </CardTitle>
                  <CardDescription>Manage your uploaded files</CardDescription>
                </div>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Storage Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Used Storage</span>
                    <span className="font-medium">
                      {formatFileSize(storageBuckets?.reduce((sum, bucket) => sum + (bucket.size_bytes || 0), 0) || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Storage</span>
                    <span className="font-medium">Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Files</span>
                    <span className="font-medium">
                      {storageBuckets?.reduce((sum, bucket) => sum + (bucket.file_count || 0), 0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>Cost Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Storage Cost</span>
                    <span className="font-medium">
                      ${storageBuckets?.reduce((sum, bucket) => sum + parseFloat(String(bucket.monthly_cost || 0)), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bandwidth Cost</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Request Cost</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Activity Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Storage bucket created</p>
                    <p className="text-xs text-muted-foreground">Today at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">File uploaded successfully</p>
                    <p className="text-xs text-muted-foreground">Yesterday at 4:15 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Storage quota warning</p>
                    <p className="text-xs text-muted-foreground">2 days ago at 9:00 AM</p>
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

export default FileStorage;