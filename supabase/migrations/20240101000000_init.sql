-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique,
  phone text unique,
  full_name text,
  role text not null default 'buyer' check (role in ('buyer', 'vendor', 'admin')),
  created_at timestamptz default now()
);

-- Vendors table
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade unique,
  business_name text not null,
  gst_number text,
  address text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_note text,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Vendor service pincodes
create table public.vendor_pincodes (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  pincode text not null,
  area_name text,
  unique(vendor_id, pincode)
);

-- Material categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text
);

-- Materials within categories
create table public.materials (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  unit text not null check (unit in ('kg', 'tonne', 'bag', 'piece', 'sqft', 'metre', 'litre', 'm³', 'cft')),
  description text
);

-- Vendor price listings
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  material_id uuid references public.materials(id) on delete cascade,
  pincode text not null,
  price_per_unit numeric(10,2) not null,
  in_stock boolean default true,
  image_url text,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(vendor_id, material_id, pincode)
);

-- Vendor documents for approval
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  doc_type text not null check (doc_type in ('gst', 'pan', 'trade_licence')),
  storage_path text not null,
  uploaded_at timestamptz default now()
);

-- Buyer enquiries to vendors
create table public.enquiries (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'responded', 'closed')),
  created_at timestamptz default now()
);

-- Buyer saved vendors
create table public.saved_vendors (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  saved_at timestamptz default now(),
  unique(buyer_id, vendor_id)
);

-- RLS
alter table public.users enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_pincodes enable row level security;
alter table public.categories enable row level security;
alter table public.materials enable row level security;
alter table public.listings enable row level security;
alter table public.documents enable row level security;
alter table public.enquiries enable row level security;
alter table public.saved_vendors enable row level security;

-- USERS
create policy "users_read_own" on public.users for select using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "admin_all_users" on public.users for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- VENDORS
create policy "public_read_approved_vendors" on public.vendors for select using (status = 'approved');
create policy "vendor_read_own" on public.vendors for select using (user_id = auth.uid());
create policy "vendor_insert_own" on public.vendors for insert with check (user_id = auth.uid());
create policy "vendor_update_own" on public.vendors for update using (user_id = auth.uid());
create policy "admin_all_vendors" on public.vendors for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- VENDOR_PINCODES
create policy "public_read_pincodes" on public.vendor_pincodes for select using (true);
create policy "vendor_manage_own_pincodes" on public.vendor_pincodes for all using (exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid()));

-- CATEGORIES + MATERIALS
create policy "public_read_categories" on public.categories for select using (true);
create policy "public_read_materials" on public.materials for select using (true);
create policy "admin_manage_categories" on public.categories for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
create policy "admin_manage_materials" on public.materials for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- LISTINGS
create policy "public_read_listings" on public.listings for select using (exists (select 1 from public.vendors where id = listings.vendor_id and status = 'approved'));
create policy "vendor_read_own_listings" on public.listings for select using (exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid()));
create policy "vendor_manage_own_listings" on public.listings for all using (exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid() and status = 'approved'));
create policy "admin_all_listings" on public.listings for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- DOCUMENTS
create policy "vendor_manage_own_docs" on public.documents for all using (exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid()));
create policy "admin_read_docs" on public.documents for select using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- ENQUIRIES
create policy "buyer_manage_own_enquiries" on public.enquiries for all using (buyer_id = auth.uid());
create policy "vendor_read_received_enquiries" on public.enquiries for select using (exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid()));
create policy "vendor_update_enquiry_status" on public.enquiries for update using (exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid()));
create policy "admin_all_enquiries" on public.enquiries for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- SAVED VENDORS
create policy "buyer_manage_saved" on public.saved_vendors for all using (buyer_id = auth.uid());

-- SEED DATA
insert into public.categories (name, slug, description) values
('Cement & concrete', 'cement-concrete', 'Cement, ready-mix concrete and concrete admixtures'),
('Steel & metal', 'steel-metal', 'TMT bars, MS sections, GI sheets and aluminium'),
('Bricks & blocks', 'bricks-blocks', 'Clay bricks, fly ash bricks, AAC and concrete blocks'),
('Sand & aggregates', 'sand-aggregates', 'River sand, M-sand, coarse and fine aggregates'),
('Tiles & flooring', 'tiles-flooring', 'Ceramic, vitrified, porcelain tiles, granite and marble'),
('Roofing', 'roofing', 'GI sheets, clay tiles, polycarbonate and bitumen sheets'),
('Plumbing', 'plumbing', 'PVC, CPVC, UPVC pipes, fittings and water tanks'),
('Electrical', 'electrical', 'Copper wire, conduits, MCBs, switches and earthing'),
('Waterproofing & chemicals', 'waterproofing-chemicals', 'Waterproofing coatings, anti-termite and concrete admixtures'),
('Wood & boards', 'wood-boards', 'Plywood, MDF, flush doors and solid wood'),
('Paints & finishes', 'paints-finishes', 'Exterior and interior paints, primers and texture coats');

