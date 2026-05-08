import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/ui/Header";

const inter = Inter({ subsets: ["latin"], weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: "Multiplying Brics | Construction Materials Marketplace",
  description: "Hyperlocal B2B construction materials marketplace in India. Find the best prices for cement, steel, bricks, and more in your pincode.",
};

async function getAuthUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
    
  return profile ? { ...profile } : null
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser()

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-slate-900`}>
        <Header user={user as any} />
        {children}
      </body>
    </html>
  );
}
