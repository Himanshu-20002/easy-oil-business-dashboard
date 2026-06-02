import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Quote } from '../../../../models/Quote';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      if (session.user.role === 'transporter') {
        const transporterRef = (session.user as any).transporterRef;
        if (!transporterRef) {
          return NextResponse.json({ success: false, message: 'No transporter profile associated' }, { status: 400 });
        }
        const quotes = await Quote.find({ transporterRef })
          .populate({
            path: 'requestRef',
            populate: { path: 'companyRef' }
          })
          .populate('fleetRef')
          .sort({ createdAt: -1 });
        return NextResponse.json({ success: true, quotes });
      }
      return NextResponse.json({ success: false, message: 'Request ID is required' }, { status: 400 });
    }

    const quotes = await Quote.find({ requestRef: requestId })
      .populate('transporterRef')
      .populate('fleetRef')
      .sort({ quotedAmount: 1 });

    return NextResponse.json({ success: true, quotes });
  } catch (error: any) {
    console.error('Fetch quotes error:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching quotes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { requestRef, transporterRef, fleetRef, quotedAmount, estimatedHours, remarks } = await req.json();

    if (!requestRef || !transporterRef || !fleetRef || !quotedAmount || !estimatedHours) {
      return NextResponse.json({ success: false, message: 'Missing required bid details' }, { status: 400 });
    }

    const newQuote = await Quote.create({
      requestRef,
      transporterRef,
      fleetRef,
      quotedAmount,
      estimatedHours,
      remarks: remarks || '',
      status: 'PENDING'
    });

    return NextResponse.json({ success: true, quote: newQuote });
  } catch (error: any) {
    console.error('Submit quote error:', error);
    return NextResponse.json({ success: false, message: 'Server error submitting quote' }, { status: 500 });
  }
}
