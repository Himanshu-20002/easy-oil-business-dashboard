import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { dbConnect } from '../../../../lib/db';
import { Application } from '../../../../models/Application';
import { Company } from '../../../../models/Company';
import { Document } from '../../../../models/Document';
import { ActivityLog } from '../../../../models/ActivityLog';

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
        { success: false, message: 'No associated company profile' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      companyName,
      firmType,
      gst,
      pan,
      address,
      district,
      state,
      pincode,
      contactPerson,
      mobile,
      email,
      productType,
      quantity,
      location,
      storageAvailability,
      existingSupplier,
      requirementStartDate,
      documents, // array of { fileType, fileName, fileUrl }
      submit // boolean flag
    } = body;

    // 1. Update Company details
    const company = await Company.findByIdAndUpdate(
      companyId,
      {
        companyName,
        firmType,
        gst,
        pan,
        address,
        district,
        state,
        pincode,
        contactPerson,
        mobile,
        email: email ? email.toLowerCase() : session.user.email
      },
      { new: true }
    );

    // 2. Fetch or create active Application
    let application = await Application.findOne({ companyRef: companyId }).sort({ updatedAt: -1 });
    if (!application) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      application = new Application({
        applicationId: `IOCL-${year}-${randomNum}`,
        companyRef: companyId
      });
    }

    // 3. Update logistics details
    application.productType = productType || application.productType;
    application.quantity = quantity !== undefined && quantity !== '' ? Number(quantity) : application.quantity;
    application.location = location || application.location;
    application.storageAvailability = storageAvailability !== undefined ? Boolean(storageAvailability) : application.storageAvailability;
    application.existingSupplier = existingSupplier || application.existingSupplier;
    application.requirementStartDate = requirementStartDate ? new Date(requirementStartDate) : application.requirementStartDate;

    // Determine status
    let statusTransition = 'Save Draft';
    if (submit) {
      statusTransition = 'Submit Application';
      // Transition to submitted
      application.status = 'submitted';
    } else if (application.status === 'correction_required') {
      // Keep it correction required, or change to draft? We keep it as correction_required but save details
    } else {
      application.status = 'draft';
    }

    await application.save();

    // 4. Handle Documents
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        const existingDoc = await Document.findOne({
          applicationRef: application._id,
          fileType: doc.fileType
        });

        if (existingDoc) {
          // Update URL and reset verification state to pending if customer re-uploaded
          existingDoc.fileUrl = doc.fileUrl;
          existingDoc.fileName = doc.fileName;
          existingDoc.verificationStatus = 'pending';
          existingDoc.comments = '';
          await existingDoc.save();
        } else {
          // Create new record
          await Document.create({
            applicationRef: application._id,
            fileType: doc.fileType,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            verificationStatus: 'pending'
          });
        }
      }
    }

    // 5. Create Activity Log
    await ActivityLog.create({
      action: statusTransition,
      actor: session.user.id,
      actorName: session.user.name,
      actorRole: 'customer',
      metadata: {
        applicationId: application.applicationId,
        companyName: company?.companyName
      }
    });

    return NextResponse.json({
      success: true,
      message: submit ? 'Application submitted successfully for verification!' : 'Draft application saved successfully!',
      application,
      company
    });
  } catch (error: any) {
    console.error('Save application error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error saving application' },
      { status: 500 }
    );
  }
}
