// utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';
import { TripPlan } from '../api/tripService';

export async function generatePDF(plan: TripPlan): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Add Thai font support (if available)
      try {
        // For production, you'd want to include a Thai font file
        // doc.font('path/to/thai-font.ttf');
      } catch (error) {
        // Fallback to default font
        console.warn('Thai font not available, using default font');
      }

      // Header
      doc.fontSize(24)
         .fillColor('#6366f1')
         .text('Group Trip Planner', 50, 50);

      doc.fontSize(18)
         .fillColor('#1f2937')
         .text(plan.plan_title, 50, 90);

      // Trip details
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text(`วันที่: ${formatDateRange(plan.start_date, plan.end_date)}`, 50, 120)
         .text(`งบประมาณรวม: ฿${plan.total_budget.toLocaleString()}`, 50, 140);

      let yPos = 180;

      // Overview section
      if (plan.overview) {
        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('ภาพรวมการเดินทาง', 50, yPos);
        
        yPos += 30;
        
        doc.fontSize(11)
           .fillColor('#374151');

        if (plan.overview.destinations) {
          doc.text(`สถานที่: ${plan.overview.destinations.join(', ')}`, 70, yPos);
          yPos += 20;
        }

        if (plan.overview.accommodation) {
          doc.text(`ที่พัก: ${plan.overview.accommodation}`, 70, yPos);
          yPos += 20;
        }

        if (plan.overview.transportation) {
          doc.text(`การเดินทาง: ${plan.overview.transportation}`, 70, yPos);
          yPos += 20;
        }

        yPos += 20;
      }

      // Itinerary section
      if (plan.itinerary && Array.isArray(plan.itinerary)) {
        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('กำหนดการเดินทาง', 50, yPos);
        
        yPos += 30;

        for (const day of plan.itinerary) {
          // Check if we need a new page
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          // Day header
          doc.fontSize(14)
             .fillColor('#6366f1')
             .text(`วันที่ ${day.day}: ${day.date}`, 50, yPos);
          
          yPos += 25;

          // Activities
          if (day.activities && Array.isArray(day.activities)) {
            for (const activity of day.activities) {
              if (yPos > 720) {
                doc.addPage();
                yPos = 50;
              }

              doc.fontSize(11)
                 .fillColor('#1f2937')
                 .text(`${activity.time} - ${activity.title}`, 70, yPos);
              
              yPos += 15;

              doc.fontSize(10)
                 .fillColor('#6b7280')
                 .text(activity.description, 90, yPos, { width: 400 });
              
              yPos += 12;

              if (activity.cost > 0) {
                doc.text(`ค่าใช้จ่าย: ฿${activity.cost.toLocaleString()}`, 90, yPos);
                yPos += 12;
              }

              if (activity.duration) {
                doc.text(`ระยะเวลา: ${activity.duration}`, 90, yPos);
                yPos += 12;
              }

              yPos += 10;
            }
          }

          yPos += 15;
        }
      }

      // Budget breakdown
      if (plan.budget_breakdown) {
        if (yPos > 600) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('สรุปค่าใช้จ่าย', 50, yPos);
        
        yPos += 30;

        doc.fontSize(11)
           .fillColor('#374151');

        const budgetLabels: { [key: string]: string } = {
          accommodation: 'ที่พัก',
          transportation: 'การเดินทาง',
          meals: 'อาหาร',
          attractions: 'สถานที่ท่องเที่ยว',
          shopping: 'ช็อปปิ้ง',
          miscellaneous: 'เบ็ดเตล็ด'
        };

        for (const [category, amount] of Object.entries(plan.budget_breakdown)) {
          const label = budgetLabels[category] || category;
          doc.text(`${label}: ฿${(amount as number).toLocaleString()}`, 70, yPos);
          yPos += 18;
        }

        yPos += 10;
        
        doc.fontSize(12)
           .fillColor('#6366f1')
           .text(`รวมทั้งสิ้น: ฿${plan.total_budget.toLocaleString()}`, 70, yPos);
        
        yPos += 30;
      }

      // Travel tips
      if (plan.travel_tips && Array.isArray(plan.travel_tips)) {
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('เคล็ดลับการเดินทาง', 50, yPos);
        
        yPos += 30;

        doc.fontSize(11)
           .fillColor('#374151');

        for (const tip of plan.travel_tips) {
          if (yPos > 720) {
            doc.addPage();
            yPos = 50;
          }

          doc.text(`• ${tip}`, 70, yPos, { width: 450 });
          yPos += 20;
        }
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor('#9ca3af')
           .text(
             `Generated by Group Trip Planner - ${new Date().toLocaleDateString('th-TH')} - Page ${i + 1} of ${pageCount}`,
             50,
             750,
             { align: 'center', width: 495 }
           );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('th-TH', options);
  }

  return `${start.toLocaleDateString('th-TH', options)} - ${end.toLocaleDateString('th-TH', options)}`;
}

