-- Fix security warnings by replacing functions with proper search paths

-- First, recreate the update function with proper search path (using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the user handler function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  
  -- Give new users 100 free credits
  INSERT INTO public.credits (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 100.00, 'purchase', 'Welcome bonus - 100 free credits');
  
  RETURN NEW;
END;
$$;