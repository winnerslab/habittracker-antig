alter table public.profiles 
add column if not exists has_seen_onboarding boolean default false;
