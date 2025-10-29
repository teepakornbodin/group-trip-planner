// app/api/places/recommendations/[tripCode]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, getParticipants, getTripByCode } from '../../../tripService';

type PlaceRecommendation = {
  id: string;
  name: string;
  type: 'attraction' | 'accommodation' | 'restaurant' | 'activity' | 'shopping' | 'cafe';
  description: string;
  rating: number;
  estimatedCost: number;
  duration: string;
  location: string;
  address: string;
  photos?: string[];
  pros: string[];
  cons: string[];
  place_id: string;
  category: string; // เก็บ primaryType ของ Google หรือ label ที่อยากโชว์
};

// ---------------------- Static ----------------------

const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
  'เชียงใหม่': { lat: 18.7883, lng: 98.9853 },
  'เชียงราย': { lat: 19.9105, lng: 99.8406 },
  'ภูเก็ต': { lat: 7.8804, lng: 98.3923 },
  'กระบี่': { lat: 8.0863, lng: 98.9063 },
  'สุราษฎร์ธานี': { lat: 9.1382, lng: 99.3267 },
  'ขอนแก่น': { lat: 16.4419, lng: 102.8360 },
  'นครราชสีมา': { lat: 14.9799, lng: 102.0977 },
  'อุบลราชธานี': { lat: 15.2286, lng: 104.8560 },
  'หาดใหญ่': { lat: 7.0086, lng: 100.4739 },
  'พัทยา': { lat: 12.9236, lng: 100.8825 },
  'อยุธยา': { lat: 14.3532, lng: 100.5775 },
  'สุโขทัย': { lat: 17.0061, lng: 99.8231 },
  'กาญจนบุรี': { lat: 14.0227, lng: 99.5328 },
  'เพชรบุรี': { lat: 13.1110, lng: 99.9399 }
};

// ---------------------- Helpers ----------------------

function analyzeParticipants(participants: any[]) {
  const provinceCount: Record<string, number> = {};
  participants.forEach(p => {
    provinceCount[p.preferred_province] = (provinceCount[p.preferred_province] || 0) + 1;
  });
  const topProvince = Object.entries(provinceCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'กรุงเทพมหานคร';

  const styleCount: Record<string, number> = {};
  participants.forEach(p => {
    p.travel_styles.forEach((style: string) => {
      styleCount[style] = (styleCount[style] || 0) + 1;
    });
  });
  const topStyles = Object.entries(styleCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([style]) => style);

  const avgBudget = Math.round(
    participants.reduce((sum, p) => sum + p.budget, 0) / participants.length
  );

  const dateCount: Record<string, number> = {};
  participants.forEach(p => {
    p.available_dates.forEach((date: string) => {
      dateCount[date] = (dateCount[date] || 0) + 1;
    });
  });
  const commonDates = Object.entries(dateCount)
    .filter(([, count]) => count >= Math.ceil(participants.length / 2))
    .map(([date]) => date)
    .sort();

  return {
    topProvince,
    topStyles,
    avgBudget,
    commonDates,
    participantCount: participants.length
  };
}

function getTravelStyleTypes(styles: string[]): string[] {
  const styleMap: Record<string, string[]> = {
    beach: ['beach', 'tourist_attraction'],
    mountain: ['tourist_attraction', 'natural_feature', 'park'],
    temple: ['hindu_temple', 'place_of_worship'],
    cafe: ['cafe', 'bakery'],
    shopping: ['shopping_mall', 'store'],
    nature: ['park', 'natural_feature', 'campground'],
    culture: ['museum', 'art_gallery', 'tourist_attraction']
  };

  const types = new Set<string>();
  styles.forEach(style => {
    const mappedTypes = styleMap[style] || [];
    mappedTypes.forEach(type => types.add(type));
  });

  return Array.from(types);
}

function getTravelStyleKeywords(styles: string[], province: string): string[] {
  const keywordMap: Record<string, string[]> = {
    beach: ['หาด', 'ทะเล', 'เกาะ'],
    mountain: ['ภูเขา', 'ดอย', 'เขา', 'วิวภูเขา'],
    temple: ['วัด', 'วิหาร', 'พระธาตุ'],
    cafe: ['คาเฟ่', 'ร้านกาแฟ', 'coffee'],
    shopping: ['ช็อปปิ้ง', 'ห้างสรรพสินค้า', 'ตลาด'],
    nature: ['ธรรมชาติ', 'สวนสาธารณะ', 'น้ำตก'],
    culture: ['พิพิธภัณฑ์', 'ศิลปะ', 'วัฒนธรรม']
  };

  const keywords: string[] = [];
  styles.forEach(style => {
    const words = keywordMap[style] || [];
    words.forEach(word => keywords.push(`${word} ${province}`));
  });

  return keywords;
}

// ---------------------- Google Places ----------------------

async function searchPlacesByText(query: string, apiKey: string): Promise<any[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&language=th&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results) return data.results;
    return [];
  } catch (error) {
    console.error('Error in text search:', error);
    return [];
  }
}

