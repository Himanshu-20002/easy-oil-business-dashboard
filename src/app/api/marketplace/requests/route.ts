import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { TransportRequest } from '../../../../models/TransportRequest';
import { Transporter } from '../../../../models/Transporter';
import { Fleet } from '../../../../models/Fleet';
import { Quote } from '../../../../models/Quote';
import { Order } from '../../../../models/Order';


export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const companyId = session.user.companyRef;

    // Read optional orderId query parameter
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get('orderId');

    let requests;
    if (session.user.role === 'customer') {
      if (!companyId) {
        return NextResponse.json({ success: false, message: 'No associated company profile found' }, { status: 400 });
      }
      const filter: any = { companyRef: companyId };
      if (orderIdParam) {
        const query = orderIdParam.match(/^[0-9a-fA-F]{24}$/) ? { _id: orderIdParam } : { orderId: orderIdParam };
        const order = await Order.findOne(query);
        if (order) {
          filter.orderRef = order._id;
        } else {
          filter.orderRef = orderIdParam;
        }
      }
      requests = await TransportRequest.find(filter).populate('orderRef').sort({ createdAt: -1 });
    } else {
      const filter: any = {};
      if (orderIdParam) {
        const query = orderIdParam.match(/^[0-9a-fA-F]{24}$/) ? { _id: orderIdParam } : { orderId: orderIdParam };
        const order = await Order.findOne(query);
        if (order) {
          filter.orderRef = order._id;
        } else {
          filter.orderRef = orderIdParam;
        }
      }
      requests = await TransportRequest.find(filter).populate('companyRef').populate('orderRef').sort({ createdAt: -1 });
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

    const { pickupLocation, deliveryLocation, fuelType, quantityKl, requiredDate, specialInstructions, orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'A bidding request must be linked to an active fuel order.' }, { status: 400 });
    }

    if (!pickupLocation || !deliveryLocation || !fuelType || !quantityKl || !requiredDate) {
      return NextResponse.json({ success: false, message: 'Missing required request fields' }, { status: 400 });
    }

    const orderQuery = orderId.match(/^[0-9a-fA-F]{24}$/) ? { _id: orderId } : { orderId: orderId };
    const order = await Order.findOne({ ...orderQuery, companyRef: companyId });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Associated fuel order not found or unauthorized.' }, { status: 400 });
    }

    const linkedOrderRef = order._id;

    // Create the request
    const transportRequest = await TransportRequest.create({
      companyRef: companyId,
      orderRef: linkedOrderRef,
      pickupLocation,
      deliveryLocation,
      fuelType,
      quantityKl,
      requiredDate: new Date(requiredDate),
      specialInstructions: specialInstructions || '',
      status: 'OPEN_FOR_BIDDING'
    });

    if (linkedOrderRef) {
      await Order.findByIdAndUpdate(linkedOrderRef, {
        transportRequestRef: transportRequest._id,
        transportStatus: 'BIDDING',
        deliveryETA: new Date(requiredDate)
      });
    }

    // Batch query existing Transporters and Fleets to minimize database roundtrips
    const mockTransporterData = [
      { name: 'FuelExpress Logistics', rating: 4.8, completed: 150, baseRate: 12000, license: 'DL-1AA-1234' },
      { name: 'TransportHub Pro', rating: 4.6, completed: 200, baseRate: 12500, license: 'MH-02B-5678' },
      { name: 'Regional Haulers', rating: 4.5, completed: 85, baseRate: 11500, license: 'HR-55C-9012' }
    ];
    const tNames = mockTransporterData.map(t => t.name);
    const existingTransporters = await Transporter.find({ companyName: { $in: tNames } });
    const transporterMap = new Map(existingTransporters.map(t => [t.companyName, t]));

    const existingTransporterIds = existingTransporters.map(t => t._id);
    const existingFleets = await Fleet.find({ transporterRef: { $in: existingTransporterIds } });
    const fleetMap = new Map(existingFleets.map(f => [f.transporterRef.toString(), f]));

    for (const tData of mockTransporterData) {
      let transporter = transporterMap.get(tData.name);
      if (!transporter) {
        transporter = await Transporter.create({
          companyName: tData.name,
          ownerName: `${tData.name.split(' ')[0]} Operator`,
          mobile: '+919999988888',
          email: `${tData.name.toLowerCase().replace(' ', '')}@easyoil-logistics.com`,
          gstNumber: `27AAAAA${Math.floor(1000 + Math.random() * 9000)}A1Z${Math.floor(1 + Math.random() * 9)}`,
          address: 'Logistics Park, Phase 1',
          serviceArea: 'Delhi NCR',
          vehicleCapacity: 20,
          serviceRegions: ['Mumbai', 'Delhi', 'Noida', 'Gurugram'],
          verificationStatus: 'VERIFIED',
          rating: tData.rating,
          completedDeliveries: tData.completed
        });
        transporterMap.set(tData.name, transporter);
      }

      let vehicle = fleetMap.get(transporter._id.toString());
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
        fleetMap.set(transporter._id.toString(), vehicle);
      }

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
