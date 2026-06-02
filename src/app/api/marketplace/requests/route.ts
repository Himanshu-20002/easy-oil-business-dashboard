import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { TransportRequest } from '../../../../models/TransportRequest';
import { Transporter } from '../../../../models/Transporter';
import { Fleet } from '../../../../models/Fleet';
import { Quote } from '../../../../models/Quote';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const companyId = session.user.companyRef;

    let requests;
    // Customers only see their own requests. Admins/Officers/Transporters see all.
    if (session.user.role === 'customer') {
      if (!companyId) {
        return NextResponse.json({ success: false, message: 'No associated company profile found' }, { status: 400 });
      }
      requests = await TransportRequest.find({ companyRef: companyId }).sort({ createdAt: -1 });
    } else {
      requests = await TransportRequest.find().populate('companyRef').sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch transport requests error:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const companyId = session.user.companyRef;
    if (!companyId) {
      return NextResponse.json({ success: false, message: 'No company profile associated' }, { status: 400 });
    }

    const { pickupLocation, deliveryLocation, fuelType, quantityKl, requiredDate, specialInstructions } = await req.json();

    if (!pickupLocation || !deliveryLocation || !fuelType || !quantityKl || !requiredDate) {
      return NextResponse.json({ success: false, message: 'Missing required request fields' }, { status: 400 });
    }

    // Create the request
    const transportRequest = await TransportRequest.create({
      companyRef: companyId,
      pickupLocation,
      deliveryLocation,
      fuelType,
      quantityKl,
      requiredDate: new Date(requiredDate),
      specialInstructions: specialInstructions || '',
      status: 'OPEN_FOR_BIDDING'
    });

    // Seed mock transporters, fleet, and quotes to make the marketplace fully interactive
    const mockTransporterData = [
      { name: 'FuelExpress Logistics', rating: 4.8, completed: 150, baseRate: 12000, license: 'DL-1AA-1234' },
      { name: 'TransportHub Pro', rating: 4.6, completed: 200, baseRate: 12500, license: 'MH-02B-5678' },
      { name: 'Regional Haulers', rating: 4.5, completed: 85, baseRate: 11500, license: 'HR-55C-9012' }
    ];

    for (const tData of mockTransporterData) {
      // Find or create Transporter
      let transporter = await Transporter.findOne({ companyName: tData.name });
      if (!transporter) {
        transporter = await Transporter.create({
          companyName: tData.name,
          ownerName: `${tData.name.split(' ')[0]} Operator`,
          mobile: '+919999988888',
          email: `${tData.name.toLowerCase().replace(' ', '')}@easyoil-logistics.com`,
          gstNumber: `27AAAAA${Math.floor(1000 + Math.random() * 9000)}A1Z${Math.floor(1 + Math.random() * 9)}`,
          address: 'Logistics Park, Phase 1',
          serviceRegions: ['Mumbai', 'Delhi', 'Noida', 'Gurugram'],
          verificationStatus: 'VERIFIED',
          rating: tData.rating,
          completedDeliveries: tData.completed
        });
      }

      // Find or create Fleet Vehicle
      let vehicle = await Fleet.findOne({ transporterRef: transporter._id });
      if (!vehicle) {
        vehicle = await Fleet.create({
          transporterRef: transporter._id,
          vehicleNumber: tData.license,
          vehicleType: 'Tanker Truck (KL-20)',
          capacityKl: 20,
          driverName: 'Ramesh Singh',
          driverMobile: '+919876543210',
          driverLicenseNumber: 'DL-LIC-9992388A',
          gpsEnabled: true,
          status: 'ACTIVE'
        });
      }

      // Create Quote/Bid for this request
      const priceVariation = Math.floor((Math.random() - 0.5) * 2000);
      await Quote.create({
        requestRef: transportRequest._id,
        transporterRef: transporter._id,
        fleetRef: vehicle._id,
        quotedAmount: tData.baseRate + priceVariation,
        estimatedHours: Math.floor(24 + Math.random() * 24),
        remarks: 'Direct delivery with active GPS tracking enabled.',
        status: 'PENDING'
      });
    }

    return NextResponse.json({ success: true, request: transportRequest });
  } catch (error: any) {
    console.error('Create transport request error:', error);
    return NextResponse.json({ success: false, message: 'Server error creating request' }, { status: 500 });
  }
}
