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

// ✨ NEW: อัปเดตพิกัด 77 จังหวัด (โดยประมาณ)
const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
  'สมุทรปราการ': { lat: 13.5998, lng: 100.5959 },
  'นนทบุรี': { lat: 13.8588, lng: 100.4969 },
  'ปทุมธานี': { lat: 14.0205, lng: 100.5255 },
  'พระนครศรีอยุธยา': { lat: 14.3532, lng: 100.5775 },
  'อ่างทอง': { lat: 14.5866, lng: 100.4542 },
  'ลพบุรี': { lat: 14.7986, lng: 100.6515 },
  'สิงห์บุรี': { lat: 14.8876, lng: 100.4042 },
  'ชัยนาท': { lat: 15.1856, lng: 100.1251 },
  'สระบุรี': { lat: 14.5303, lng: 100.9103 },
  'ชลบุรี': { lat: 13.3611, lng: 100.9847 }, // (รวมพัทยา)
  'ระยอง': { lat: 12.6742, lng: 101.2791 },
  'จันทบุรี': { lat: 12.6111, lng: 102.1037 },
  'ตราด': { lat: 12.2451, lng: 102.5181 },
  'ฉะเชิงเทรา': { lat: 13.6874, lng: 101.0713 },
  'ปราจีนบุรี': { lat: 14.0519, lng: 101.3711 },
  'นครนายก': { lat: 14.2078, lng: 101.2132 },
  'สระแก้ว': { lat: 13.8219, lng: 102.0729 },
  'นครราชสีมา': { lat: 14.9799, lng: 102.0977 },
  'บุรีรัมย์': { lat: 14.9961, lng: 103.1030 },
  'สุรินทร์': { lat: 14.8804, lng: 103.4938 },
  'ศรีสะเกษ': { lat: 15.1189, lng: 104.3230 },
  'อุบลราชธานี': { lat: 15.2286, lng: 104.8560 },
  'ยโสธร': { lat: 15.7950, lng: 104.1437 },
  'ชัยภูมิ': { lat: 15.8078, lng: 102.0305 },
  'อำนาจเจริญ': { lat: 15.8617, lng: 104.6256 },
  'บึงกาฬ': { lat: 18.3621, lng: 103.6521 },
  'หนองบัวลำภู': { lat: 17.2023, lng: 102.4419 },
  'ขอนแก่น': { lat: 16.4419, lng: 102.8360 },
  'อุดรธานี': { lat: 17.4137, lng: 102.7884 },
  'เลย': { lat: 17.4852, lng: 101.7270 },
  'หนองคาย': { lat: 17.8804, lng: 102.7441 },
  'มหาสารคาม': { lat: 16.1822, lng: 103.3031 },
  'ร้อยเอ็ด': { lat: 16.0552, lng: 103.6531 },
  'กาฬสินธุ์': { lat: 16.4332, lng: 103.5065 },
  'สกลนคร': { lat: 17.1643, lng: 104.1470 },
  'นครพนม': { lat: 17.4063, lng: 104.7801 },
  'มุกดาหาร': { lat: 16.5452, lng: 104.7230 },
  'เชียงใหม่': { lat: 18.7883, lng: 98.9853 },
  'ลำพูน': { lat: 18.5776, lng: 99.0094 },
  'ลำปาง': { lat: 18.2931, lng: 99.4939 },
  'อุตรดิตถ์': { lat: 17.6256, lng: 100.0953 },
  'แพร่': { lat: 18.1442, lng: 100.1402 },
  'น่าน': { lat: 18.7738, lng: 100.7719 },
  'พะเยา': { lat: 19.1627, lng: 99.9016 },
  'เชียงราย': { lat: 19.9105, lng: 99.8406 },
  'แม่ฮ่องสอน': { lat: 19.2934, lng: 97.9714 },
  'นครสวรรค์': { lat: 15.7088, lng: 100.1232 },
  'อุทัยธานี': { lat: 15.3787, lng: 100.0354 },
  'กำแพงเพชร': { lat: 16.4831, lng: 99.5226 },
  'ตาก': { lat: 16.8833, lng: 99.1247 },
  'สุโขทัย': { lat: 17.0061, lng: 99.8231 },
  'พิษณุโลก': { lat: 16.8193, lng: 100.2587 },
  'พิจิตร': { lat: 16.4462, lng: 100.3481 },
  'เพชรบูรณ์': { lat: 16.4173, lng: 101.1578 },
  'ราชบุรี': { lat: 13.5391, lng: 99.8157 },
  'กาญจนบุรี': { lat: 14.0227, lng: 99.5328 },
  'สุพรรณบุรี': { lat: 14.4697, lng: 100.1194 },
  'นครปฐม': { lat: 13.8213, lng: 100.0631 },
  'สมุทรสาคร': { lat: 13.5488, lng: 100.2741 },
  'สมุทรสงคราม': { lat: 13.4137, lng: 100.0011 },
  'เพชรบุรี': { lat: 13.1110, lng: 99.9399 },
  'ประจวบคีรีขันธ์': { lat: 11.8082, lng: 99.7923 },
  'นครศรีธรรมราช': { lat: 8.4309, lng: 99.9631 },
  'กระบี่': { lat: 8.0863, lng: 98.9063 },
  'พังงา': { lat: 8.4504, lng: 98.5255 },
  'ภูเก็ต': { lat: 7.8804, lng: 98.3923 },
  'สุราษฎร์ธานี': { lat: 9.1382, lng: 99.3267 },
  'ระนอง': { lat: 9.9656, lng: 98.6348 },
  'ชุมพร': { lat: 10.4907, lng: 99.1802 },
  'สงขลา': { lat: 7.1996, lng: 100.5950 }, // (รวมหาดใหญ่)
  'สตูล': { lat: 6.6210, lng: 100.0654 },
  'ตรัง': { lat: 7.5577, lng: 99.6105 },
  'พัทลุง': { lat: 7.6181, lng: 100.0758 },
  'ปัตตานี': { lat: 6.8660, lng: 101.2503 },
  'ยะลา': { lat: 6.5414, lng: 101.2804 },
  'นราธิวาส': { lat: 6.4258, lng: 101.8252 },
  'พัทยา': { lat: 12.9236, lng: 100.8825 }, // แยกพิเศษ
  'หาดใหญ่': { lat: 7.0086, lng: 100.4739 } // แยกพิเศษ
};

