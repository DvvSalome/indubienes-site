import { NextRequest, NextResponse } from 'next/server';
import { uploadPropertyImage } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

// POST /api/properties/[id]/upload-image
// Accepts multipart/form-data with field `image` and forwards to WASI.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No se recibió la imagen' }, { status: 400 });
    }

    const description = (formData.get('description') as string | null) ?? undefined;
    const positionRaw = formData.get('position');
    const position = positionRaw ? Number(positionRaw) : undefined;
    const filename =
      file instanceof File && file.name ? file.name : `property-${id}-${Date.now()}.jpg`;

    const result = await uploadPropertyImage(id, file, filename, { description, position });

    if (result.status === 'success') {
      return NextResponse.json({ status: 'success', id_image: result.id_image });
    }
    return NextResponse.json({ error: result.message }, { status: 400 });
  } catch (error) {
    console.error('Error uploading property image:', error);
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
  }
}
