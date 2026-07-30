'use client';

import {
  Check,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type MediaItem = {
  id: string;
  filename: string;
  alt?: string | null;
};

interface ImagePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export function ImagePicker({ value, onChange, label }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media', {
        credentials: 'include',
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: MediaItem[];
      };
      if (payload.success) setMedia(payload.data || []);
    } catch {
      // The deployed picker silently leaves the library empty on read errors.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void loadMedia();
  }, [loadMedia, open]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        toast.error('Choose a JPG, PNG, WebP, GIF, or SVG image');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error('Image must be smaller than 5 MB');
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const payload = (await response.json()) as {
          success?: boolean;
          data?: { id: string };
          error?: string;
        };
        if (!response.ok || !payload.success || !payload.data?.id) {
          toast.error(payload.error || 'Upload failed');
          return;
        }
        onChange(`/api/admin/media/${payload.data.id}/file`);
        setOpen(false);
        toast.success('Image uploaded');
      } catch {
        toast.error('Upload error');
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  };

  const handleSelect = (item: MediaItem) => {
    onChange(`/api/admin/media/${item.id}/file`);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {/* The picker supports both uploaded API paths and public URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label || 'Selected image'}
            className="h-24 w-24 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
            onClick={() => onChange('')}
            aria-label="Remove selected image"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="mr-1 h-4 w-4" />
            {value ? 'Change Image' : 'Select Image'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
            <DialogDescription>
              Choose from your media library or upload a new image.
            </DialogDescription>
          </DialogHeader>

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
            )}
          >
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleFileInput}
            />
            {uploading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop an image or click to upload
                </p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : media.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No images in library
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {media.map((item) => {
                const src = `/api/admin/media/${item.id}/file`;
                const selected = value === src;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-lg border-2 transition-colors',
                      selected
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent hover:border-primary/50',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={item.alt || item.filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {selected ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <Check className="h-6 w-6 text-primary" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
