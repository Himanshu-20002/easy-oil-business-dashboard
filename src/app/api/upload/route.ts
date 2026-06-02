import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // 2. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds maximum limit of 5MB' },
        { status: 400 }
      );
    }

    // 3. Validate file extension/mime type (pdf, png, jpg, jpeg only)
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save destination inside public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique name and sanitize
    const timestamp = Date.now();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${timestamp}_${baseName}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to local disk
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully!',
      fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: 'File upload failed' },
      { status: 500 }
    );
  }
}
