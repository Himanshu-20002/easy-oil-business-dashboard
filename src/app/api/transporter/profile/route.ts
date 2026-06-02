import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Transporter } from '../../../../models/Transporter';
import { Fleet } from '../../../../models/Fleet';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'transporter') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const transporter = await Transporter.findOne({ userId: session.user.id });
    if (!transporter) {
      return NextResponse.json({ success: false, message: 'Transporter profile not found' }, { status: 404 });
    }

    const fleet = await Fleet.find({ transporterRef: transporter._id });

    return NextResponse.json({
      success: true,
      transporter,
      fleet
    });
  } catch (error: any) {
    console.error('Fetch transporter profile error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error fetching profile' },
      { status: 500 }
    );
  }
}
