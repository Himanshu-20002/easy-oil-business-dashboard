import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Application } from '../../../../models/Application';
import { Company } from '../../../../models/Company';
import { User } from '../../../../models/User';
import { Document } from '../../../../models/Document';
import { ActivityLog } from '../../../../models/ActivityLog';

// GET: Fetch all applications
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'sales_officer' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch all applications, populate company details and officer details
    const applications = await Application.find()
      .populate('companyRef')
      .populate('assignedOfficer', 'name email')
      .sort({ updatedAt: -1 });

    // Fetch all sales officers to populate assign selection
    const officers = await User.find({ role: 'sales_officer' }, 'name email');

    // Fetch all documents
    const documents = await Document.find();

    return NextResponse.json({
      success: true,
      applications,
      officers,
      documents
    });
  } catch (error: any) {
    console.error('Fetch officer applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error loading applications' },
      { status: 500 }
    );
  }
}

// POST: Update application state, verify documents, assign officer, or add remark
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'sales_officer' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();

    const {
      applicationId,
      status, // 'under_review', 'correction_required', 'approved', 'rejected'
      assignedOfficerId, // User ObjectId
      documentUpdates, // array of { docId, verificationStatus: 'verified'/'rejected', comments }
      remarkText // new sales officer comment
    } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    const application = await Application.findById(applicationId).populate('companyRef');
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // 1. Update Officer Assignment
    if (assignedOfficerId !== undefined) {
      application.assignedOfficer = assignedOfficerId || null;
    }

    // 2. Add Remark
    if (remarkText) {
      application.remarks.push({
        author: session.user.id,
        authorName: session.user.name,
        authorRole: session.user.role,
        text: remarkText,
        createdAt: new Date()
      });
    }

    // 3. Update Status
    if (status) {
      application.status = status;
      if (status === 'approved' && application.companyRef) {
        const company = await Company.findById(application.companyRef);
        if (company) {
          if (!company.creditLimit || company.creditLimit === 0) {
            company.creditLimit = 1000000;
          }
          if (!company.availableCredit || company.availableCredit === 0) {
            company.availableCredit = company.creditLimit;
          }
          await company.save();
        }
      }
    }

    await application.save();

    // 4. Update Document verifications
    if (documentUpdates && Array.isArray(documentUpdates)) {
      for (const update of documentUpdates) {
        const { docId, verificationStatus, comments } = update;
        await Document.findByIdAndUpdate(docId, {
          verificationStatus,
          comments: comments || ''
        });
      }
    }

    // 5. Audit Log Action
    const companyRef = application.companyRef as any;

    await ActivityLog.create({
      action: status ? `Workflow Update: ${status}` : 'Update Application Details',
      actor: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      metadata: {
        applicationId: application.applicationId,
        companyName: companyRef?.companyName,
        status,
        remark: remarkText
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application details updated successfully!',
      application
    });
  } catch (error: any) {
    console.error('Update officer application error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error updating details' },
      { status: 500 }
    );
  }
}
