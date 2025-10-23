// app/api/login/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // ตัวอย่างการตรวจสอบข้อมูลแบบง่ายๆ
    // ในโปรเจกต์จริง คุณจะต้องตรวจสอบข้อมูลจากฐานข้อมูล
    if (email === 'test@example.com' && password === '123456') {
      return NextResponse.json({ success: true, message: 'Login successful' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}