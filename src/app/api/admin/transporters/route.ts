import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { Transporter } from '../../../../models/Transporter';

export async function GET() {
  try {
    await dbConnect();
    const transporters = await Transporter.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, transporters });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch transporters' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { transporterId, status } = await req.json();

    if (!transporterId || !status) {
      return NextResponse.json(
        { success: false, message: 'Transporter ID and status are required' },
        { status: 400 }
      );
    }

    if (!['ACTIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status update value' },
        { status: 400 }
      );
    }

    const transporter = await Transporter.findById(transporterId);
    if (!transporter) {
      return NextResponse.json(
        { success: false, message: 'Transporter not found' },
        { status: 404 }
      );
    }

    transporter.status = status;
    // Set legacy verificationStatus for compatibility
    if (status === 'ACTIVE') {
      transporter.verificationStatus = 'VERIFIED';
    } else if (status === 'REJECTED') {
      transporter.verificationStatus = 'REJECTED';
    } else if (status === 'SUSPENDED') {
      transporter.verificationStatus = 'SUSPENDED';
    }
    
    await transporter.save();

    return NextResponse.json({
      success: true,
      message: `Transporter status updated to ${status}`,
      transporter
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error updating transporter' },
      { status: 500 }
    );
  }
}
