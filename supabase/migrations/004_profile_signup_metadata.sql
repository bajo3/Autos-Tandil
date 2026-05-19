-- Copia datos del registro de Supabase Auth hacia public.profiles.
-- Idempotente y no destructivo.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, dni, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'dni', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (user_id) do update
  set full_name = case
        when public.profiles.full_name = '' then excluded.full_name
        else public.profiles.full_name
      end,
      dni = case
        when public.profiles.dni = '' then excluded.dni
        else public.profiles.dni
      end,
      phone = case
        when public.profiles.phone = '' then excluded.phone
        else public.profiles.phone
      end;

  return new;
end;
$$;
