const PACKETA_API_KEY = import.meta.env.VITE_PACKETA_API_KEY || '';
const PACKETA_API_SECRET = import.meta.env.VITE_PACKETA_API_SECRET || '';

interface PacketaPoint {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

interface PacketaShipment {
  orderId: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  addressId?: string;
  value: number;
  weight?: number;
  cod?: number;
}

export async function createPacketaShipment(shipment: PacketaShipment): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
  if (!PACKETA_API_KEY || !PACKETA_API_SECRET) {
    console.warn('Packeta API credentials not configured');
    return { success: false, error: 'Packeta API není nakonfigurováno' };
  }

  try {
    return { success: true, trackingNumber: 'MOCK-TRACKING-' + Date.now() };
  } catch (error: any) {
    console.error('Packeta API error:', error);
    return { success: false, error: error.message };
  }
}

export async function getPacketaPoints(country: string = 'cz'): Promise<PacketaPoint[]> {
  if (!PACKETA_API_KEY) {
    console.warn('Packeta API key not configured');
    return [];
  }

  try {
    return [];
  } catch (error) {
    console.error('Error fetching Packeta points:', error);
    return [];
  }
}

export async function trackPacketaShipment(trackingNumber: string): Promise<{ status: string; events: any[] } | null> {
  if (!PACKETA_API_KEY) {
    return null;
  }

  try {
    return { status: 'pending', events: [] };
  } catch (error) {
    console.error('Error tracking Packeta shipment:', error);
    return null;
  }
}
