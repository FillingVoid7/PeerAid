import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as string;

    if (!file || !mediaType) {
      return NextResponse.json(
        { error: 'Missing file or mediaType' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/mov', 'video/quicktime'],
      pdf: ['application/pdf']
    };

    const isValidType = (type: string) => {
      if (mediaType === 'image') return allowedTypes.image.includes(type);
      if (mediaType === 'video') return allowedTypes.video.includes(type);
      if (mediaType === 'pdf') return allowedTypes.pdf.includes(type);
      return false;
    };

    if (!isValidType(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Expected ${mediaType} file but got ${file.type}` },
        { status: 400 }
      );
    }

    // File size validation (in bytes)
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 50 * 1024 * 1024, // 50MB
      pdf: 20 * 1024 * 1024     // 20MB
    };

    const maxSize = maxSizes[mediaType as keyof typeof maxSizes];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${mediaType} is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
    interface UploadStreamOptions {
      folder: string;
      resource_type: 'image' | 'video' | 'raw';
      allowed_formats: string[];
    }

    interface UploadStreamCallback {
      (error: unknown, result?: UploadApiResponse): void;
    }

    const uploadOptions: UploadStreamOptions = {
      folder: 'peer-aid-media',
      resource_type: mediaType === 'video' ? 'video' : mediaType === 'pdf' ? 'raw' : 'image',
      allowed_formats: mediaType === 'video' ? ['mp4', 'mov'] : 
                      mediaType === 'pdf' ? ['pdf'] : 
                      ['jpg', 'png', 'webp']
    };

    const uploadCallback: UploadStreamCallback = (error, result) => {
      if (error) reject(error);
      else resolve(result as UploadApiResponse);
    };

    const uploadStream: NodeJS.WritableStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      uploadCallback
    );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });

    return NextResponse.json({
      permanentUrl: result.secure_url,
      mediaType,
      publicId: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      format: result.format
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid image file')) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a valid image, video, or PDF file.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
