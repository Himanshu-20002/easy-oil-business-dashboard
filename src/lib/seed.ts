import bcrypt from 'bcryptjs';
import { dbConnect } from './db';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Application } from '../models/Application';
import { Document } from '../models/Document';
import { ActivityLog } from '../models/ActivityLog';
import { Transporter } from '../models/Transporter';
import { Fleet } from '../models/Fleet';
import { Quote } from '../models/Quote';
import { Booking } from '../models/Booking';
import { BookingTimeline } from '../models/BookingTimeline';
import { TransportRequest } from '../models/TransportRequest';
import { Alert } from '../models/Alert';

export async function seedDatabase() {
  await dbConnect();

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Application.deleteMany({}),
    Document.deleteMany({}),
    ActivityLog.deleteMany({}),
    Transporter.deleteMany({}),
    Fleet.deleteMany({}),
    Quote.deleteMany({}),
    Booking.deleteMany({}),
    BookingTimeline.deleteMany({}),
    TransportRequest.deleteMany({}),
    Alert.deleteMany({})
  ]);

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('iocl1234', 10);

  // 3. Create Users (Admin & Sales Officers)
  const admin = await User.findOneAndUpdate(
    { email: 'admin@easyoil.in' },
    {
      name: 'EasyOil Chief Administrator',
      email: 'admin@easyoil.in',
      mobile: '9876543210',
      role: 'admin',
      password: hashedPassword,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const officer1 = await User.findOneAndUpdate(
    { email: 'officer1@easyoil.in' },
    {
      name: 'Rajesh Kumar (Sales Officer)',
      email: 'officer1@easyoil.in',
      mobile: '9876543211',
      role: 'sales_officer',
      password: hashedPassword,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const officer2 = await User.findOneAndUpdate(
    { email: 'officer2@easyoil.in' },
    {
      name: 'Anjali Sharma (Sales Officer)',
      email: 'officer2@easyoil.in',
      mobile: '9876543212',
      role: 'sales_officer',
      password: hashedPassword,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Create active transporter
  const activeTransporterUser = await User.create({
    name: 'Raj Kumar',
    email: 'transporter@easyoil.in',
    mobile: '9876543210',
    role: 'transporter',
    password: hashedPassword,
    isActive: true
  });

  const activeTransporter = await Transporter.create({
    userId: activeTransporterUser._id,
    companyName: 'ABC Tankers',
    ownerName: 'Raj Kumar',
    mobile: '9876543210',
    email: 'transporter@easyoil.in',
    gstNumber: '27AAAAA1234A1Z1',
    serviceArea: 'Delhi NCR',
    vehicleCapacity: 10,
    status: 'ACTIVE',
    rating: 4.8
  });

  activeTransporterUser.transporterRef = activeTransporter._id;
  await activeTransporterUser.save();

  // Create default fleet vehicle for active transporter
  await Fleet.create({
    transporterRef: activeTransporter._id,
    vehicleNumber: 'DL-1AA-9999',
    vehicleType: 'Tanker Truck (KL-10)',
    capacityKl: 10,
    driverName: 'Raj Kumar',
    driverMobile: '9876543210',
    driverLicenseNumber: 'DL-LIC-98765A',
    status: 'ACTIVE',
    gpsEnabled: true
  });

  // Create pending transporter
  const pendingTransporterUser = await User.create({
    name: 'Vikram Singh',
    email: 'pending_transporter@easyoil.in',
    mobile: '9876543215',
    role: 'transporter',
    password: hashedPassword,
    isActive: true
  });

  const pendingTransporter = await Transporter.create({
    userId: pendingTransporterUser._id,
    companyName: 'Delta Transports',
    ownerName: 'Vikram Singh',
    mobile: '9876543215',
    email: 'pending_transporter@easyoil.in',
    gstNumber: '27BBBBB5678B1Z2',
    serviceArea: 'Mumbai',
    vehicleCapacity: 15,
    status: 'PENDING_APPROVAL',
    rating: 5.0
  });

  pendingTransporterUser.transporterRef = pendingTransporter._id;
  await pendingTransporterUser.save();

  await Fleet.create({
    transporterRef: pendingTransporter._id,
    vehicleNumber: 'MH-02-XX-8888',
    vehicleType: 'Tanker Truck (KL-15)',
    capacityKl: 15,
    driverName: 'Vikram Singh',
    driverMobile: '9876543215',
    driverLicenseNumber: 'MH-LIC-12345B',
    status: 'ACTIVE',
    gpsEnabled: true
  });

  // 4. Create Mock Companies & Applications in various states
  
  // Company A - Approved state
  const companyA = await Company.findOneAndUpdate(
    { gst: '27AAAAA1111A1Z1' },
    {
      companyName: 'Apex Industrial Fuels Ltd',
      firmType: 'Private Limited',
      gst: '27AAAAA1111A1Z1',
      pan: 'AAAAA1111A',
      address: 'Plot 42, MIDC Industrial Area, Andheri East',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400093',
      contactPerson: 'Suresh Patil',
      mobile: '9988776655',
      email: 'suresh@apexind.com'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const customerA = await User.findOneAndUpdate(
    { email: 'customera@apexind.com' },
    {
      name: 'Suresh Patil',
      email: 'customera@apexind.com',
      mobile: '9988776655',
      role: 'customer',
      password: hashedPassword,
      companyRef: companyA._id,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const applicationA = await Application.findOneAndUpdate(
    { applicationId: 'IOCL-2026-10001' },
    {
      applicationId: 'IOCL-2026-10001',
      companyRef: companyA._id,
      productType: 'HSD',
      quantity: 12000,
      location: 'Nagpur Depot Storage',
      storageAvailability: true,
      existingSupplier: 'HPCL',
      requirementStartDate: new Date('2026-06-01'),
      leadSource: 'Reference',
      status: 'approved',
      assignedOfficer: officer1._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationA._id, fileType: 'request_letter' },
    {
      applicationRef: applicationA._id,
      fileType: 'request_letter',
      fileName: 'request_letter_apex.pdf',
      fileUrl: '/uploads/mock/request_letter_apex.pdf',
      verificationStatus: 'verified',
      comments: 'Duly signed and stamped.'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationA._id, fileType: 'gst_certificate' },
    {
      applicationRef: applicationA._id,
      fileType: 'gst_certificate',
      fileName: 'gst_cert_apex.pdf',
      fileUrl: '/uploads/mock/gst_cert_apex.pdf',
      verificationStatus: 'verified',
      comments: 'Verified against government portal.'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Company B - Under Review state
  const companyB = await Company.findOneAndUpdate(
    { gst: '07BBBBB2222B2Z2' },
    {
      companyName: 'Bhartia Logistics Pvt Ltd',
      firmType: 'Private Limited',
      gst: '07BBBBB2222B2Z2',
      pan: 'BBBBB2222B',
      address: 'F-12, Okhla Phase 3',
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      contactPerson: 'Ramesh Bhartia',
      mobile: '9988776656',
      email: 'ramesh@bhartialogistics.com'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'customerb@bhartialogistics.com' },
    {
      name: 'Ramesh Bhartia',
      email: 'customerb@bhartialogistics.com',
      mobile: '9988776656',
      role: 'customer',
      password: hashedPassword,
      companyRef: companyB._id,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const applicationB = await Application.findOneAndUpdate(
    { applicationId: 'IOCL-2026-10002' },
    {
      applicationId: 'IOCL-2026-10002',
      companyRef: companyB._id,
      productType: 'LDO',
      quantity: 8000,
      location: 'Okhla Yard',
      storageAvailability: true,
      existingSupplier: '',
      requirementStartDate: new Date('2026-07-01'),
      status: 'under_review',
      assignedOfficer: officer1._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationB._id, fileType: 'request_letter' },
    {
      applicationRef: applicationB._id,
      fileType: 'request_letter',
      fileName: 'req_letter_bhartia.pdf',
      fileUrl: '/uploads/mock/req_letter_bhartia.pdf',
      verificationStatus: 'verified',
      comments: 'Looks correct.'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationB._id, fileType: 'gst_certificate' },
    {
      applicationRef: applicationB._id,
      fileType: 'gst_certificate',
      fileName: 'gst_bhartia.png',
      fileUrl: '/uploads/mock/gst_bhartia.png',
      verificationStatus: 'pending'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Company C - Correction Required state
  const companyC = await Company.findOneAndUpdate(
    { gst: '24CCCCC3333C3Z3' },
    {
      companyName: 'Chroma Polymers LLP',
      firmType: 'LLP',
      gst: '24CCCCC3333C3Z3',
      pan: 'CCCCC3333C',
      address: 'GIDC Sector 5, Gandhinagar',
      district: 'Gandhinagar',
      state: 'Gujarat',
      pincode: '382010',
      contactPerson: 'Mehta Shah',
      mobile: '9988776657',
      email: 'mehta@chromapolymers.com'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'customerc@chromapolymers.com' },
    {
      name: 'Mehta Shah',
      email: 'customerc@chromapolymers.com',
      mobile: '9988776657',
      role: 'customer',
      password: hashedPassword,
      companyRef: companyC._id,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const applicationC = await Application.findOneAndUpdate(
    { applicationId: 'IOCL-2026-10003' },
    {
      applicationId: 'IOCL-2026-10003',
      companyRef: companyC._id,
      productType: 'Bitumen',
      quantity: 25000,
      location: 'Vadodara Plant',
      storageAvailability: false,
      existingSupplier: 'BPCL',
      requirementStartDate: new Date('2026-08-15'),
      status: 'correction_required',
      assignedOfficer: officer2._id,
      remarks: [
        {
          author: officer2._id,
          authorName: 'Anjali Sharma (Sales Officer)',
          authorRole: 'sales_officer',
          text: 'The PAN Card uploaded is blurred. Please upload a clear scanned copy of your PAN card to proceed.',
          createdAt: new Date()
        }
      ]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationC._id, fileType: 'request_letter' },
    {
      applicationRef: applicationC._id,
      fileType: 'request_letter',
      fileName: 'request_letter_chroma.pdf',
      fileUrl: '/uploads/mock/request_letter_chroma.pdf',
      verificationStatus: 'verified',
      comments: 'Okay'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationC._id, fileType: 'pan_card' },
    {
      applicationRef: applicationC._id,
      fileType: 'pan_card',
      fileName: 'pan_blurry.jpg',
      fileUrl: '/uploads/mock/pan_blurry.jpg',
      verificationStatus: 'rejected',
      comments: 'Too blurry. Please re-upload.'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Company D - Submitted state
  const companyD = await Company.findOneAndUpdate(
    { gst: '03DDDDD4444D4Z4' },
    {
      companyName: 'Delta Engineering Works',
      firmType: 'Proprietorship',
      gst: '03DDDDD4444D4Z4',
      pan: 'DDDDD4444D',
      address: 'Industrial Area Phase 2, Ludhiana',
      district: 'Ludhiana',
      state: 'Punjab',
      pincode: '141003',
      contactPerson: 'Gurpreet Singh',
      mobile: '9988776658',
      email: 'gurpreet@deltaeng.com'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'customerd@deltaeng.com' },
    {
      name: 'Gurpreet Singh',
      email: 'customerd@deltaeng.com',
      mobile: '9988776658',
      role: 'customer',
      password: hashedPassword,
      companyRef: companyD._id,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const applicationD = await Application.findOneAndUpdate(
    { applicationId: 'IOCL-2026-10004' },
    {
      applicationId: 'IOCL-2026-10004',
      companyRef: companyD._id,
      productType: 'HSD',
      quantity: 15000,
      location: 'Ludhiana Yard',
      storageAvailability: true,
      requirementStartDate: new Date('2026-06-10'),
      status: 'submitted',
      assignedOfficer: null // Unassigned, admin can assign
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Document.findOneAndUpdate(
    { applicationRef: applicationD._id, fileType: 'gst_certificate' },
    {
      applicationRef: applicationD._id,
      fileType: 'gst_certificate',
      fileName: 'gst_delta.pdf',
      fileUrl: '/uploads/mock/gst_delta.pdf',
      verificationStatus: 'pending'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Company E - Draft state
  const companyE = await Company.findOneAndUpdate(
    { gst: '33EEEEE5555E5Z5' },
    {
      companyName: 'Eco-Green Synthetics Ltd',
      firmType: 'Private Limited',
      gst: '33EEEEE5555E5Z5',
      pan: 'EEEEE5555E',
      address: 'SIPCOT Industrial Park',
      district: 'Kanchipuram',
      state: 'Tamil Nadu',
      pincode: '602105',
      contactPerson: 'Srinivasan Iyer',
      mobile: '9988776659',
      email: 'srini@ecogreen.com'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'customere@ecogreen.com' },
    {
      name: 'Srinivasan Iyer',
      email: 'customere@ecogreen.com',
      mobile: '9988776659',
      role: 'customer',
      password: hashedPassword,
      companyRef: companyE._id,
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Application.findOneAndUpdate(
    { applicationId: 'IOCL-2026-10005' },
    {
      applicationId: 'IOCL-2026-10005',
      companyRef: companyE._id,
      productType: 'LDO',
      quantity: 5000,
      location: 'Kanchipuram Storage Depot',
      storageAvailability: false,
      requirementStartDate: new Date('2026-09-01'),
      status: 'draft'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 5. Create Activity Logs
  await ActivityLog.create([
    {
      action: 'Register',
      actor: admin._id,
      actorName: admin.name,
      actorRole: admin.role,
      metadata: { detail: 'System seeded by chief administrator' }
    },
    {
      action: 'Submit Application',
      actor: customerA._id,
      actorName: customerA.name,
      actorRole: customerA.role,
      metadata: { applicationId: 'IOCL-2026-10001' }
    },
    {
      action: 'Verify Document',
      actor: officer1._id,
      actorName: officer1.name,
      actorRole: officer1.role,
      metadata: { applicationId: 'IOCL-2026-10001', docType: 'gst_certificate' }
    },
    {
      action: 'Approve Application',
      actor: officer1._id,
      actorName: officer1.name,
      actorRole: officer1.role,
      metadata: { applicationId: 'IOCL-2026-10001' }
    }
  ]);

  // 6. Seed mock Alerts
  await Alert.create([
    {
      isGlobal: true,
      type: 'broadcast',
      message: 'Diesel prices are projected to rise by 2.4% starting midnight. Plan your procurements accordingly.',
      priority: 'warning',
      timestamp: new Date()
    },
    {
      isGlobal: true,
      type: 'broadcast',
      message: 'Logistics update: Dynamic route optimization is now active for all Delhi/NCR dispatch terminals.',
      priority: 'info',
      timestamp: new Date()
    },
    {
      companyRef: companyA._id,
      isGlobal: false,
      type: 'invoice_alert',
      message: 'GST Invoice clearance for transaction #489 is due tomorrow.',
      priority: 'warning',
      timestamp: new Date()
    },
    {
      companyRef: companyA._id,
      isGlobal: false,
      type: 'credit_alert',
      message: 'Company credit rating verified successfully by IOCL Chief Administrator.',
      priority: 'success',
      timestamp: new Date()
    }
  ]);

  return {
    users: 6,
    companies: 5,
    applications: 5
  };
}
