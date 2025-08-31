-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credits table for billing system
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
  description TEXT NOT NULL,
  service_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create VPS instances table
CREATE TABLE public.vps_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instance_type TEXT NOT NULL,
  cpu_cores INTEGER NOT NULL,
  ram_gb INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'starting', 'stopping', 'terminated')),
  region TEXT NOT NULL DEFAULT 'us-east-1',
  image TEXT NOT NULL DEFAULT 'ubuntu-20.04',
  ip_address INET,
  monthly_cost DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create managed databases table
CREATE TABLE public.managed_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  database_type TEXT NOT NULL CHECK (database_type IN ('postgresql', 'mysql', 'mongodb', 'redis')),
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'running', 'stopped', 'error', 'deleting')),
  region TEXT NOT NULL DEFAULT 'us-east-1',
  instance_size TEXT NOT NULL DEFAULT 'db.t3.micro',
  storage_gb INTEGER NOT NULL DEFAULT 20,
  connection_string TEXT,
  monthly_cost DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security groups table
CREATE TABLE public.security_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security group rules table
CREATE TABLE public.security_group_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  security_group_id UUID NOT NULL REFERENCES public.security_groups(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('inbound', 'outbound')),
  protocol TEXT NOT NULL CHECK (protocol IN ('tcp', 'udp', 'icmp')),
  port_range TEXT NOT NULL,
  source_destination TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage buckets table
CREATE TABLE public.storage_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  public_access BOOLEAN NOT NULL DEFAULT false,
  size_bytes BIGINT DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  monthly_cost DECIMAL(8,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  service_type TEXT,
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CI/CD pipelines table
CREATE TABLE public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  repository_url TEXT,
  branch TEXT DEFAULT 'main',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'success', 'failed', 'cancelled')),
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vps_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managed_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_group_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for credits
CREATE POLICY "Users can view their own credits" ON public.credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credit records" ON public.credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for VPS instances
CREATE POLICY "Users can manage their own VPS instances" ON public.vps_instances FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for managed databases
CREATE POLICY "Users can manage their own databases" ON public.managed_databases FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for security groups
CREATE POLICY "Users can manage their own security groups" ON public.security_groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own security group rules" ON public.security_group_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.security_groups WHERE id = security_group_id AND user_id = auth.uid())
);

-- Create RLS policies for storage buckets
CREATE POLICY "Users can manage their own storage buckets" ON public.storage_buckets FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for pipelines
CREATE POLICY "Users can manage their own pipelines" ON public.pipelines FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vps_instances_updated_at BEFORE UPDATE ON public.vps_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_managed_databases_updated_at BEFORE UPDATE ON public.managed_databases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_groups_updated_at BEFORE UPDATE ON public.security_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_storage_buckets_updated_at BEFORE UPDATE ON public.storage_buckets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  
  -- Give new users 100 free credits
  INSERT INTO public.credits (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 100.00, 'purchase', 'Welcome bonus - 100 free credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();