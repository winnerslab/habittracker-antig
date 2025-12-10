-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- HABITS
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  goal integer default 1,
  emoji text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.habits enable row level security;
create policy "Users can view own habits." on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits." on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits." on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits." on public.habits for delete using (auth.uid() = user_id);

-- HABIT COMPLETIONS
create table public.habit_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references public.habits on delete cascade not null,
  completed_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, habit_id, completed_date)
);

alter table public.habit_completions enable row level security;
create policy "Users can view own completions." on public.habit_completions for select using (auth.uid() = user_id);
create policy "Users can insert own completions." on public.habit_completions for insert with check (auth.uid() = user_id);
create policy "Users can delete own completions." on public.habit_completions for delete using (auth.uid() = user_id);

-- HABIT STREAKS
create table public.habit_streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references public.habits on delete cascade not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, habit_id)
);

alter table public.habit_streaks enable row level security;
create policy "Users can view own streaks." on public.habit_streaks for select using (auth.uid() = user_id);
create policy "Users can update own streaks." on public.habit_streaks for update using (auth.uid() = user_id);
create policy "Users can insert own streaks." on public.habit_streaks for insert with check (auth.uid() = user_id);

-- LOGIN STREAKS
create table public.login_streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_login_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id)
);

alter table public.login_streaks enable row level security;
create policy "Users can view own login streaks." on public.login_streaks for select using (auth.uid() = user_id);
create policy "Users can update own login streaks." on public.login_streaks for update using (auth.uid() = user_id);
create policy "Users can insert own login streaks." on public.login_streaks for insert with check (auth.uid() = user_id);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text check (status in ('free', 'active', 'cancelled', 'expired')) default 'free',
  lemonsqueezy_customer_id text,
  lemonsqueezy_subscription_id text,
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_reference text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id)
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscription." on public.subscriptions for select using (auth.uid() = user_id);
-- Only service role can update subscription status reliably via API, but we allow key updates if needed or keep strict.
-- Allowing select for now.

-- HANDLE NEW USER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.subscriptions (user_id, status)
  values (new.id, 'free');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
