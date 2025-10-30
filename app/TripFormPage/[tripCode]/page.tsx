// app/TripFormPage/[tripCode]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MapPin, DollarSign, User, Compass, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from "next/navigation";
import { useParticipants, ParticipantData } from '../../../hooks/useParticipants';
import { useTrip } from '../../../hooks/useTrip';

interface PageProps {
  params: Promise<{ tripCode: string }>;
}

const TripFormPage = () => {
  const router = useRouter();
  const params = useParams();
  // Ensure tripCode is a string
  const tripCode = Array.isArray(params.tripCode) ? params.tripCode[0] : params.tripCode;
  
  const { addParticipant, loading: submitting, error: submitError } = useParticipants();
  const { trip, loading: tripLoading, error: tripError, fetchTrip } = useTrip();
  
  const [formData, setFormData] = useState({
    nickname: '',
    budget: '',
    province: '',
    travelStyle: [] as string[]
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // ดึงข้อมูลทริปเมื่อ component โหลด
  useEffect(() => {
    if (tripCode) {
      fetchTrip(tripCode).catch(console.error);
    }
  }, [tripCode, fetchTrip]);

  // Rest of your component code remains the same...
  const travelStyles = [
    { id: 'beach', label: 'ทะเล', emoji: '🏖️' },
    { id: 'mountain', label: 'ภูเขา', emoji: '⛰️' },
    { id: 'temple', label: 'วัด', emoji: '🏛️' },
    { id: 'cafe', label: 'คาเฟ่', emoji: '☕' },
    { id: 'shopping', label: 'ช็อปปิ้ง', emoji: '🛍️' },
    { id: 'nature', label: 'ธรรมชาติ', emoji: '🌿' },
    { id: 'culture', label: 'วัฒนธรรม', emoji: '🎭' }
  ];

  const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
  'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
  'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
  'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
  'อุทัยธานี', 'อุบลราชธานี'
];


  // Validation for tripCode
  if (!tripCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบรหัสทริป</h2>
          <p className="text-gray-600 mb-6">URL ไม่ถูกต้อง</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // Rest of your component methods remain the same...
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDates.includes(dateStr);
      const isPast = new Date(dateStr) < new Date(new Date().toDateString());
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && toggleDate(dateStr)}
          disabled={isPast}
          className={`h-8 w-8 text-sm rounded-full transition-colors ${
            isPast 
              ? 'text-gray-300 cursor-not-allowed'
              : isSelected 
                ? 'bg-purple-500 text-white' 
                : 'hover:bg-purple-100 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr].sort()
    );
  };

  const toggleTravelStyle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(styleId)
        ? prev.travelStyle.filter(s => s !== styleId)
        : [...prev.travelStyle, styleId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const participantData: ParticipantData = {
        nickname: formData.nickname.trim(),
        available_dates: selectedDates,
        budget: parseInt(formData.budget),
        preferred_province: formData.province,
        travel_styles: formData.travelStyle,
        additional_notes: ''
      };

      console.log('Submitting participant data:', participantData);
      
      const result = await addParticipant(tripCode, participantData);
      
      if (result.success) {
        // นำทางไปหน้า summary
        router.push(`/TripSummaryPage/${tripCode}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Loading state
  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลทริป...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tripError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบทริปนี้</h2>
          <p className="text-gray-600 mb-6">{tripError}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // Rest of your JSX remains exactly the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Navigation */}
      <nav >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับ
          </button>
        </div>
      </nav>
      

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">เข้าร่วมการวางแผนทริป</h1>
            <p className="text-purple-100">กรอกข้อมูลของคุณเพื่อวางแผนทริปร่วมกัน</p>
            {trip && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm">รหัสทริป: <span className="font-bold">{trip.trip_code}</span></p>
                <p className="text-xs text-purple-100">สถานะ: {trip.status}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nickname */}
            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                <User className="w-5 h-5 text-purple-600" />
                <span>ชื่อเล่น</span>
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ใส่ชื่อเล่นของคุณ"
                required
              />
            </div>

            {/* Available Dates */}
            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>วันที่ว่าง</span>
              </label>
              
              <div className="border border-gray-300 rounded-lg p-4 text-gray-600">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h3 className="font-semibold text-gray-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 ">
                  {renderCalendar()}
                </div>

                {selectedDates.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700 mb-2">วันที่เลือก: {selectedDates.length} วัน</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.slice(0, 5).map(date => (
                        <span key={date} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {new Date(date).toLocaleDateString('th-TH')}
                        </span>
                      ))}
                      {selectedDates.length > 5 && (
                        <span className="text-purple-600 text-xs">และอีก {selectedDates.length - 5} วัน</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span>งบประมาณ</span>
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="text-gray-700 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ระบุงบประมาณ (บาท)"
                min="0"
                required
              />
            </div>

            {/* Province */}
            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span>จังหวัดที่อยากไป</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                className="text-gray-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            {/* Travel Style */}
            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                <Compass className="w-5 h-5 text-purple-600" />
                <span>สไตล์การเที่ยว (เลือกได้หลายอย่าง)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {travelStyles.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => toggleTravelStyle(style.id)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.travelStyle.includes(style.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.emoji}</div>
                    <div className="text-sm font-medium">{style.label}</div>
                  </button>
                ))}
              </div>
              {formData.travelStyle.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  เลือกแล้ว: {formData.travelStyle.length} สไตล์
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!formData.nickname || !formData.budget || !formData.province || formData.travelStyle.length === 0 || selectedDates.length === 0 || submitting}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors duration-200"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">
                ข้อมูลของคุณจะถูกใช้เพื่อวางแผนทริปร่วมกัน
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TripFormPage;