// utils/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(response.status, data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, 'Network error occurred');
  }
}

// API Client functions
export const apiClient = {
  // Trip management
  createTrip: () => apiRequest('/trips/create', { method: 'POST' }),
  
  getTrip: (tripCode: string) => apiRequest(`/trips/${tripCode}`),
  
  addParticipant: (tripCode: string, participantData: any) =>
    apiRequest(`/trips/${tripCode}/participants`, {
      method: 'POST',
      body: JSON.stringify(participantData),
    }),
  
  getTripSummary: (tripCode: string) => apiRequest(`/trips/${tripCode}/summary`),
  
  // AI Recommendations
  generateRecommendations: (tripCode: string) =>
    apiRequest(`/trips/${tripCode}/recommendations`, { method: 'POST' }),
  
  getRecommendations: (tripCode: string) =>
    apiRequest(`/trips/${tripCode}/recommendations`),
  
  // Voting
  submitVote: (tripCode: string, voteData: any) =>
    apiRequest(`/trips/${tripCode}/votes`, {
      method: 'POST',
      body: JSON.stringify(voteData),
    }),
  
  getVotes: (tripCode: string) => apiRequest(`/trips/${tripCode}/votes`),
  
  // Trip Plan
  generateTripPlan: (tripCode: string) =>
    apiRequest(`/trips/${tripCode}/plan`, { method: 'POST' }),
  
  getTripPlan: (tripCode: string) => apiRequest(`/trips/${tripCode}/plan`),
  
  // PDF and cleanup
  downloadPDF: (tripCode: string) => {
    const url = `${API_BASE_URL}/api/trips/${tripCode}/pdf`;
    window.open(url, '_blank');
  },
  
  deleteTripData: (tripCode: string) =>
    apiRequest(`/trips/${tripCode}/delete`, { method: 'DELETE' }),
};

// .env.local (Environment Variables)
/*
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Optional: For production
DATABASE_URL=your-supabase-db-url
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com
*/

// package.json dependencies to add
/*
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "pdfkit": "^0.14.0",
    "@types/pdfkit": "^0.12.12"
  },
  "devDependencies": {
    "@types/node": "^20.8.0"
  }
}
*/

// middleware.ts (Optional: For rate limiting and security)
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100;

// Simple in-memory rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

export function middleware(req: NextRequest) {
  // Only apply rate limiting to API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(req);
    
    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// utils/supabaseAdmin.ts (For server-side operations with elevated permissions)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cleanup function that can be called by a cron job
export async function cleanupExpiredTrips() {
  try {
    const { data, error } = await supabaseAdmin.rpc('cleanup_expired_trips');
    
    if (error) throw error;
    
    console.log(`Cleaned up ${data} expired trips`);
    return data;
  } catch (error) {
    console.error('Error cleaning up expired trips:', error);
    throw error;
  }
}