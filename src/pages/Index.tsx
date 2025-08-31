import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Cloud, 
  Zap, 
  Shield, 
  Database,
  Server,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading Nebula Cloud...</span>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Server,
      title: "VPS Management",
      description: "Deploy and manage virtual private servers with ease. Scale resources instantly based on your needs."
    },
    {
      icon: Database,
      title: "Managed Databases",
      description: "PostgreSQL, MySQL, MongoDB, and Redis databases fully managed with automated backups and scaling."
    },
    {
      icon: Shield,
      title: "Enterprise Security", 
      description: "Advanced security groups, IAM management, and military-grade encryption for your data protection."
    },
    {
      icon: Cloud,
      title: "File Storage",
      description: "Scalable object storage with CDN integration and automatic geo-replication for global performance."
    },
    {
      icon: Zap,
      title: "CI/CD Pipelines",
      description: "Automated deployment pipelines with GitHub integration and zero-downtime deployments."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Role-based access control and team management features for seamless collaboration."
    }
  ];

  const benefits = [
    "99.9% uptime SLA guarantee",
    "Pay-as-you-go credit system",
    "24/7 expert support",
    "Global data centers",
    "One-click deployments",
    "Enterprise-grade security"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Nebula Cloud
              </h1>
            </div>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-primary hover:opacity-90">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              The <span className="bg-gradient-primary bg-clip-text text-transparent">Future</span> of
              <br />
              Cloud Computing
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Experience AWS-level power with incredible simplicity. Deploy VPS instances, databases, 
              and storage in seconds with our intuitive cloud platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5"
            >
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>100 Free Credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Setup in 2 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything You Need for Modern Cloud Infrastructure
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From simple VPS hosting to complex microservices architecture, 
            we provide all the tools you need to scale your applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow/20 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl lg:text-3xl">
                Why Choose Nebula Cloud?
              </CardTitle>
              <CardDescription className="text-lg">
                Built by developers, for developers. We understand your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Transform Your Infrastructure?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who have already made the switch to simpler, 
            more powerful cloud computing.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:opacity-90 text-lg px-12 py-6"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Nebula Cloud</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Nebula Cloud. Built with Lovable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
