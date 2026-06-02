import { NextResponse } from 'next/server'

export async function GET() {
  const results: any[] = []
  const baseUrl = 'http://localhost:3000'
  
  try {
    // 1. Test Vendor Signup
    const testVendor = {
      role: 'vendor',
      businessName: 'Test Vendor E2E ' + Date.now(),
      phone: '9876543210',
      email: `vendor_e2e_${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    }
    
    let res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testVendor)
    })
    
    let data = await res.json()
    results.push({ step: 'Vendor Signup', status: res.status, data })
    
    // 2. Test Vendor Login
    res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testVendor.email, password: testVendor.password })
    })
    
    data = await res.json()
    results.push({ step: 'Vendor Login', status: res.status, data })
    
    // 3. Test Admin Signup
    const testAdmin = {
      role: 'admin',
      adminName: 'Test Admin E2E',
      phone: '9876543210',
      email: `admin_e2e_${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    }

    res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAdmin)
    })
    
    data = await res.json()
    results.push({ step: 'Admin Signup', status: res.status, data })

    // 4. Test User Signup
    const testUser = {
      role: 'buyer',
      phone: '9876543210',
      email: `user_e2e_${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    }

    res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    data = await res.json()
    results.push({ step: 'User Signup', status: res.status, data })

  } catch (e: any) {
    results.push({ error: e.message })
  }
  
  return NextResponse.json({ results })
}