insert into public.materials (category_id, name, slug, unit) values
((select id from public.categories where slug = 'cement-concrete'), 'OPC 43 grade cement', 'opc-43-cement', 'bag'),
((select id from public.categories where slug = 'cement-concrete'), 'OPC 53 grade cement', 'opc-53-cement', 'bag'),
((select id from public.categories where slug = 'cement-concrete'), 'PPC cement', 'ppc-cement', 'bag'),
((select id from public.categories where slug = 'cement-concrete'), 'White cement', 'white-cement', 'bag'),
((select id from public.categories where slug = 'cement-concrete'), 'Ready-mix concrete', 'ready-mix-concrete', 'm³'),
((select id from public.categories where slug = 'cement-concrete'), 'Rapid hardening cement', 'rapid-hardening-cement', 'bag'),
((select id from public.categories where slug = 'cement-concrete'), 'Sulphate resistant cement', 'sulphate-resistant-cement', 'bag'),
((select id from public.categories where slug = 'steel-metal'), 'TMT steel bars Fe500', 'tmt-fe500', 'kg'),
((select id from public.categories where slug = 'steel-metal'), 'TMT steel bars Fe550', 'tmt-fe550', 'kg'),
((select id from public.categories where slug = 'steel-metal'), 'Mild steel bars', 'mild-steel-bars', 'kg'),
((select id from public.categories where slug = 'steel-metal'), 'Steel binding wire', 'steel-binding-wire', 'kg'),
((select id from public.categories where slug = 'steel-metal'), 'GI pipes', 'gi-pipes', 'piece'),
((select id from public.categories where slug = 'steel-metal'), 'MS angle and channel', 'ms-angle-channel', 'kg'),
((select id from public.categories where slug = 'steel-metal'), 'Roofing GI sheets', 'roofing-gi-sheets', 'sqft'),
((select id from public.categories where slug = 'steel-metal'), 'Aluminium sections', 'aluminium-sections', 'kg'),
((select id from public.categories where slug = 'bricks-blocks'), 'Red clay bricks', 'red-clay-bricks', 'piece'),
((select id from public.categories where slug = 'bricks-blocks'), 'Fly ash bricks', 'fly-ash-bricks', 'piece'),
((select id from public.categories where slug = 'bricks-blocks'), 'AAC blocks', 'aac-blocks', 'piece'),
((select id from public.categories where slug = 'bricks-blocks'), 'CLC blocks', 'clc-blocks', 'piece'),
((select id from public.categories where slug = 'bricks-blocks'), 'Hollow concrete blocks', 'hollow-concrete-blocks', 'piece'),
((select id from public.categories where slug = 'bricks-blocks'), 'Solid concrete blocks', 'solid-concrete-blocks', 'piece'),
((select id from public.categories where slug = 'bricks-blocks'), 'Laterite stone blocks', 'laterite-stone-blocks', 'piece'),
((select id from public.categories where slug = 'sand-aggregates'), 'River sand', 'river-sand', 'tonne'),
((select id from public.categories where slug = 'sand-aggregates'), 'M-sand manufactured', 'msand', 'tonne'),
((select id from public.categories where slug = 'sand-aggregates'), 'Pit sand', 'pit-sand', 'tonne'),
((select id from public.categories where slug = 'sand-aggregates'), 'Coarse aggregate 20mm', 'coarse-aggregate-20mm', 'tonne'),
((select id from public.categories where slug = 'sand-aggregates'), 'Fine aggregate 10mm', 'fine-aggregate-10mm', 'tonne'),
((select id from public.categories where slug = 'sand-aggregates'), 'Crushed stone dust', 'stone-dust', 'tonne'),
((select id from public.categories where slug = 'tiles-flooring'), 'Ceramic floor tiles', 'ceramic-floor-tiles', 'sqft'),
((select id from public.categories where slug = 'tiles-flooring'), 'Vitrified tiles', 'vitrified-tiles', 'sqft'),
((select id from public.categories where slug = 'tiles-flooring'), 'Porcelain tiles', 'porcelain-tiles', 'sqft'),
((select id from public.categories where slug = 'tiles-flooring'), 'Wall tiles', 'wall-tiles', 'sqft'),
((select id from public.categories where slug = 'tiles-flooring'), 'Granite slabs', 'granite-slabs', 'sqft'),
((select id from public.categories where slug = 'tiles-flooring'), 'Marble slabs', 'marble-slabs', 'sqft'),
((select id from public.categories where slug = 'tiles-flooring'), 'Kota stone', 'kota-stone', 'sqft'),
((select id from public.categories where slug = 'roofing'), 'Clay roof tiles', 'clay-roof-tiles', 'piece'),
((select id from public.categories where slug = 'roofing'), 'Corrugated GI sheet', 'corrugated-gi-sheet', 'sqft'),
((select id from public.categories where slug = 'roofing'), 'Polycarbonate sheet', 'polycarbonate-sheet', 'sqft'),
((select id from public.categories where slug = 'roofing'), 'Bitumen waterproof sheet', 'bitumen-sheet', 'sqft'),
((select id from public.categories where slug = 'roofing'), 'False ceiling grid', 'false-ceiling-grid', 'sqft'),
((select id from public.categories where slug = 'plumbing'), 'PVC pipes', 'pvc-pipes', 'piece'),
((select id from public.categories where slug = 'plumbing'), 'CPVC pipes', 'cpvc-pipes', 'piece'),
((select id from public.categories where slug = 'plumbing'), 'UPVC pipes', 'upvc-pipes', 'piece'),
((select id from public.categories where slug = 'plumbing'), 'GI plumbing pipes', 'gi-plumbing-pipes', 'piece'),
((select id from public.categories where slug = 'plumbing'), 'Pipe fittings and elbows', 'pipe-fittings', 'piece'),
((select id from public.categories where slug = 'plumbing'), 'Water storage tanks', 'water-storage-tanks', 'piece'),
((select id from public.categories where slug = 'electrical'), 'Copper electrical wire', 'copper-wire', 'metre'),
((select id from public.categories where slug = 'electrical'), 'Conduit pipes PVC', 'conduit-pipes', 'piece'),
((select id from public.categories where slug = 'electrical'), 'MCB and distribution board', 'mcb-distribution-board', 'piece'),
((select id from public.categories where slug = 'electrical'), 'Switches and sockets', 'switches-sockets', 'piece'),
((select id from public.categories where slug = 'electrical'), 'Earthing electrode', 'earthing-electrode', 'piece'),
((select id from public.categories where slug = 'waterproofing-chemicals'), 'Cementitious waterproofing', 'cementitious-waterproofing', 'kg'),
((select id from public.categories where slug = 'waterproofing-chemicals'), 'Bitumen coating', 'bitumen-coating', 'litre'),
((select id from public.categories where slug = 'waterproofing-chemicals'), 'Crystalline waterproofing', 'crystalline-waterproofing', 'kg'),
((select id from public.categories where slug = 'waterproofing-chemicals'), 'Anti-termite chemical', 'anti-termite', 'litre'),
((select id from public.categories where slug = 'waterproofing-chemicals'), 'Concrete admixture', 'concrete-admixture', 'litre'),
((select id from public.categories where slug = 'wood-boards'), 'Plywood sheets', 'plywood-sheets', 'piece'),
((select id from public.categories where slug = 'wood-boards'), 'MDF boards', 'mdf-boards', 'piece'),
((select id from public.categories where slug = 'wood-boards'), 'Flush doors', 'flush-doors', 'piece'),
((select id from public.categories where slug = 'wood-boards'), 'Solid wood teak sal', 'solid-wood', 'cft'),
((select id from public.categories where slug = 'wood-boards'), 'Block boards', 'block-boards', 'piece'),
((select id from public.categories where slug = 'paints-finishes'), 'Exterior emulsion paint', 'exterior-emulsion', 'litre'),
((select id from public.categories where slug = 'paints-finishes'), 'Interior emulsion paint', 'interior-emulsion', 'litre'),
((select id from public.categories where slug = 'paints-finishes'), 'Primer and putty', 'primer-putty', 'kg'),
((select id from public.categories where slug = 'paints-finishes'), 'Enamel paint', 'enamel-paint', 'litre'),
((select id from public.categories where slug = 'paints-finishes'), 'Texture coat', 'texture-coat', 'kg');