// ✨ NEW: เพิ่มข้อมูล Mock ที่ดูสมจริงสำหรับบางจังหวัด
const REALISTIC_MOCK_DATA: Record<string, Record<string, any[]>> = {
  'เชียงใหม่': {
    'attraction': [
      { name: 'วัดพระธาตุดอยสุเทพ', type: 'place_of_worship', address: 'ต.สุเทพ อ.เมือง จ.เชียงใหม่' },
      { name: 'ประตูท่าแพ', type: 'tourist_attraction', address: 'ต.ช้างคลาน อ.เมือง จ.เชียงใหม่' },
      { name: 'ดอยอินทนนท์', type: 'natural_feature', address: 'อ.จอมทอง จ.เชียงใหม่' },
    ],
    'cafe': [
      { name: 'Ristr8to Lab', type: 'cafe', address: 'นิมมานเหมินทร์ ซอย 3' },
      { name: 'GRAPH contemporary', type: 'cafe', address: 'ต.ช้างม่อย อ.เมือง' },
    ],
    'restaurant': [
      { name: 'ต๋องเต็มโต๊ะ', type: 'restaurant', address: 'นิมมานเหมินทร์ ซอย 13' },
      { name: 'ข้าวซอยแม่มณี', type: 'restaurant', address: 'ถ.โชตนา ต.ช้างเผือก' },
    ],
    'accommodation': [
      { name: 'โรงแรมแทมมาริน วิลเลจ', type: 'lodging', address: 'ถ.ราชดำเนิน ต.ศรีภูมิ' },
    ]
  },
  'กรุงเทพมหานคร': {
    'attraction': [
      { name: 'วัดพระแก้ว (วัดพระศรีรัตนศาสดาราม)', type: 'place_of_worship', address: 'ถ.หน้าพระลาน เขตพระนคร' },
      { name: 'พระบรมมหาราชวัง', type: 'tourist_attraction', address: 'ถ.หน้าพระลาน เขตพระนคร' },
    ],
    'shopping': [
      { name: 'ไอคอนสยาม (ICONSIAM)', type: 'shopping_mall', address: 'ถ.เจริญนคร เขตคลองสาน' },
      { name: 'สยามพารากอน', type: 'shopping_mall', address: 'ถ.พระรามที่ 1 เขตปทุมวัน' },
    ],
    'cafe': [
      { name: 'Rolling Roasters', type: 'cafe', address: 'พรานนก-พุทธมณฑล สาย 1' },
      { name: 'Factory Coffee - BKK', type: 'cafe', address: 'ถ.พญาไท เขตราชเทวี' },
    ],
    'restaurant': [
      { name: 'เจ๊ไฝ', type: 'restaurant', address: 'ถ.มหาไชย เขตพระนคร' },
      { name: 'ทิพย์สมัย (ผัดไทยประตูผี)', type: 'restaurant', address: 'ถ.มหาไชย เขตพระนคร' },
    ],
    'accommodation': [
      { name: 'โรงแรมแมนดาริน โอเรียนเต็ล กรุงเทพฯ', type: 'lodging', address: 'ซอยเจริญกรุง 40 เขตบางรัก' },
    ]
  },
  'ภูเก็ต': {
    'attraction': [
      { name: 'หาดป่าตอง', type: 'beach', address: 'อ.กะทู้ จ.ภูเก็ต' },
      { name: 'แหลมพรหมเทพ', type: 'tourist_attraction', address: 'ต.ราไวย์ อ.เมือง' },
      { name: 'วัดฉลอง (วัดไชยธาราราม)', type: 'place_of_worship', address: 'ถ.เจ้าฟ้าตะวันตก ต.ฉลอง' },
    ],
    'cafe': [
      { name: 'The Feelsion Cafe', type: 'cafe', address: 'ถ.ภูเก็ต ต.ตลาดใหญ่' },
    ],
    'restaurant': [
      { name: 'ระย้า', type: 'restaurant', address: 'ถ.ดีบุก ต.ตลาดเหนือ' },
      { name: 'ตู้กับข้าว', type: 'restaurant', address: 'ถ.พังงา ต.ตลาดใหญ่' },
    ],
    'accommodation': [
      { name: 'ศรีพันวา ภูเก็ต', type: 'lodging', address: 'ถ.ศักดิเดช ต.วิชิต' },
    ]
  },
  'ชลบุรี': {
    'attraction': [
      { name: 'หาดบางแสน', type: 'beach', address: 'ต.แสนสุข อ.เมือง จ.ชลบุรี' },
      { name: 'เมืองพัทยา', type: 'tourist_attraction', address: 'อ.บางละมุง จ.ชลบุรี' },
      { name: 'สวนนงนุช', type: 'tourist_attraction', address: 'ต.นาจอมเทียน อ.สัตหีบ' },
    ],
    'cafe': [
      { name: 'Artory Cafe and Crafts', type: 'cafe', address: 'ซอยหลังวัดกลางดอน' },
      { name: 'Way Coffee House', type: 'cafe', address: 'ถ.บางแสนสาย 1' },
    ],
    'restaurant': [
      { name: 'เจ๊จุก ซีฟู๊ด พัทยา', type: 'restaurant', address: 'พัทยาเหนือ' },
    ],
    'accommodation': [
      { name: 'โรงแรมเคป ดารา รีสอร์ท พัทยา', type: 'lodging', address: 'พัทยาเหนือ ซอย 20' },
    ]
  },
  'พัทยา': { // รองรับ "พัทยา" เป็นพิเศษ
    'attraction': [
      { name: 'หาดพัทยา', type: 'beach', address: 'อ.บางละมุง จ.ชลบุรี' },
      { name: 'ปราสาทสัจธรรม', type: 'tourist_attraction', address: 'แหลมราชเวช อ.บางละมุง' },
      { name: 'Walking Street Pattaya', type: 'tourist_attraction', address: 'พัทยาใต้' },
    ],
    'cafe': [
      { name: 'The Sky Gallery Pattaya', type: 'cafe', address: 'เขาพระตำหนัก' },
    ],
    'restaurant': [
      { name: 'The Glass House Pattaya', type: 'restaurant', address: 'หาดจอมเทียน' },
    ],
    'accommodation': [
      { name: 'โรงแรมฮิลตัน พัทยา', type: 'lodging', address: 'เซ็นทรัลเฟสติวัล พัทยาบีช' },
    ]
  }
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

// ---------------------- ✨ Mock Places API ----------------------

/**
 * ✨ MODIFIED: ฟังก์ชันสร้างข้อมูลสถานที่จำลอง
 * จะพยายามใช้ REALISTIC_MOCK_DATA ก่อน
 * ถ้าไม่เจอจังหวัด/ประเภทที่ตรงกัน จะ fallback ไปสร้าง "จำลอง 1, 2, 3"
 */
function generateMockPlaces(province: string, typeQuery: string, count: number): any[] {
  const results: any[] = [];
  const coordinates = PROVINCE_COORDINATES[province] || { lat: 13.7563, lng: 100.5018 };

  // Helper: แปลง keyword (จาก getTravelStyleKeywords) เป็น key ของ REALISTIC_MOCK_DATA
  const mapKeywordToTypeKey = (query: string): string => {
    if (query.includes('วัด') || query.includes('temple') || query.includes('ภูเขา') || query.includes('หาด') || query.includes('nature') || query.includes('culture')) return 'attraction';
    if (query.includes('คาเฟ่') || query.includes('cafe')) return 'cafe';
    if (query.includes('shopping') || query.includes('ช็อปปิ้ง')) return 'shopping';
    if (query === 'lodging') return 'accommodation';
    if (query === 'restaurant') return 'restaurant';
    return 'attraction'; // default
  };

  // Helper: แปลง keyword เป็น Google Type (สำหรับใส่ใน array)
  const getGoogleType = (query: string): string => {
    if (query.includes('วัด') || query.includes('temple')) return 'place_of_worship';
    if (query.includes('คาเฟ่') || query.includes('cafe')) return 'cafe';
    if (query.includes('หาด') || query.includes('beach')) return 'beach';
    if (query.includes('ภูเขา') || query.includes('mountain')) return 'natural_feature';
    if (query.includes('shopping') || query.includes('ช็อปปิ้ง')) return 'shopping_mall';
    if (query === 'lodging') return 'lodging';
    if (query === 'restaurant') return 'restaurant';
    return 'tourist_attraction';
  };

  const typeKey = mapKeywordToTypeKey(typeQuery); // เช่น 'attraction', 'cafe'
  const googleType = getGoogleType(typeQuery); // เช่น 'place_of_worship', 'cafe'
  
  const realisticDataList = REALISTIC_MOCK_DATA[province]?.[typeKey];

  if (realisticDataList && realisticDataList.length > 0) {
    // --- 1. เจอข้อมูลจริง ---
    // วนลูปตามจำนวนที่ต้องการ (count) แต่ไม่เกินจำนวนข้อมูลจริงที่มี
    for (let i = 0; i < count; i++) {
      // วนใช้ข้อมูล (ถ้า count > data.length)
      const data = realisticDataList[i % realisticDataList.length]; 
      const placeName = data.name;
      // เพิ่ม (1), (2) ถ้ามีการวนซ้ำ
      const suffix = i >= realisticDataList.length ? ` (${Math.floor(i / realisticDataList.length) + 1})` : ''; 
      
      const placeId = `mock_real_${province}_${placeName.replace(/\s/g, '_')}_${i}`;
      const rating = parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)); // 4.0 - 5.0 (ให้คะแนนดีหน่อย)

      results.push({
        place_id: placeId,
        name: placeName + suffix,
        types: [data.type, googleType, 'tourist_attraction', 'establishment'],
        rating: rating,
        user_ratings_total: Math.floor(Math.random() * 2500) + 200, // 200 - 2700
        price_level: Math.floor(Math.random() * 3) + 2, // 2 - 4
        opening_hours: { open_now: Math.random() > 0.2 }, // 80% open
        vicinity: data.address,
        formatted_address: `${data.address}, ${province}`,
        photos: [
          `https://placehold.co/400x300/E2E8F0/4A5568?text=${encodeURIComponent(placeName)}`
        ],
        geometry: {
          location: {
            lat: coordinates.lat + (Math.random() - 0.5) * 0.05, // สุ่มใกล้ๆ
            lng: coordinates.lng + (Math.random() - 0.5) * 0.05,
          },
        },
      });
    }
  } else {
    // --- 2. ไม่เจอข้อมูลจริง (Fallback) ---
    // ใช้ Logic เดิม
    for (let i = 1; i <= count; i++) {
      const placeName = `${typeQuery} จำลอง ${i} จ.${province}`;
      const placeId = `mock_fallback_${province}_${typeQuery.replace(/\s/g, '_')}_${i}`;
      const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5 - 5.0

      results.push({
        place_id: placeId,
        name: placeName,
        types: [googleType, 'tourist_attraction', 'point_of_interest', 'establishment'],
        rating: rating,
        user_ratings_total: Math.floor(Math.random() * 1500) + 50, // 50 - 1550
        price_level: Math.floor(Math.random() * 4) + 1, // 1 - 4
        opening_hours: { open_now: Math.random() > 0.3 }, // 70% open
        vicinity: `ใกล้ศูนย์กลาง ${province}`,
        formatted_address: `123/45 ถนนจำลอง, อ.เมือง, ${province}`,
        photos: [
          `https://placehold.co/400x300/E2E8F0/4A5568?text=${encodeURIComponent(placeName)}`
        ],
        geometry: {
          location: {
            lat: coordinates.lat + (Math.random() - 0.5) * 0.1,
            lng: coordinates.lng + (Math.random() - 0.5) * 0.1,
          },
        },
      });
    }
  }
  return results;
}

