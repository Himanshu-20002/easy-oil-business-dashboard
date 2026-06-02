import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../../../../lib/db';
import { User } from '../../../../models/User';
import { Company } from '../../../../models/Company';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' });
    }

    console.log('--- Diagnostic Test Login Start ---');
    console.log('Testing Email:', email);

    await dbConnect();
    console.log('Database connected successfully');

    const searchEmail = email.toString().toLowerCase().trim();
    const user = await User.findOne({ email: searchEmail });

    if (!user) {
      // Let's also check if any user exists at all or list a few emails
      const totalUsers = await User.countDocuments();
      const sampleUsers = await User.find({}, 'email role isActive').limit(5);
      return NextResponse.json({
        success: false,
        step: 'user_lookup',
        message: `User not found in database. Double check if the email exists.`,
        details: {
          searchEmail,
          totalUsersInDb: totalUsers,
          sampleUsersInDb: sampleUsers.map(u => ({ email: u.email, role: u.role, isActive: u.isActive }))
        }
      });
    }

    console.log('User found:', user.email, 'Role:', user.role, 'IsActive:', user.isActive);

    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        step: 'user_active_check',
        message: 'User is found but isActive is false or falsy.',
        details: {
          email: user.email,
          isActive: user.isActive
        }
      });
    }

    const isPasswordValid = await bcrypt.compare(password.toString(), user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        step: 'password_check',
        message: 'Password comparison failed.',
        details: {
          providedPasswordLength: password.length,
          storedHash: user.password
        }
      });
    }

    // Check company reference
    let company = null;
    if (user.companyRef) {
      try {
        company = await Company.findById(user.companyRef);
      } catch (err: any) {
        console.error('Error fetching company:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials are 100% valid and database check passed!',
      details: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyRef: user.companyRef ? user.companyRef.toString() : null,
        companyDetails: company ? { name: company.companyName, gst: company.gst } : null
      }
    });

  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({
      success: false,
      step: 'unhandled_exception',
      message: error?.message || 'Unknown error occurred during diagnostics',
      stack: error?.stack
    });
  }
}
