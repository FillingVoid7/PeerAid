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
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      pdf: ['application/pdf']
    };

    const isValidType = (type: string) => {
      if (mediaType === 'image') return allowedTypes.image.includes(type);
      if (mediaType === 'pdf') return allowedTypes.pdf.includes(type);
      return false;
    };

    if (!isValidType(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Expected ${mediaType} file but got ${file.type}` },
        { status: 400 }
      );
    }

    const maxSizes = {
      image: 10 * 1024 * 1024, 
      pdf: 20 * 1024 * 1024     
    };

    const maxSize = maxSizes[mediaType as keyof typeof maxSizes];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${mediaType} is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    if (mediaType === 'pdf') {
      console.log('PDF Upload Debug:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bufferLength: buffer.length,
        firstBytes: buffer.slice(0, 10).toString('hex'),
        firstChars: buffer.toString('ascii', 0, 10)
      });
      
      if (!buffer.toString('ascii', 0, 4).startsWith('%PDF')) {
        console.error('Invalid PDF signature detected');
        return NextResponse.json(
          { error: 'Invalid PDF file - missing PDF signature' },
          { status: 400 }
        );
      }
    }
    
    let result: UploadApiResponse;
    let finalUrl: string;
    
    if (mediaType === 'pdf') {
      const base64Data = buffer.toString('base64');
      console.log('Base64 data length:', base64Data.length);
      
      try {
        result = await cloudinary.uploader.upload(
          `data:application/pdf;base64,${base64Data}`,
          {
            folder: 'peer-aid-media',
            resource_type: 'raw',
            format: 'pdf',
            access_mode: 'public',
            type: 'upload',
            use_filename: false,
            unique_filename: true,
            public_id: `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            overwrite: true,
            invalidate: true,
            allowed_formats: ['pdf']
          }
        );
      } catch (uploadError) {
        console.error('Standard PDF upload failed, trying alternative method:', uploadError);
        
        // Alternative approach: upload as auto resource type
        result = await cloudinary.uploader.upload(
          `data:application/pdf;base64,${base64Data}`,
          {
            folder: 'peer-aid-media',
            resource_type: 'auto',
            access_mode: 'public',
            type: 'upload',
            public_id: `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            overwrite: true,
            invalidate: true
          }
        );
      }
      
      console.log('PDF upload result:', {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        accessMode: result.access_mode,
        type: result.type,
        url: result.url,
        version: result.version
      });
      
      // Try multiple URL construction methods
      const urls = {
        direct: result.secure_url,
        manual_raw: cloudinary.url(result.public_id, {
          resource_type: 'raw',
          type: 'upload',
          secure: true,
          sign_url: false
        }),
        manual_auto: cloudinary.url(result.public_id, {
          resource_type: 'auto',
          type: 'upload',
          secure: true,
          sign_url: false
        }),
        basic: cloudinary.url(result.public_id, {
          secure: true,
          sign_url: false
        })
      };
      
      console.log('PDF URL options:', urls);
      
      // Use the direct URL from Cloudinary response
      finalUrl = result.secure_url;
    } else {
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadOptions = {
          folder: 'peer-aid-media',
          resource_type: 'image' as const,
          allowed_formats: ['jpg', 'png', 'webp'],
          public_id: `${mediaType}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          overwrite: true,
          invalidate: true
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Upload stream error:', error);
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
    }

    return NextResponse.json({
      permanentUrl: finalUrl,
      mediaType,
      publicId: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      format: result.format
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid image file') || error.message.includes('Invalid file')) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a valid image, video, or PDF file.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { error: 'File size exceeds the maximum allowed limit.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Upload preset')) {
        return NextResponse.json(
          { error: 'Upload configuration error. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