/**
 * ✨ MOCKED: ค้นหาสถานที่ด้วย Text (จำลอง)
 */
async function searchPlacesByText(query: string, apiKey: string): Promise<any[]> {
  // พยายามแยกจังหวัดและคีย์เวิร์ดออกจาก query
  const queryParts = query.split(' ');
  const province = queryParts.length > 1 ? queryParts[queryParts.length - 1] : 'กรุงเทพมหานคร';
  const keyword = queryParts[0] || 'สถานที่ท่องเที่ยว';

  // ตรวจสอบว่าจังหวัดที่แยกมามีในลิสต์หรือไม่
  const validProvince = PROVINCE_COORDINATES[province] ? province : 'กรุงเทพมหานคร';
  
  console.log(`[Mock API] searchPlacesByText: query='${query}', keyword='${keyword}', province='${validProvince}'`);

  const mockPlaces = generateMockPlaces(validProvince, keyword, 5);
  
  // จำลอง delay
  await new Promise(r => setTimeout(r, 100 + Math.random() * 200)); 
  return Promise.resolve(mockPlaces);
}

/**
 * ✨ MOCKED: ค้นหาสถานที่ใกล้เคียง (จำลอง)
 */
async function searchPlacesNearby(lat: number, lng: number, type: string, apiKey: string): Promise<any[]> {
  // ใน mock นี้ เราจะใช้จังหวัด 'กรุงเทพมหานคร' เป็น default เมื่อค้นหาด้วย lat/lng
  // (หรือจะเขียน logic หจังหวัดที่ใกล้ที่สุดจาก lat/lng ก็ได้ แต่เพื่อความง่าย)
  const province = 'สถานที่ใกล้เคียง'; 
  console.log(`[Mock API] searchPlacesNearby: lat=${lat}, lng=${lng}, type='${type}'`);

  const mockPlaces = generateMockPlaces(province, type, 5);
  
  await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
  return Promise.resolve(mockPlaces);
}

