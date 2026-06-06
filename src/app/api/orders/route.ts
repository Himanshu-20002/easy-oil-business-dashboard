import { NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { dbConnect } from '../../../lib/db';
import { Order } from '../../../models/Order';
import { Company } from '../../../models/Company';
import { TransportRequest } from '../../../models/TransportRequest';
import { Transporter } from '../../../models/Transporter';
import { Fleet } from '../../../models/Fleet';
import { Quote } from '../../../models/Quote';


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

    const orders = await Order.find({ companyRef: companyId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error fetching orders' },
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

    const { orderId, product, quantity, deliveryETA } = await req.json();

    if (!orderId || !product || !quantity) {
      return NextResponse.json(
        { success: false, message: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Rate calculations: Diesel (HSD)=85, LDO=78, Bitumen=92
    const rate = product === 'HSD' ? 85 : product === 'LDO' ? 78 : 92;
    const totalCost = quantity * rate;

    // Get company credit and check
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Company not found' },
        { status: 404 }
      );
    }

    const currentCredit = company.availableCredit !== undefined ? company.availableCredit : 375000;
    if (totalCost > currentCredit) {
      return NextResponse.json(
        { success: false, message: 'Insufficient credit limit' },
        { status: 400 }
      );
    }

    // Deduct credit
    company.availableCredit = Math.max(0, currentCredit - totalCost);
    await company.save();

    // Create order record
    const etaDate = deliveryETA ? new Date(deliveryETA) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const newOrder = await Order.create({
      companyRef: companyId,
      orderId,
      product,
      quantity,
      status: 'processing',
      transportStatus: 'AWAITING_TRANSPORT',
      deliveryETA: etaDate
    });

    return NextResponse.json({ success: true, order: newOrder, availableCredit: company.availableCredit });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing order' },
      { status: 500 }
    );
  }
}
