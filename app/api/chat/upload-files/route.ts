import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

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

    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
    };

    const isValidType = (type: string) => {
      if (mediaType === 'image') return allowedTypes.image.includes(type);
      if (mediaType === 'document') return allowedTypes.document.includes(type);
      if (mediaType === 'archive') return allowedTypes.archive.includes(type);
      return false;
    };

    if (!isValidType(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Expected ${mediaType} file but got ${file.type}` },
        { status: 400 }
      );
    }

    const maxSizes = {
      image: 10 * 1024 * 1024,    // 10MB for images
      document: 20 * 1024 * 1024, // 20MB for documents
      archive: 50 * 1024 * 1024   // 50MB for archives
    };

    const maxSize = maxSizes[mediaType as keyof typeof maxSizes];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${mediaType} is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    let result: UploadApiResponse;
    let finalUrl: string;
    
    if (mediaType === 'image') {
      // Handle image uploads
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadOptions = {
          folder: 'peer-aid-chat-attachments/images',
          resource_type: 'image' as const,
          allowed_formats: ['jpg', 'png', 'webp', 'gif'],
          public_id: `chat_img_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          overwrite: true,
          invalidate: true,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Image upload stream error:', error);
              reject(error);
            } else {
              resolve(result as UploadApiResponse);
            }
          }
        );

        uploadStream.write(buffer);
        uploadStream.end();
      });
      
      finalUrl = result.secure_url;
    } else {
      // Handle document and archive uploads (as raw files)
      const base64Data = buffer.toString('base64');
      const mimeType = file.type;
      
      try {
        result = await cloudinary.uploader.upload(
          `data:${mimeType};base64,${base64Data}`,
          {
            folder: `peer-aid-chat-attachments/${mediaType}s`,
            resource_type: 'raw',
            access_mode: 'public',
            type: 'upload',
            use_filename: false,
            unique_filename: true,
            public_id: `chat_${mediaType}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            overwrite: true,
            invalidate: true,
          }
        );
      } catch (uploadError) {
        console.error(`${mediaType} upload failed:`, uploadError);
        
        // Alternative approach: upload as auto resource type
        result = await cloudinary.uploader.upload(
          `data:${mimeType};base64,${base64Data}`,
          {
            folder: `peer-aid-chat-attachments/${mediaType}s`,
            resource_type: 'auto',
            access_mode: 'public',
            type: 'upload',
            public_id: `chat_${mediaType}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            overwrite: true,
            invalidate: true
          }
        );
      }
      
      finalUrl = result.secure_url;
    }

    // Generate file metadata
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = file.name;

    return NextResponse.json({
      permanentUrl: finalUrl,
      mediaType,
      publicId: result.public_id,
      fileName,
      fileSize: file.size,
      fileExtension,
      format: result.format,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat file upload error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid image file') || error.message.includes('Invalid file')) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a valid image, document, or archive file.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { error: 'File size exceeds the maximum allowed limit.' },
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