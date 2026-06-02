import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Company } from '../../../../models/Company';

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

    const { companyName, address, contactPerson, mobile, email, district, state, pincode } = await req.json();

    // Basic validation
    if (!companyName || !contactPerson || !mobile || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required profile fields' },
        { status: 400 }
      );
    }

    // Update Company profile
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      {
        companyName,
        address,
        contactPerson,
        mobile,
        email,
        district,
        state,
        pincode
      },
      { new: true }
    );

    return NextResponse.json({ success: true, company: updatedCompany });
  } catch (error: any) {
    console.error('Update company profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error updating profile details' },
      { status: 500 }
    );
  }
}
