// app/api/mytrips/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // ในโปรเจกต์จริง คุณจะดึง ID ของผู้ใช้ที่ล็อกอินอยู่จาก Session หรือ JWT
  // const userId = getUserIdFromSession();

  // ตัวอย่างข้อมูลทริปแบบจำลอง
  const dummyTrips = [
    { id: 'trip_1', name: 'Weekend in Chiang Mai', date: '2025-10-15' },
    { id: 'trip_2', name: 'Beach Hopping in Phuket', date: '2025-11-20' },
    { id: 'trip_3', name: 'Mountain Retreat in Khao Yai', date: '2025-12-05' },
  ];

  // คืนค่ารายการทริปกลับไปให้ Frontend
  return NextResponse.json({ trips: dummyTrips });
}