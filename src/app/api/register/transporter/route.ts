import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../../../../lib/db';
import { User } from '../../../../models/User';
import { Transporter } from '../../../../models/Transporter';
import { Fleet } from '../../../../models/Fleet';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      companyName,
      ownerName,
      mobile,
      email: rawEmail,
      password,
      serviceArea,
      vehicleCapacity
    } = body;

    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';

    // Validation
    if (!companyName || !ownerName || !mobile || !email || !password || !serviceArea || !vehicleCapacity) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check existing User email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email address is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name: ownerName,
      email,
      mobile,
      role: 'transporter',
      password: hashedPassword,
      isActive: true
    });

    // Create Transporter
    const transporter = await Transporter.create({
      userId: user._id,
      companyName,
      ownerName,
      mobile,
      email,
      serviceArea,
      vehicleCapacity: Number(vehicleCapacity),
      status: 'PENDING_APPROVAL',
      rating: 5.0
    });

    // Automatically create a default Fleet vehicle for the transporter so they can bid out-of-the-box
    const dummyPlate = `DL-1T-${Math.floor(1000 + Math.random() * 9000)}`;
    await Fleet.create({
      transporterRef: transporter._id,
      vehicleNumber: dummyPlate,
      vehicleType: `Tanker Truck (KL-${vehicleCapacity})`,
      capacityKl: Number(vehicleCapacity),
      driverName: ownerName,
      driverMobile: mobile,
      driverLicenseNumber: `DL-DRV${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'ACTIVE',
      gpsEnabled: true
    });

    // Link Transporter to User
    user.transporterRef = transporter._id;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Transporter registered successfully! Awaiting admin approval.',
      userId: user._id,
      transporterId: transporter._id
    });
  } catch (error: any) {
    console.error('[TRANSPORTER-REGISTER-ERROR]', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error during registration' },
      { status: 500 }
    );
  }
}
