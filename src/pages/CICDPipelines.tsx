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
  GitBranch, 
  Plus, 
  Play,
  Pause,
  Square,
  Settings, 
  GitCommit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Code,
  Zap,
  Terminal,
  RefreshCw,
  Eye,
  Download,
  ArrowRight,
  Calendar,
  Timer
} from 'lucide-react';

const CICDPipelines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [pipelineForm, setPipelineForm] = useState({
    name: '',
    repository_url: '',
    branch: 'main'
  });

  // Fetch pipelines
  const { data: pipelines, isLoading } = useQuery({
    queryKey: ['pipelines', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('pipelines')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create pipeline mutation
  const createPipeline = useMutation({
    mutationFn: async (pipelineData: any) => {
      const { error } = await supabase
        .from('pipelines')
        .insert({
          ...pipelineData,
          user_id: user?.id,
          status: 'idle'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setIsCreatePipelineOpen(false);
      setPipelineForm({
        name: '',
        repository_url: '',
        branch: 'main'
      });
      toast({ title: 'Pipeline created', description: 'New CI/CD pipeline has been created successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create pipeline', variant: 'destructive' });
    }
  });

  // Update pipeline status
  const updatePipelineStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('pipelines')
        .update({ 
          status, 
          last_run_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    }
  });

  // Delete pipeline
  const deletePipeline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      toast({ title: 'Pipeline deleted', description: 'Pipeline has been removed.' });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success text-success-foreground';
      case 'running': return 'bg-primary text-primary-foreground animate-pulse';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      case 'idle': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'running': return RefreshCw;
      case 'failed': return XCircle;
      case 'cancelled': return Square;
      case 'idle': return Clock;
      default: return Clock;
    }
  };

  const handleCreatePipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineForm.name.trim() || !pipelineForm.repository_url.trim()) {
      toast({ title: 'Error', description: 'Pipeline name and repository URL are required', variant: 'destructive' });
      return;
    }
    createPipeline.mutate(pipelineForm);
  };

  // Mock build data for demonstration
  const mockBuilds = [
    {
      id: '1',
      pipeline_id: 'pipeline-1',
      status: 'success',
      commit: 'a1b2c3d',
      message: 'Fix authentication bug',
      author: 'john.doe@example.com',
      started_at: '2024-01-15T10:30:00Z',
      finished_at: '2024-01-15T10:35:00Z',
      duration: 300
    },
    {
      id: '2',
      pipeline_id: 'pipeline-1',
      status: 'failed',
      commit: 'e4f5g6h',
      message: 'Update dependencies',
      author: 'jane.smith@example.com',
      started_at: '2024-01-15T09:15:00Z',
      finished_at: '2024-01-15T09:22:00Z',
      duration: 420
    },
    {
      id: '3',
      pipeline_id: 'pipeline-1',
      status: 'running',
      commit: 'i7j8k9l',
      message: 'Add new feature',
      author: 'bob.wilson@example.com',
      started_at: '2024-01-15T11:00:00Z',
      finished_at: null,
      duration: null
    }
  ];

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const PipelineCard = ({ pipeline }: { pipeline: any }) => {
    const StatusIcon = getStatusIcon(pipeline.status);
    const recentBuilds = mockBuilds.filter(build => build.pipeline_id === pipeline.id);
    
    return (
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>{pipeline.branch}</span>
                  {pipeline.repository_url && (
                    <>
                      <span>•</span>
                      <a
                        href={pipeline.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Repository
                      </a>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(pipeline.status)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {pipeline.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Created: {new Date(pipeline.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                Last run: {pipeline.last_run_at ? new Date(pipeline.last_run_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>

          {recentBuilds.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Recent Builds</span>
              </h4>
              <div className="space-y-1">
                {recentBuilds.slice(0, 3).map((build) => {
                  const BuildStatusIcon = getStatusIcon(build.status);
                  return (
                    <div key={build.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-xs">
                      <div className="flex items-center space-x-2">
                        <BuildStatusIcon className={`w-3 h-3 ${build.status === 'running' ? 'animate-spin' : ''}`} />
                        <code className="bg-muted/30 px-1 py-0.5 rounded text-xs">{build.commit}</code>
                        <span className="truncate max-w-32">{build.message}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {build.duration ? formatDuration(build.duration) : 'Running...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {pipeline.status === 'idle' || pipeline.status === 'failed' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updatePipelineStatus.mutate({ id: pipeline.id, status: 'running' })}
              >
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
            ) : pipeline.status === 'running' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updatePipelineStatus.mutate({ id: pipeline.id, status: 'cancelled' })}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setSelectedPipeline(pipeline)}>
              <Eye className="w-4 h-4 mr-2" />
              View Logs
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deletePipeline.mutate(pipeline.id)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BuildHistoryItem = ({ build }: { build: any }) => {
    const StatusIcon = getStatusIcon(build.status);
    
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(build.status)}`}>
                <StatusIcon className={`w-5 h-5 ${build.status === 'running' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted/20 px-2 py-1 rounded text-sm">{build.commit}</code>
                  <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                </div>
                <p className="font-medium text-foreground mt-1">{build.message}</p>
                <p className="text-sm text-muted-foreground">by {build.author}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {build.duration ? formatDuration(build.duration) : 'Running...'}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(build.started_at).toLocaleString()}
              </div>
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
          <h1 className="text-3xl font-bold text-foreground">CI/CD Pipelines</h1>
          <p className="text-muted-foreground">Manage continuous integration and deployment pipelines</p>
        </div>
        <Dialog open={isCreatePipelineOpen} onOpenChange={setIsCreatePipelineOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create CI/CD Pipeline</DialogTitle>
              <DialogDescription>Set up a new continuous integration and deployment pipeline</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePipeline} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pipeline Name</Label>
                <Input
                  id="name"
                  value={pipelineForm.name}
                  onChange={(e) => setPipelineForm({ ...pipelineForm, name: e.target.value })}
                  placeholder="my-app-pipeline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repository_url">Repository URL</Label>
                <Input
                  id="repository_url"
                  value={pipelineForm.repository_url}
                  onChange={(e) => setPipelineForm({ ...pipelineForm, repository_url: e.target.value })}
                  placeholder="https://github.com/username/repo.git"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={pipelineForm.branch}
                  onValueChange={(value) => setPipelineForm({ ...pipelineForm, branch: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="master">master</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreatePipelineOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPipeline.isPending}>
                  {createPipeline.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Create Pipeline
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
            <CardTitle className="text-sm font-medium">Total Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Builds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {pipelines?.filter(p => p.status === 'running').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockBuilds.length > 0 ? Math.round((mockBuilds.filter(b => b.status === 'success').length / mockBuilds.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Build Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(
                mockBuilds.filter(b => b.duration).reduce((sum, b) => sum + (b.duration || 0), 0) / 
                mockBuilds.filter(b => b.duration).length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipelines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="builds">Build History</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        {/* Pipelines */}
        <TabsContent value="pipelines" className="space-y-4">
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
          ) : pipelines && pipelines.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {pipelines.map((pipeline) => (
                <PipelineCard key={pipeline.id} pipeline={pipeline} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="text-center py-12">
                <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">No pipelines yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first CI/CD pipeline to automate your build and deployment process.
                </p>
                <Button onClick={() => setIsCreatePipelineOpen(true)} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Pipeline
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Build History */}
        <TabsContent value="builds" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Build History</span>
                  </CardTitle>
                  <CardDescription>Recent build executions across all pipelines</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBuilds.map((build) => (
                  <BuildHistoryItem key={build.id} build={build} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployments */}
        <TabsContent value="deployments" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Deployment Status</span>
              </CardTitle>
              <CardDescription>Monitor your application deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Production</h4>
                          <p className="text-sm text-muted-foreground">my-app.com</p>
                        </div>
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Deployed
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <code className="bg-muted/20 px-1 py-0.5 rounded text-xs">v2.1.0</code>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">Deployed:</span>
                          <span>2 hours ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Staging</h4>
                          <p className="text-sm text-muted-foreground">staging.my-app.com</p>
                        </div>
                        <Badge className="bg-warning text-warning-foreground">
                          <Timer className="w-3 h-3 mr-1" />
                          Deploying
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <code className="bg-muted/20 px-1 py-0.5 rounded text-xs">v2.2.0-rc1</code>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">Started:</span>
                          <span>5 minutes ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Deployment Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Build</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Test</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <span className="text-sm font-medium">Deploy</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-30" />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Verify</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CICDPipelines;