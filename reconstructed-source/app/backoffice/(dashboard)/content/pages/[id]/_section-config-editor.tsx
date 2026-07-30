'use client';

import { useMemo, useState } from 'react';

import { ImagePicker } from '@/components/admin/image-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  getFieldsForSectionType,
  type FieldDef,
} from '@/lib/section-fields';

type SectionConfigEditorProps = {
  sectionType: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

function JsonField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const initial = useMemo(
    () =>
      typeof value === 'string'
        ? value
        : value == null
          ? ''
          : JSON.stringify(value, null, 2),
    [value],
  );
  const [text, setText] = useState(initial);
  const [invalid, setInvalid] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`section-${field.key}`}>{field.label}</Label>
      <p className="text-xs text-muted-foreground">
        Enter a JSON array of policy blocks.
      </p>
      <Textarea
        id={`section-${field.key}`}
        value={text}
        rows={8}
        placeholder={field.placeholder}
        className="font-mono text-xs"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${field.key}-error` : undefined}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          if (!next.trim()) {
            setInvalid(false);
            onChange([]);
            return;
          }
          try {
            onChange(JSON.parse(next));
            setInvalid(false);
          } catch {
            setInvalid(true);
          }
        }}
      />
      {invalid ? (
        <p id={`${field.key}-error`} className="text-xs font-medium text-destructive">
          JSON is incomplete or invalid. The last valid value will be kept.
        </p>
      ) : null}
    </div>
  );
}

export function SectionConfigEditor({
  sectionType,
  value,
  onChange,
}: SectionConfigEditorProps) {
  const fields = getFieldsForSectionType(sectionType);
  if (fields.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        This section has no configurable overrides.
      </p>
    );
  }

  const setField = (key: string, next: unknown) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const current = value[field.key];
        if (field.type === 'switch') {
          return (
            <div
              key={field.key}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <Label htmlFor={`section-${field.key}`}>{field.label}</Label>
              <Switch
                id={`section-${field.key}`}
                checked={Boolean(current)}
                onCheckedChange={(checked) => setField(field.key, checked)}
              />
            </div>
          );
        }
        if (field.type === 'select') {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Select
                value={String(current ?? '') || '_default'}
                onValueChange={(next) =>
                  setField(field.key, next === '_default' ? '' : next)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options || []).map((option) => (
                    <SelectItem
                      key={option.value || '_default'}
                      value={option.value || '_default'}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (field.type === 'image') {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <ImagePicker
                value={String(current ?? '')}
                onChange={(next) => setField(field.key, next)}
                label={field.label}
              />
            </div>
          );
        }
        if (field.type === 'json') {
          return (
            <JsonField
              key={field.key}
              field={field}
              value={current}
              onChange={(next) => setField(field.key, next)}
            />
          );
        }
        if (field.type === 'color') {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`section-${field.key}`}>{field.label}</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={String(current || '#ffffff')}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className="h-10 w-12 rounded border bg-transparent"
                />
                <Input
                  id={`section-${field.key}`}
                  value={String(current ?? '')}
                  placeholder={field.placeholder}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          );
        }
        if (field.multiline) {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`section-${field.key}`}>{field.label}</Label>
              <Textarea
                id={`section-${field.key}`}
                value={String(current ?? '')}
                placeholder={field.placeholder}
                rows={3}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            </div>
          );
        }
        return (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`section-${field.key}`}>{field.label}</Label>
            <Input
              id={`section-${field.key}`}
              type={field.type === 'number' ? 'number' : 'text'}
              value={String(current ?? '')}
              placeholder={field.placeholder}
              onChange={(event) =>
                setField(
                  field.key,
                  field.type === 'number'
                    ? event.target.value === ''
                      ? ''
                      : Number(event.target.value)
                    : event.target.value,
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
}
