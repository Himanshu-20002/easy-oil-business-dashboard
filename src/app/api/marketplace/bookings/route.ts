import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { TransportRequest } from '../../../../models/TransportRequest';
import { Quote } from '../../../../models/Quote';
import { Booking } from '../../../../models/Booking';
import { BookingTimeline } from '../../../../models/BookingTimeline';
import { Fleet } from '../../../../models/Fleet';
import { Order } from '../../../../models/Order';


export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const companyId = session.user.companyRef;
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (bookingId) {
      // Fetch details for a specific booking and its timeline
      const booking = await Booking.findById(bookingId)
        .populate('requestRef')
        .populate('quoteRef')
        .populate('companyRef')
        .populate('transporterRef')
        .populate('fleetRef');

      if (!booking) {
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
      }

      const timeline = await BookingTimeline.find({ bookingRef: bookingId }).sort({ createdAt: 1 });
      return NextResponse.json({ success: true, booking, timeline });
    }

    let bookings;
    if (session.user.role === 'customer') {
      if (!companyId) {
        return NextResponse.json({ success: false, message: 'No associated company profile found' }, { status: 400 });
      }
      bookings = await Booking.find({ companyRef: companyId })
        .populate('requestRef')
        .populate('transporterRef')
        .sort({ createdAt: -1 });
    } else if (session.user.role === 'transporter') {
      const transporterRef = (session.user as any).transporterRef;
      if (!transporterRef) {
        return NextResponse.json({ success: false, message: 'No transporter profile associated with this account' }, { status: 400 });
      }
      bookings = await Booking.find({ transporterRef })
        .populate('requestRef')
        .populate('companyRef')
        .populate('transporterRef')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find()
        .populate('requestRef')
        .populate('companyRef')
        .populate('transporterRef')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching bookings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { requestId, quoteId } = await req.json();

    if (!requestId || !quoteId) {
      return NextResponse.json({ success: false, message: 'Request ID and Quote ID are required' }, { status: 400 });
    }

    const transportRequest = await TransportRequest.findById(requestId);
    if (!transportRequest) {
      return NextResponse.json({ success: false, message: 'Transport request not found' }, { status: 404 });
    }

    const quote = await Quote.findById(quoteId).populate('fleetRef');
    if (!quote) {
      return NextResponse.json({ success: false, message: 'Quote not found' }, { status: 404 });
    }

    // Update quote statuses
    quote.status = 'ACCEPTED';
    await quote.save();

    await Quote.updateMany(
      { requestRef: requestId, _id: { $ne: quoteId } },
      { status: 'REJECTED' }
    );

    // Update TransportRequest status
    transportRequest.status = 'BOOKED';
    transportRequest.selectedQuoteRef = quoteId;
    await transportRequest.save();

    // Commission calculations (3% of bid amount)
    const bookingAmount = quote.quotedAmount;
    const commissionRate = 0.03; // 3%
    const commissionAmount = bookingAmount * commissionRate;
    const platformRevenue = commissionAmount;

    const fleet = quote.fleetRef as any;

    // Create the booking
    const booking = await Booking.create({
      requestRef: requestId,
      quoteRef: quoteId,
      companyRef: transportRequest.companyRef,
      transporterRef: quote.transporterRef,
      fleetRef: quote.fleetRef,
      driverName: fleet?.driverName || 'Ramesh Singh',
      driverMobile: fleet?.driverMobile || '+919876543210',
      bookingAmount,
      commissionAmount,
      platformRevenue,
      status: 'BOOKED'
    });

    // Link the new Booking to the parent Order
    const linkedOrder = await Order.findOne({ transportRequestRef: requestId });
    if (linkedOrder) {
      linkedOrder.bookingRef = booking._id;
      linkedOrder.transportStatus = 'TRANSPORT_BOOKED';
      await linkedOrder.save();
    }

    // Create initial timeline audit log
    await BookingTimeline.create({
      bookingRef: booking._id,
      status: 'BOOKED',
      remarks: 'Transport request accepted and booking generated successfully.',
      updatedBy: 'System Automator'
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json({ success: false, message: 'Server error processing booking' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { bookingId, status, remarks } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ success: false, message: 'Booking ID and Status are required' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking record not found' }, { status: 404 });
    }

    booking.status = status;
    await booking.save();

    // Create timeline history entry
    await BookingTimeline.create({
      bookingRef: bookingId,
      status,
      remarks: remarks || `Shipment status progressed to ${status.replace('_', ' ')}.`,
      updatedBy: session.user.name || 'Sales Officer'
    });

    // Handle transporter fleet status changes conditionally
    if (status === 'COMPLETED') {
      await Fleet.findByIdAndUpdate(booking.fleetRef, { status: 'ACTIVE' });
    } else if (status === 'DISPATCHED' || status === 'IN_TRANSIT') {
      await Fleet.findByIdAndUpdate(booking.fleetRef, { status: 'ON_TRIP' });
    }

    // Propagate status progression to linked Order
    const linkedOrder = await Order.findOne({ bookingRef: bookingId });
    if (linkedOrder) {
      if (status === 'DISPATCHED' || status === 'IN_TRANSIT') {
        linkedOrder.transportStatus = 'IN_TRANSIT';
        linkedOrder.status = 'in_transit';
      } else if (status === 'DELIVERED' || status === 'COMPLETED') {
        linkedOrder.transportStatus = 'DELIVERED';
        linkedOrder.status = 'delivered';
      } else {
        linkedOrder.transportStatus = 'TRANSPORT_BOOKED';
      }
      await linkedOrder.save();
    }


    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    return NextResponse.json({ success: false, message: 'Server error updating booking status' }, { status: 500 });
  }
}
