import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { User } from '../../../../models/User';
import { Company } from '../../../../models/Company';

/**
 * PRODUCTION DIAGNOSTICS ENDPOINT
 * Tests each step of registration to identify failure points
 * GET /api/db/register-test
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    checks: []
  };

  try {
    // 1. Check environment variables
    results.checks.push({
      name: 'Environment Variables',
      mongodbUriSet: !!process.env.MONGODB_URI,
      nextauthSecretSet: !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET,
      passed: !!process.env.MONGODB_URI
    });

    // 2. Test database connection
    console.log('[DIAG] Testing database connection...');
    const startDbTime = Date.now();
    try {
      await dbConnect();
      const dbConnectTime = Date.now() - startDbTime;
      results.checks.push({
        name: 'Database Connection',
        timeMs: dbConnectTime,
        passed: true,
        message: `Connected in ${dbConnectTime}ms`
      });
    } catch (dbError: any) {
      results.checks.push({
        name: 'Database Connection',
        passed: false,
        message: dbError?.message || 'Connection failed',
        error: String(dbError)
      });
    }

    // 3. Test User model query
    console.log('[DIAG] Testing User model...');
    try {
      const userCount = await User.countDocuments();
      results.checks.push({
        name: 'User Model Query',
        passed: true,
        totalUsers: userCount,
        message: `User model working, ${userCount} users in DB`
      });
    } catch (userError: any) {
      results.checks.push({
        name: 'User Model Query',
        passed: false,
        message: userError?.message || 'User query failed',
        error: String(userError)
      });
    }

    // 4. Test Company model query
    console.log('[DIAG] Testing Company model...');
    try {
      const companyCount = await Company.countDocuments();
      results.checks.push({
        name: 'Company Model Query',
        passed: true,
        totalCompanies: companyCount,
        message: `Company model working, ${companyCount} companies in DB`
      });
    } catch (companyError: any) {
      results.checks.push({
        name: 'Company Model Query',
        passed: false,
        message: companyError?.message || 'Company query failed',
        error: String(companyError)
      });
    }

    // 5. Test write permissions (create and delete)
    console.log('[DIAG] Testing database write permissions...');
    try {
      const testUser = await User.create({
        name: 'DIAGNOSTIC_TEST_USER',
        email: `diag-test-${Date.now()}@test.local`,
        mobile: '9999999999',
        password: 'testpass123',
        role: 'customer',
        isActive: false
      });

      await User.deleteOne({ _id: testUser._id });

      results.checks.push({
        name: 'Database Write Permissions',
        passed: true,
        message: 'Write/Delete operations successful'
      });
    } catch (writeError: any) {
      results.checks.push({
        name: 'Database Write Permissions',
        passed: false,
        message: writeError?.message || 'Write test failed',
        error: String(writeError)
      });
    }

    // 6. Validate PAN regex
    const testPan = 'ABCDE1234K';
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    results.checks.push({
      name: 'PAN Validation Regex',
      testPan,
      passed: panRegex.test(testPan),
      message: panRegex.test(testPan) ? 'PAN regex working' : 'PAN regex failed'
    });

    // 7. Validate Email regex
    const testEmail = 'test@example.com';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    results.checks.push({
      name: 'Email Validation Regex',
      testEmail,
      passed: emailRegex.test(testEmail),
      message: emailRegex.test(testEmail) ? 'Email regex working' : 'Email regex failed'
    });

    // Summary
    const passedChecks = results.checks.filter((c: any) => c.passed).length;
    results.summary = {
      totalChecks: results.checks.length,
      passedChecks,
      failedChecks: results.checks.length - passedChecks,
      allPassed: passedChecks === results.checks.length,
      status: passedChecks === results.checks.length ? 'HEALTHY' : 'UNHEALTHY'
    };

    console.log('[DIAG] Diagnostics complete:', results.summary);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[DIAG-ERROR] Unhandled diagnostic error:', error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: 'Diagnostic failed',
        message: error?.message,
        checks: results.checks,
        summary: {
          status: 'CRITICAL_ERROR',
          message: error?.message || 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