/**
 * ✨ MOCKED: ค้นหาที่พักใกล้เคียง (จำลอง)
 */
async function searchNearbyAccommodations(lat: number, lng: number, apiKey: string): Promise<any[]> {
  const province = 'ที่พักใกล้เคียง';
  console.log(`[Mock API] searchNearbyAccommodations: lat=${lat}, lng=${lng}`);
  
  const mockPlaces = generateMockPlaces(province, 'lodging', 3);
  
  await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
  return Promise.resolve(mockPlaces);
}

/**
 * ✨ MOCKED: ค้นหาร้านอาหารใกล้เคียง (จำลอง)
 */
async function searchNearbyRestaurants(lat: number, lng: number, apiKey: string): Promise<any[]> {
  const province = 'ร้านอาหารใกล้เคียง';
  console.log(`[Mock API] searchNearbyRestaurants: lat=${lat}, lng=${lng}`);
  
  const mockPlaces = generateMockPlaces(province, 'restaurant', 4);
  
  await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
  return Promise.resolve(mockPlaces);
}

/**
 * ฟังก์ชันนี้ไม่ต้องแก้ เพราะมันจะไปเรียก searchPlacesByText และ searchPlacesNearby
 * ที่เราทำเป็น Mock ไว้แล้วโดยอัตโนมัติ
 */
