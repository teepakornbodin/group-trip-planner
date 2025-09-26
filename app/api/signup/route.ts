import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // ตัวอย่างการตรวจสอบข้อมูลแบบง่ายๆ
    // ในโปรเจกต์จริงคุณจะต้องตรวจสอบข้อมูล username และ email ในฐานข้อมูล
    // พร้อมกับทำการเข้ารหัส password ก่อนบันทึก
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // ในโค้ดจริงคุณจะบันทึกข้อมูล username, email, password ที่เข้ารหัสแล้วลงในฐานข้อมูล
    console.log(`Attempting to sign up with username: ${username}, email: ${email}`);
    
    return NextResponse.json({ success: true, message: 'Sign Up successful' });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}