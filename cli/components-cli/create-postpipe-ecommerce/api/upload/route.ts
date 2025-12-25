import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({}, (error, result) => {
            if (error) {
                resolve(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ success: true, url: result?.secure_url }));
        }).end(buffer);
    });
}
