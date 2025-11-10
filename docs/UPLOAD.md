# Image Upload - Documentation

## Setup

1. Add environment variable:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

2. Get token from: https://vercel.com/dashboard/stores

## Usage

### Basic Upload (Create Mode)

```tsx
import { MultiUploader } from "@/components/ui/multi-uploader";

<MultiUploader
  onImagesChange={(urls) => {
    form.setValue("images", urls);
  }}
/>;
```

### With Existing Images (Edit Mode)

```tsx
import { MultiUploaderWithDefaults } from "@/components/ui/multi-uploader-with-defaults";

const existingImages = product.images.map((url, i) => ({
  id: `img-${i}`,
  url,
  fileName: url.split("/").pop(),
}));

<MultiUploaderWithDefaults
  defaultImages={existingImages}
  onImagesChange={(urls) => {
    form.setValue("images", urls);
  }}
  maxFiles={5}
/>;
```

## Features

- ✅ Chunk upload (5MB chunks) for large files
- ✅ Instant preview with loading overlay
- ✅ Auto retry (3x) on failure
- ✅ Multiple files support
- ✅ Drag & drop
- ✅ Edit mode with existing images
- ✅ File validation (type, size, count)

## Components

### MultiUploader

Basic uploader for create forms.

**Props:**

- `onImagesChange?: (urls: string[]) => void` - Callback when images change

### MultiUploaderWithDefaults

Advanced uploader with edit mode support.

**Props:**

- `defaultImages?: ExistingImage[]` - Existing images
- `onImagesChange?: (urls: string[]) => void` - Callback with all URLs
- `maxFiles?: number` - Max files (default: 10)
- `maxSize?: number` - Max size per file (default: 50MB)
- `accept?: Record<string, string[]>` - Accepted file types

## API Endpoints

- `POST /api/upload/chunk` - Upload file chunks
- `POST /api/upload/finalize` - Combine chunks and upload to Blob

## Configuration

Edit `lib/upload-utils.ts` to change chunk size:

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
```

## Troubleshooting

**Upload fails:**

- Check `BLOB_READ_WRITE_TOKEN` is set in `.env.local`
- Restart dev server after adding env var
- Verify token is valid

**Preview not showing:**

- Check file is valid image
- Check browser console for errors

**Existing images not loading:**

- Verify image URLs are valid
- Check CORS settings