async function searchPlaces(
  province: string,
  styles: string[],
  types: string[],
  apiKey: string
): Promise<any[]> {
  const allPlaces: any[] = [];
  console.log(`[Mock Flow] searchPlaces for province: ${province}`);

  const keywords = getTravelStyleKeywords(styles, province);
  for (const keyword of keywords.slice(0, 3)) {
    // 👇 จะไปเรียก mockSearchPlacesByText
    const places = await searchPlacesByText(keyword, apiKey);
    allPlaces.push(...places);
    await new Promise(r => setTimeout(r, 300)); // delay เดิม
  }

  const coordinates = PROVINCE_COORDINATES[province];
  if (coordinates && types.length > 0) {
    for (const type of types.slice(0, 2)) {
      // 👇 จะไปเรียก mockSearchPlacesNearby
      const places = await searchPlacesNearby(coordinates.lat, coordinates.lng, type, apiKey);
      allPlaces.push(...places);
      await new Promise(r => setTimeout(r, 300)); // delay เดิม
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
  displayType: string;      // ไทย
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
    case 'beach': // เพิ่มเติม
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

/**
 * ✨ MODIFIED: แก้ไขฟังก์ชันนี้
 * 1. ลบ `apiKey` parameter ออก
 * 2. เปลี่ยน `photoUrls` ให้ใช้ `place.photos` (ที่เป็น string array) โดยตรง
 */
function convertToRecommendation(place: any, budget: number): PlaceRecommendation {
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

  // ✨ CHANGED: ใช้ URL จาก mock data โดยตรง (ซึ่งเป็น array of strings)
  const photoUrls = place.photos ?? [];

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

    // ✨ REMOVED: ลบการตรวจสอบ apiKey
    /*
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }
    */
    
    // ✨ ADDED: สร้าง dummy key (เผื่อฟังก์ชันบางตัวยังเรียกใช้ แต่เราแก้ให้ไม่ใช้แล้ว)
    const apiKey = "MOCK_KEY_NOT_NEEDED";

    const { data: participants, error: participantsError } = await getParticipants(tripCode);
    if (participantsError || !participants || participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants found' },
        { status: 404 }
      );
    }

    const analysis = analyzeParticipants(participants);
    const placeTypes = getTravelStyleTypes(analysis.topStyles);
    
    // 👇 ฟังก์ชันนี้จะไปเรียก Mock APIs ที่เราสร้างไว้เอง
    const places = await searchPlaces(analysis.topProvince, analysis.topStyles, placeTypes, apiKey);
    
    if (places.length === 0) {
      // สร้างข้อมูลจำลองชุดสุดท้ายถ้า searchPlaces ไม่เจออะไรเลย
      console.log("[Mock Flow] No places found, generating fallback mocks...");
      const fallbackPlaces = generateMockPlaces(analysis.topProvince, "สถานที่ท่องเที่ยว", 5);
      places.push(...fallbackPlaces);
    }

    // ✨ CHANGED: ลบ apiKey ออกจาก call
    const recommendations: PlaceRecommendation[] = places.map((place) =>
      convertToRecommendation(place, analysis.avgBudget)
    );

    const topAttraction = places.find(p => p.types?.includes('tourist_attraction')) || places[0];
    if (topAttraction && topAttraction.geometry?.location) {
      const { lat, lng } = topAttraction.geometry.location;
      
      // 👇 เรียก Mock Accommodations
      const accommodations = await searchNearbyAccommodations(lat, lng, apiKey);
      if (accommodations.length > 0) {
        accommodations.slice(0, 2).forEach(place => {
          recommendations.push(
            // ✨ CHANGED: ลบ apiKey ออกจาก call
            convertToRecommendation({ ...place, types: ['lodging'] }, analysis.avgBudget)
          );
        });
      }
      
      // 👇 เรียก Mock Restaurants
      const restaurants = await searchNearbyRestaurants(lat, lng, apiKey);
      if (restaurants.length > 0) {
        restaurants.slice(0, 3).forEach(place => {
          recommendations.push(
            // ✨ CHANGED: ลบ apiKey ออกจาก call
            convertToRecommendation({ ...place, types: ['restaurant'] }, analysis.avgBudget)
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
        source: 'mock_data' // ✨ เปลี่ยน source เป็น mock
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