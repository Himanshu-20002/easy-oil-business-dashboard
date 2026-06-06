import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Order } from '../../../../models/Order';
import { Booking } from '../../../../models/Booking';
import { BookingTimeline } from '../../../../models/BookingTimeline';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    // Find the order, support both human-readable orderId and Mongo ObjectId
    const query = orderId.match(/^[0-9a-fA-F]{24}$/) ? { _id: orderId } : { orderId };
    
    const order = await Order.findOne(query)
      .populate({
        path: 'bookingRef',
        populate: [
          { path: 'transporterRef' },
          { path: 'fleetRef' }
        ]
      })
      .populate('transportRequestRef');

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    let timeline = [];
    if (order.bookingRef) {
      timeline = await BookingTimeline.find({ bookingRef: order.bookingRef._id }).sort({ createdAt: 1 });
    }

    return NextResponse.json({ success: true, order, timeline });
  } catch (error: any) {
    console.error('Fetch tracking info error:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching tracking info' }, { status: 500 });
  }
}
