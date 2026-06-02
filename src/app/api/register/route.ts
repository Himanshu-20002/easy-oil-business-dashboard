import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../../../lib/db';
import { User } from '../../../models/User';
import { Company } from '../../../models/Company';
import { Application } from '../../../models/Application';

declare global {
  var registrationDebugLog: {
    lastAttempt?: {
      email?: string;
      companyName?: string;
      gst?: string;
      pan?: string;
      mobile?: string;
      createdAt: string;
    };
    lastResult?: {
      success: boolean;
      message: string;
      status: number;
    };
    lastError?: string;
  } | undefined;
}

global.registrationDebugLog = global.registrationDebugLog || {};

let registrationDebugAttempt: {
  email?: string;
  companyName?: string;
  gst?: string;
  pan?: string;
  mobile?: string;
} = {};

export async function POST(req: Request) {
  try {
    // Verify MongoDB connection is available before proceeding
    if (!process.env.MONGODB_URI) {
      console.error('[REGISTER-FAIL] MONGODB_URI environment variable is NOT set in production');
      return NextResponse.json(
        { success: false, message: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    console.log(`[REGISTER-START] NODE_ENV=${process.env.NODE_ENV}, attempting DB connection...`);
    await dbConnect();
    console.log('[REGISTER-SUCCESS] Database connected');

    const body = await req.json();
    console.log('[REGISTER-BODY] Received:', JSON.stringify({
      email: body.email,
      name: body.name,
      companyName: body.companyName,
      gst: body.gst,
      hasPassword: !!body.password,
      mobile: body.mobile
    }));

    const {
      name,
      email: rawEmail,
      mobile,
      password,
      companyName,
      firmType,
      gst: rawGst,
      pan: rawPan,
      address,
      district,
      state,
      pincode,
      contactPerson
    } = body;

    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
    const gst = rawGst ? rawGst.trim().toUpperCase() : '';
    const pan = rawPan ? rawPan.trim().toUpperCase() : '';

    registrationDebugAttempt = {
      email,
      companyName,
      gst,
      pan,
      mobile
    };

    // Validation checks
    if (!email || !password || !gst || !companyName || !mobile || !address || !district || !state || !pincode) {
      console.log('[REGISTER-VALIDATION] Missing mandatory fields:', {
        email: !!email, password: !!password, gst: !!gst, companyName: !!companyName,
        mobile: !!mobile, address: !!address, district: !!district, state: !!state, pincode: !!pincode
      });
      return NextResponse.json(
        { success: false, message: 'Missing mandatory fields' },
        { status: 400 }
      );
    }

    // 1. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[REGISTER-VALIDATION] Invalid email format:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // 2. Password strength validation (min 8 characters)
    if (password.length < 8) {
      console.log('[REGISTER-VALIDATION] Password too short');
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // 3. GST format validation (removed as requested)

    // 4. PAN format validation (10-char alphanumeric if provided)
    if (pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan)) {
        console.log('[REGISTER-VALIDATION] Invalid PAN format:', pan);
        return NextResponse.json(
          { success: false, message: 'Invalid PAN format. Must be a valid 10-character Indian PAN.' },
          { status: 400 }
        );
      }
    }

    // Check if email already exists (case-insensitive)
    console.log('[REGISTER-CHECK] Looking for existing user with email:', email);
    const existingUser = await User.findOne({ email: email.toLowerCase() }).collation({ locale: 'en', strength: 2 });
    if (existingUser) {
      console.log('[REGISTER-DUPLICATE] Email already registered:', email);
      return NextResponse.json(
        { success: false, message: 'Email address is already registered' },
        { status: 400 }
      );
    }

    // Check if GST is already registered
    console.log('[REGISTER-CHECK] Looking for existing company with GST:', gst);
    const existingCompany = await Company.findOne({ gst });
    if (existingCompany) {
      console.log('[REGISTER-DUPLICATE] GST already registered:', gst);
      return NextResponse.json(
        { success: false, message: 'GST Number is already registered' },
        { status: 400 }
      );
    }

    // Create Company
    console.log('[REGISTER-CREATE] Creating company:', companyName);
    const company = await Company.create({
      companyName,
      firmType,
      gst,
      pan,
      address,
      district,
      state,
      pincode,
      contactPerson: contactPerson || name,
      mobile: mobile,
      email: email.toLowerCase()
    });
    console.log('[REGISTER-CREATED] Company created:', company._id);

    // Hash Password
    console.log('[REGISTER-HASH] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    console.log('[REGISTER-CREATE] Creating user:', email);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      role: 'customer',
      password: hashedPassword,
      companyRef: company._id,
      isActive: true
    });
    console.log('[REGISTER-CREATED] User created:', user._id);

    // Create an initial draft Application automatically
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `IOCL-${year}-${randomNum}`;

    console.log('[REGISTER-CREATE] Creating application:', applicationId);
    await Application.create({
      applicationId,
      companyRef: company._id,
      status: 'draft'
    });
    console.log('[REGISTER-CREATED] Application created');

    const successResponse = {
      success: true,
      message: 'Registration successful! You can now log in.',
      userId: user._id
    };

    global.registrationDebugLog = {
      lastAttempt: {
        ...registrationDebugAttempt,
        createdAt: new Date().toISOString()
      },
      lastResult: {
        success: true,
        message: successResponse.message,
        status: 200
      }
    };

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error('[REGISTER-ERROR] Exception caught:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      mongooseError: error?.errors ? Object.keys(error.errors) : null
    });

    const errorMessage =
      error?.name === 'ValidationError'
        ? Object.values(error.errors || {}).map((err: any) => err.message).join(' | ')
        : error?.code === 11000
        ? `Duplicate record for ${Object.keys(error.keyValue || {}).join(', ')}: ${Object.values(error.keyValue || {}).join(', ')}`
        : error?.message || 'Server error during registration';

    const statusCode = error?.name === 'ValidationError' || error?.code === 11000 ? 400 : 500;

    console.log('[REGISTER-RESPONSE] Returning error:', { message: errorMessage, status: statusCode });

    global.registrationDebugLog = {
      lastAttempt: {
        ...registrationDebugAttempt,
        createdAt: new Date().toISOString()
      },
      lastResult: {
        success: false,
        message: errorMessage,
        status: statusCode
      },
      lastError: error?.stack || errorMessage
    };

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: statusCode }
    );
  }
}