async function searchPlacesNearby(lat: number, lng: number, type: string, apiKey: string): Promise<any[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=20000&type=${type}&language=th&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results) return data.results;
    return [];
  } catch (error) {
    console.error('Error in nearby search:', error);
    return [];
  }
}

// เพิ่มฟังก์ชั่นใหม่: ค้นหาที่พักใกล้เคียง
async function searchNearbyAccommodations(lat: number, lng: number, apiKey: string): Promise<any[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&language=th&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results) return data.results;
    return [];
  } catch (error) {
    console.error('Error searching accommodations:', error);
    return [];
  }
}

// เพิ่มฟังก์ชั่นใหม่: ค้นหาร้านอาหารใกล้เคียง
async function searchNearbyRestaurants(lat: number, lng: number, apiKey: string): Promise<any[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=restaurant&language=th&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results) return data.results;
    return [];
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return [];
  }
}

async function searchPlaces(
  province: string,
  styles: string[],
  types: string[],
  apiKey: string
): Promise<any[]> {
  const allPlaces: any[] = [];

  const keywords = getTravelStyleKeywords(styles, province);
  for (const keyword of keywords.slice(0, 3)) {
    const places = await searchPlacesByText(keyword, apiKey);
    allPlaces.push(...places);
    await new Promise(r => setTimeout(r, 300));
  }

  const coordinates = PROVINCE_COORDINATES[province];
  if (coordinates && types.length > 0) {
    for (const type of types.slice(0, 2)) {
      const places = await searchPlacesNearby(coordinates.lat, coordinates.lng, type, apiKey);
      allPlaces.push(...places);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  return allPlaces
    .filter((place, index, self) => index === self.findIndex(p => p.place_id === place.place_id))
    .filter(place => place.rating && place.rating >= 3.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);
}

// ---------------------- Mapping / Formatting ----------------------

// แปลง Google primary type -> ค่า type (EN) ที่ DB อนุญาต + label ไทยสำหรับโชว์
function mapPlaceTypeToDbType(primaryType: string): {
  dbType: PlaceRecommendation['type'];
  displayType: string;      // ไทย
} {
  switch (primaryType) {
    case 'restaurant':
      return { dbType: 'restaurant', displayType: 'ร้านอาหาร' };
    case 'lodging':
      return { dbType: 'accommodation', displayType: 'ที่พัก' };
    case 'cafe':
    case 'bakery':
      return { dbType: 'cafe', displayType: 'คาเฟ่' };
    case 'shopping_mall':
    case 'store':
      return { dbType: 'shopping', displayType: 'แหล่งช็อปปิ้ง' };
    case 'park':
    case 'museum':
    case 'hindu_temple':
    case 'place_of_worship':
    case 'tourist_attraction':
    case 'natural_feature':
    case 'art_gallery':
      return { dbType: 'attraction', displayType: 'สถานที่ท่องเที่ยว' };
    default:
      // ถ้าไม่รู้จัก ให้เป็น attraction ไปก่อน
      return { dbType: 'attraction', displayType: 'สถานที่ท่องเที่ยว' };
  }
}

function estimateCost(place: any, budget: number): number {
  const priceLevel = place.price_level ?? 2;
  const basePrice = 100;
  const multiplier = priceLevel * 0.5 + 0.5;
  const estimatedCost = Math.round(basePrice * multiplier * (budget / 1000));
  return Math.max(50, Math.min(estimatedCost, budget * 0.3));
}

function convertToRecommendation(place: any, budget: number, apiKey: string): PlaceRecommendation {
  const primaryType: string = place.types?.[0] || 'tourist_attraction';
  const { dbType, displayType } = mapPlaceTypeToDbType(primaryType);

  const pros: string[] = [];
  const cons: string[] = [];

  if ((place.rating ?? 0) >= 4.5) pros.push('รีวิวดีมาก');
  if ((place.user_ratings_total ?? 0) > 500) pros.push('ยอดนิยม');
  if ((place.price_level ?? 2) <= 2) pros.push('ราคาไม่แพง');
  if (place.opening_hours?.open_now) pros.push('เปิดบริการอยู่');

  if ((place.price_level ?? 0) >= 3) cons.push('ค่าใช้จ่ายสูง');
  if (place.opening_hours && !place.opening_hours.open_now) cons.push('อาจปิดในขณะนี้');
  if ((place.user_ratings_total ?? 0) < 50) cons.push('รีวิวน้อย');

  const photoUrls =
    place.photos?.slice(0, 1).map((p: any) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${apiKey}`
    ) ?? [];

  // สำหรับที่พัก ปรับคำอธิบายและระยะเวลา
  let description = place.vicinity || place.formatted_address || 'สถานที่ท่องเที่ยวในพื้นที่';
  let duration = primaryType === 'restaurant' || primaryType === 'cafe' ? '1-2 ชั่วโมง' : '2-3 ชั่วโมง';
  
  if (dbType === 'accommodation') {
    description = `${place.name} เป็นที่พักที่มีคะแนนรีวิว ${place.rating || 'ไม่ระบุ'} ตั้งอยู่ที่ ${place.vicinity || place.formatted_address || 'ไม่ระบุ'}`;
    duration = 'ค้างคืน';
    pros.push('อยู่ใกล้สถานที่ท่องเที่ยว');
  } else if (dbType === 'restaurant') {
    description = `${place.name} เป็นร้านอาหารที่มีคะแนนรีวิว ${place.rating || 'ไม่ระบุ'} ตั้งอยู่ที่ ${place.vicinity || place.formatted_address || 'ไม่ระบุ'}`;
    pros.push('อยู่ใกล้สถานที่ท่องเที่ยวหลัก');
  }

  return {
    id: place.place_id, // client-side ID (จะไม่ใช้ตรงๆเป็น UUID DB)
    name: place.name,
    type: dbType, // <= *** สำคัญ: ใช้ EN ให้ตรง constraint ***
    description: description,
    rating: place.rating || 0,
    estimatedCost: estimateCost(place, budget),
    duration: duration,
    location: place.vicinity || place.formatted_address || '',
    address: place.formatted_address || place.vicinity || '',
    photos: photoUrls,
    pros: pros.length ? pros : ['สถานที่น่าสนใจ'],
    cons: cons.length ? cons : ['ควรตรวจสอบรายละเอียดก่อนไป'],
    place_id: place.place_id,
    // เก็บ primaryType เดิมไว้ใน category (เอาไว้ filter/โชว์)
    category: displayType
  };
}

// ---------------------- Routes ----------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripCode: string }> }
) {
  try {
    const { tripCode } = await params;
    if (!tripCode) {
      return NextResponse.json({ success: false, error: 'Trip code is required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    const { data: participants, error: participantsError } = await getParticipants(tripCode);
    if (participantsError || !participants || participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants found' },
        { status: 404 }
      );
    }

    const analysis = analyzeParticipants(participants);
    const placeTypes = getTravelStyleTypes(analysis.topStyles);
    const places = await searchPlaces(analysis.topProvince, analysis.topStyles, placeTypes, apiKey);
    if (places.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No places found matching criteria' },
        { status: 404 }
      );
    }

    const recommendations: PlaceRecommendation[] = places.map((place) =>
      convertToRecommendation(place, analysis.avgBudget, apiKey)
    );

    const topAttraction = places.find(p => p.types?.includes('tourist_attraction')) || places[0];
    if (topAttraction && topAttraction.geometry?.location) {
      const { lat, lng } = topAttraction.geometry.location;
      const accommodations = await searchNearbyAccommodations(lat, lng, apiKey);
      if (accommodations.length > 0) {
        accommodations.slice(0, 2).forEach(place => {
          recommendations.push(
            convertToRecommendation({ ...place, types: ['lodging'] }, analysis.avgBudget, apiKey)
          );
        });
      }
      const restaurants = await searchNearbyRestaurants(lat, lng, apiKey);
      if (restaurants.length > 0) {
        restaurants.slice(0, 3).forEach(place => {
          recommendations.push(
            convertToRecommendation({ ...place, types: ['restaurant'] }, analysis.avgBudget, apiKey)
          );
        });
      }
    }

    const { data: trip, error: tripErr } = await getTripByCode(tripCode);
    if (tripErr || !trip) {
      return NextResponse.json({ success: false, error: tripErr || 'Trip not found' }, { status: 404 });
    }

    const rows = recommendations.map((r) => ({
      trip_id: trip.id,
      name: r.name,
      type: r.type,
      description: r.description,
      location: r.location,
      estimated_cost: r.estimatedCost,
      duration: r.duration,
      rating: r.rating,
      category: r.category,
      pros: r.pros,
      cons: r.cons,
      additional_info: {
        address: r.address,
        photos: r.photos,
        place_id: r.place_id,
        source: 'google_places'
      },
      ai_confidence: 0.7
    }));

    // 👉 เปลี่ยนมาใช้ insert ตรง ๆ เพื่อ "ไม่เช็คซ้ำ/ยอมซ้ำ"
    const { data: inserted, error: insertErr } = await supabase
      .from('ai_recommendations')
      .insert(rows)
      .select('*');

    if (insertErr) {
      console.error('Insert ai_recommendations error:', insertErr);
      return NextResponse.json(
        { success: false, error: insertErr.message || 'Insert failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendations: inserted, // ส่ง UUID ที่ DB สร้างกลับ
      analysis: {
        province: analysis.topProvince,
        styles: analysis.topStyles,
        avgBudget: analysis.avgBudget,
        participantCount: analysis.participantCount
      }
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}