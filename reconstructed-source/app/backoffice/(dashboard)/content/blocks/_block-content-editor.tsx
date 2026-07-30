'use client';

import { Star } from 'lucide-react';

import { ImagePicker } from '@/components/admin/image-picker';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getFieldsForType } from '@/lib/block-fields';
import { cn } from '@/lib/utils';

export function BlockContentEditor({
  type,
  value,
  onChange,
}: {
  type: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  const fields = getFieldsForType(type);
  const setField = (key: string, next: string) =>
    onChange({ ...value, [key]: next });

  const renderFields = (urdu: boolean) => {
    const selected = fields.filter((field) =>
      urdu ? field.key.endsWith('Ur') : !field.key.endsWith('Ur'),
    );
    return (
      <div className="grid grid-cols-2 gap-4">
        {selected.map((field) => (
          <div
            key={field.key}
            className={cn('space-y-2', field.multiline && 'col-span-2')}
          >
            <Label htmlFor={`block-${field.key}`}>{field.label}</Label>
            {field.key === 'rating' ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setField(field.key, String(rating))}
                    className={cn(
                      'transition-colors',
                      rating <= Number(value[field.key] || 0)
                        ? 'text-yellow-500'
                        : 'text-muted-foreground/30',
                    )}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {value[field.key] || 0}/5
                </span>
              </div>
            ) : field.richtext ? (
              <RichTextEditor
                value={value[field.key] || ''}
                onChange={(next) => setField(field.key, next)}
                placeholder={field.placeholder}
              />
            ) : /image/i.test(field.key) ? (
              <ImagePicker
                value={value[field.key] || ''}
                onChange={(next) => setField(field.key, next)}
                label={field.label}
              />
            ) : field.multiline ? (
              <Textarea
                id={`block-${field.key}`}
                rows={4}
                value={value[field.key] || ''}
                placeholder={field.placeholder}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            ) : (
              <Input
                id={`block-${field.key}`}
                type={field.type === 'number' ? 'number' : 'text'}
                value={value[field.key] || ''}
                placeholder={field.placeholder}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No structured fields for this block type.
      </p>
    );
  }

  return (
    <Tabs defaultValue="en">
      <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg p-1">
        <TabsTrigger value="en">English</TabsTrigger>
        <TabsTrigger value="ur">اردو (Urdu)</TabsTrigger>
      </TabsList>
      <TabsContent value="en" className="mt-4">
        {renderFields(false)}
      </TabsContent>
      <TabsContent value="ur" className="mt-4" dir="rtl">
        {renderFields(true)}
      </TabsContent>
    </Tabs>
  );
}
