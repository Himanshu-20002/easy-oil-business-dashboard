import { NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { dbConnect } from '../../../lib/db';
import { Alert } from '../../../models/Alert';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const companyId = session.user.companyRef;
    if (!companyId) {
      return NextResponse.json(
        { success: false, message: 'No company profile found' },
        { status: 400 }
      );
    }

    const alerts = await Alert.find({
      $or: [
        { companyRef: companyId, dismissed: false },
        { isGlobal: true, dismissedBy: { $ne: companyId } }
      ]
    }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    console.error('Fetch alerts error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error fetching alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const companyId = session.user.companyRef;
    if (!companyId) {
      return NextResponse.json(
        { success: false, message: 'No company profile found' },
        { status: 400 }
      );
    }

    const { alertId } = await req.json();
    if (!alertId) {
      return NextResponse.json(
        { success: false, message: 'Alert ID required' },
        { status: 400 }
      );
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }

    if (alert.isGlobal) {
      await Alert.findByIdAndUpdate(alertId, {
        $addToSet: { dismissedBy: companyId }
      });
    } else {
      alert.dismissed = true;
      await alert.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Dismiss alert error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error dismissing alert' },
      { status: 500 }
    );
  }
}
