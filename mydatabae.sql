
 table public.delivery_tasks (
  id uuid not null default gen_random_uuid (),
  task_id text not null,
  title text not null,
  description text null,
  customer_id uuid not null,
  customer_name text not null,
  customer_address text not null,
  customer_phone text not null,
  representative_id text null,
  representative_name text null,
  priority text not null default 'medium'::text,
  status text not null default 'pending'::text,
  estimated_duration text null,
  scheduled_for timestamp with time zone null,
  completed_at timestamp with time zone null,
  total_value numeric(10, 2) null default 0.00,
  currency text null default 'IQD'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  proof_photos jsonb null default '[]'::jsonb,
  start_latitude numeric(10, 8) null,
  start_longitude numeric(11, 8) null,
  start_address text null,
  start_timestamp timestamp with time zone null,
  end_latitude numeric(10, 8) null,
  end_longitude numeric(11, 8) null,
  end_address text null,
  end_timestamp timestamp with time zone null,
  constraint delivery_tasks_pkey primary key (id),
  constraint delivery_tasks_task_id_key unique (task_id),
  constraint delivery_tasks_customer_id_fkey foreign KEY (customer_id) references customers (id),
  constraint delivery_tasks_priority_check check (
    (
      priority = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'urgent'::text
        ]
      )
    )
  ),
  constraint delivery_tasks_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'assigned'::text,
          'in_progress'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_customer_id on public.delivery_tasks using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_representative_id on public.delivery_tasks using btree (representative_id) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_status on public.delivery_tasks using btree (status) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_priority on public.delivery_tasks using btree (priority) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_scheduled_for on public.delivery_tasks using btree (scheduled_for) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_created_at on public.delivery_tasks using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_start_location on public.delivery_tasks using btree (start_latitude, start_longitude) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_end_location on public.delivery_tasks using btree (end_latitude, end_longitude) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_start_timestamp on public.delivery_tasks using btree (start_timestamp) TABLESPACE pg_default;

create index IF not exists idx_delivery_tasks_end_timestamp on public.delivery_tasks using btree (end_timestamp) TABLESPACE pg_default;
 table public.payments (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  payment_method text not null,
  amount numeric(10, 2) not null,
  payment_date timestamp with time zone not null,
  status text not null default 'pending'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_order_id_fkey foreign KEY (order_id) references delivery_tasks (id) on delete CASCADE,
  constraint payments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text,
          'refunded'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_payments_order_id on public.payments using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_payments_status on public.payments using btree (status) TABLESPACE pg_default;

create index IF not exists idx_payments_payment_date on public.payments using btree (payment_date) TABLESPACE pg_default;

create index IF not exists idx_payments_created_at on public.payments using btree (created_at) TABLESPACE pg_default;

create table public.payments (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  payment_method text not null,
  amount numeric(10, 2) not null,
  payment_date timestamp with time zone not null,
  status text not null default 'pending'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_order_id_fkey foreign KEY (order_id) references delivery_tasks (id) on delete CASCADE,
  constraint payments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text,
          'refunded'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_payments_order_id on public.payments using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_payments_status on public.payments using btree (status) TABLESPACE pg_default;

create index IF not exists idx_payments_payment_date on public.payments using btree (payment_date) TABLESPACE pg_default;

create index IF not exists idx_payments_created_at on public.payments using btree (created_at) TABLESPACE pg_default;


create table public.representatives (
  id text not null,
  name text not null,
  email text not null,
  phone text not null,
  address text null,
  license_number text null,
  emergency_contact text null,
  vehicle text null,
  status text not null default 'active'::text,
  coverage_areas text[] null default '{}'::text[],
  transportation_type text not null default 'foot'::text,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint representatives_pkey primary key (id),
  constraint representatives_email_key unique (email),
  constraint representatives_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'inactive'::text,
          'on-route'::text,
          'offline'::text
        ]
      )
    )
  ),
  constraint representatives_transportation_type_check check (
    (
      transportation_type = any (array['foot'::text, 'vehicle'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_representatives_email on public.representatives using btree (email) TABLESPACE pg_default;

create index IF not exists idx_representatives_status on public.representatives using btree (status) TABLESPACE pg_default;

create table public.customers (
  id uuid not null default gen_random_uuid (),
  customer_id text not null,
  name text not null,
  email text not null,
  phone text not null,
  address text not null,
  status text not null default 'active'::text,
  total_orders integer null default 0,
  total_spent numeric(10, 2) null default 0.00,
  last_order_date date null,
  rating numeric(3, 2) null default 0.00,
  preferred_delivery_time text null default 'Flexible'::text,
  avatar_url text null,
  join_date date null default CURRENT_DATE,
  notes text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  visit_status text not null default 'not_visited'::text,
  last_visit_date date null,
  visit_notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint customers_pkey primary key (id),
  constraint customers_customer_id_key unique (customer_id),
  constraint customers_email_key unique (email),
  constraint customers_rating_check check (
    (
      (rating >= (0)::numeric)
      and (rating <= (5)::numeric)
    )
  ),
  constraint customers_status_check check (
    (
      status = any (
        array['active'::text, 'vip'::text, 'inactive'::text]
      )
    )
  ),
  constraint customers_visit_status_check check (
    (
      visit_status = any (array['visited'::text, 'not_visited'::text])
    )
  )
) TABLESPACE pg_default;