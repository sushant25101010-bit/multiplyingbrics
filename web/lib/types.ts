export type UserRole = 'buyer' | 'vendor' | 'admin';
export type VendorStatus = 'pending' | 'approved' | 'rejected';
export type EnquiryStatus = 'open' | 'responded' | 'closed';
export type DocType = 'gst' | 'pan' | 'trade_licence';
export type MaterialUnit = 'kg' | 'tonne' | 'bag' | 'piece' | 'sqft' | 'metre' | 'litre' | 'm³' | 'cft';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  gst_number: string | null;
  address: string | null;
  status: VendorStatus;
  rejection_note: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Material {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  unit: MaterialUnit;
  description: string | null;
}

export interface Listing {
  id: string;
  vendor_id: string;
  material_id: string;
  pincode: string;
  price_per_unit: number;
  in_stock: boolean;
  image_url: string | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
  vendor?: Vendor;
  material?: Material;
}

export interface Enquiry {
  id: string;
  buyer_id: string;
  vendor_id: string;
  listing_id: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface SearchResult {
  listings: (Listing & { vendor: Vendor; material: Material })[];
  fallback_pincode?: string;
  fallback_area?: string;
}
