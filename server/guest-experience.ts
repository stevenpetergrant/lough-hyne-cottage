import { storage } from "./storage";
import crypto from "crypto";

export function generateGuestQrCode(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LHC-GUEST-${timestamp}-${random}`;
}

export async function createGuestQrCode(bookingData: {
  bookingId: number;
  guestName: string;
  checkInDate: Date;
  checkOutDate?: Date;
}): Promise<string> {
  const code = generateGuestQrCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days after creation

  // Store QR code (when database is ready)
  console.log(`Generated QR code ${code} for guest ${bookingData.guestName}`);
  
  return code;
}

export async function validateGuestQrCode(code: string): Promise<{ valid: boolean; guestInfo?: any; message: string }> {
  // For now, return mock validation based on code format
  if (!code || !code.startsWith('LHC-GUEST-')) {
    return { valid: false, message: "Invalid QR code format" };
  }
  
  // Mock guest info for testing
  const mockGuestInfo = {
    guestName: "Demo Guest",
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  return { valid: true, guestInfo: mockGuestInfo, message: "Valid QR code" };
}

export async function saveGuestExperience(experienceData: {
  qrCodeId: string;
  guestName: string;
  stayDate: string;
  experienceTitle: string;
  experienceDescription: string;
  recommendation?: string;
  photos: string[];
}): Promise<any> {
  // For now, just log the experience data
  console.log("Saving guest experience:", experienceData);
  
  // Mock saved experience
  return {
    id: Date.now(),
    ...experienceData,
    isApproved: false,
    isPublic: true,
    createdAt: new Date()
  };
}

export async function getPublicGuestExperiences(): Promise<any[]> {
  // Mock experiences for demonstration
  return [
    {
      id: 1,
      guestName: "Sarah & Tom",
      stayDate: "2024-01-15",
      experienceTitle: "Magical Sunrise Kayaking",
      experienceDescription: "We woke up early to catch the sunrise over Lough Hyne. The water was perfectly still, creating mirror-like reflections of the surrounding hills. Paddling in the golden light with the marine life visible below was absolutely breathtaking. The silence was profound - just the gentle splash of our paddles and the occasional bird call.",
      recommendation: "Bring a waterproof camera and start just before 7 AM for the best light. The lake is usually calmest in the early morning.",
      photos: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400", // Sunrise over calm lake with kayak
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"  // Golden sunrise on water
      ],
      isApproved: true,
      isPublic: true,
      createdAt: "2024-01-16T10:00:00Z"
    },
    {
      id: 2,
      guestName: "Emma",
      stayDate: "2024-01-10",
      experienceTitle: "Evening Sauna & Star Gazing",
      experienceDescription: "The sauna experience was incredible! After heating up in the cedar-scented warmth, stepping out into the cool evening air felt amazing. We then lay on the deck chairs and watched the stars emerge over the lake. The lack of light pollution here means you can see the Milky Way clearly.",
      recommendation: "Book the evening sauna slot and bring blankets for stargazing afterward. The outdoor shower under the stars is an unforgettable experience!",
      photos: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", // Modern sauna interior with warm lighting
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400"  // Milky Way stars over dark landscape
      ],
      isApproved: true,
      isPublic: true,
      createdAt: "2024-01-11T16:30:00Z"
    },
    {
      id: 3,
      guestName: "Michael & Jenny",
      stayDate: "2024-02-20",
      experienceTitle: "Wild Swimming & Forest Walks",
      experienceDescription: "The highlight of our stay was the wild swimming in Lough Hyne. The water was surprisingly warm and crystal clear - we could see fish swimming beneath us. After our swim, we explored the ancient oak woods surrounding the lake. The forest paths are well-marked and offer stunning views of the marine nature reserve.",
      recommendation: "Bring a wetsuit if visiting in winter months, though the water temperature is surprisingly mild year-round. The forest walk takes about 45 minutes and is suitable for all fitness levels.",
      photos: [
        "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400", // Wild swimming in clear lake water
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"  // Sunlit forest path through ancient trees
      ],
      isApproved: true,
      isPublic: true,
      createdAt: "2024-02-21T14:20:00Z"
    },
    {
      id: 4,
      guestName: "Claire",
      stayDate: "2024-03-05",
      experienceTitle: "Bread Making & Local Food Discovery",
      experienceDescription: "The bread making workshop with Steven was absolutely wonderful! Learning to use the traditional wood-fired oven and understanding the slow fermentation process was fascinating. We made sourdough from scratch and enjoyed it warm with local honey. Steven also shared stories about West Cork's food heritage and recommended the best local producers.",
      recommendation: "Book the morning session to enjoy fresh bread for lunch. Ask Steven about his favorite local food spots - his recommendations led us to discover some incredible artisan producers in Skibbereen.",
      photos: [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", // Hands kneading bread dough
        "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"  // Fresh sourdough loaves on wooden table
      ],
      isApproved: true,
      isPublic: true,
      createdAt: "2024-03-06T11:15:00Z"
    }
  ];
}