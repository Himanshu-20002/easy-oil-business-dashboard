import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Alert } from '../../../../models/Alert';
import { Company } from '../../../../models/Company';

// GET list of active companies and all sent alerts (for admin console)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'sales_officer')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const companies = await Company.find({}, 'companyName _id gst state').sort({ companyName: 1 });
    const alerts = await Alert.find({}).populate('companyRef').sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, companies, alerts });
  } catch (error: any) {
    console.error('Fetch admin alerts data error:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching admin data' }, { status: 500 });
  }
}

// POST create a new notification/alert
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'sales_officer')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { message, priority, isGlobal, companyRef, type } = await req.json();

    if (!message || !priority) {
      return NextResponse.json({ success: false, message: 'Message and priority are required' }, { status: 400 });
    }

    const newAlert = await Alert.create({
      companyRef: isGlobal ? undefined : companyRef,
      isGlobal: !!isGlobal,
      type: type || (isGlobal ? 'broadcast' : 'price_alert'),
      message,
      priority,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true, alert: newAlert });
  } catch (error: any) {
    console.error('Create alert error:', error);
    return NextResponse.json({ success: false, message: 'Server error creating alert' }, { status: 500 });
  }
}

// DELETE an alert (remove it entirely from DB)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({ success: false, message: 'Alert ID is required' }, { status: 400 });
    }

    await Alert.findByIdAndDelete(alertId);
    return NextResponse.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error: any) {
    console.error('Delete alert error:', error);
    return NextResponse.json({ success: false, message: 'Server error deleting alert' }, { status: 500 });
  }
}
