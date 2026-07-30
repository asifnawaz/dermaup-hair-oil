'use client';

import {
  ChevronDown,
  ChevronRight,
  Info,
  Lock,
  Star,
  Unlock,
  X,
} from 'lucide-react';
import {
  useRef,
  useState,
  type HTMLInputTypeAttribute,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { ImagePicker } from '@/components/admin/image-picker';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface BaseFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description?: string;
  className?: string;
}

interface FormInputProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  type = 'text',
  placeholder,
  className,
}: FormInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ''}
              onChange={(event) =>
                field.onChange(
                  type === 'number'
                    ? event.target.value === ''
                      ? ''
                      : Number(event.target.value)
                    : event.target.value,
                )
              }
            />
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}

interface FormTextareaProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
  rows?: number;
}

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  rows = 3,
  className,
}: FormTextareaProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Textarea
              id={name}
              placeholder={placeholder}
              rows={rows}
              {...field}
              value={field.value ?? ''}
            />
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}

interface FormSelectProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  placeholder = 'Select...',
  className,
}: FormSelectProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}

interface FormSwitchProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  onChangeExtra?: (checked: boolean) => void;
}

export function FormSwitch<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  onChangeExtra,
}: FormSwitchProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={className}>
          <div className="flex items-center gap-2">
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                onChangeExtra?.(checked);
              }}
            />
            <Label
              className="cursor-pointer"
              onClick={() => {
                const next = !field.value;
                field.onChange(next);
                onChangeExtra?.(next);
              }}
            >
              {label}
            </Label>
          </div>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
          {error ? (
            <p className="mt-1 text-xs text-destructive">{error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

type FormImagePickerProps<TFieldValues extends FieldValues> =
  BaseFieldProps<TFieldValues>;

export function FormImagePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
}: FormImagePickerProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-2', className)}>
          <Label>{label}</Label>
          <ImagePicker
            value={field.value ?? ''}
            onChange={field.onChange}
            label={label}
          />
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">{error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

export function HelpTooltip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
            className,
          )}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-64 p-3 text-sm">
        {text}
      </PopoverContent>
    </Popover>
  );
}

interface FormColorPickerProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
}

export function FormColorPicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
}: FormColorPickerProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const inputId = `${name}-color-picker`;
        return (
          <div className={cn('space-y-2', className)}>
            <Label htmlFor={name}>{label}</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Choose ${label}`}
                className="h-10 w-10 shrink-0 rounded-md border"
                style={{ backgroundColor: field.value || '#ffffff' }}
                onClick={() => document.getElementById(inputId)?.click()}
              />
              <input
                id={inputId}
                type="color"
                value={field.value || '#ffffff'}
                onChange={(event) => field.onChange(event.target.value)}
                className="sr-only"
              />
              <Input
                id={name}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder={placeholder}
                className="font-mono"
              />
            </div>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

interface FormTagInputProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
  separator?: string;
}

export function FormTagInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Type and press Enter...',
  separator = ',',
  className,
}: FormTagInputProps<TFieldValues>) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const tags = String(field.value || '')
          .split(separator)
          .map((tag) => tag.trim())
          .filter(Boolean);

        const addTag = (tag: string) => {
          const trimmed = tag.trim();
          if (!trimmed || tags.includes(trimmed)) return;
          field.onChange([...tags, trimmed].join(separator));
        };

        const removeTag = (index: number) => {
          field.onChange(
            tags.filter((_, currentIndex) => currentIndex !== index).join(separator),
          );
        };

        const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          const value = event.currentTarget.value;
          if (event.key === 'Enter' || event.key === separator) {
            event.preventDefault();
            addTag(value);
            event.currentTarget.value = '';
          } else if (
            event.key === 'Backspace' &&
            value.length === 0 &&
            tags.length > 0
          ) {
            removeTag(tags.length - 1);
          }
        };

        return (
          <div className={cn('space-y-2', className)}>
            <Label>{label}</Label>
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
                placeholder={tags.length === 0 ? placeholder : ''}
                onKeyDown={handleKeyDown}
                onBlur={(event) => {
                  addTag(event.currentTarget.value);
                  event.currentTarget.value = '';
                }}
              />
            </div>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

interface FormStarRatingProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  maxStars?: number;
}

export function FormStarRating<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  maxStars = 5,
  className,
}: FormStarRatingProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-2', className)}>
          <Label>{label}</Label>
          <div className="flex gap-1">
            {Array.from({ length: maxStars }, (_, index) => index + 1).map(
              (rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => field.onChange(rating)}
                  aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                >
                  <Star
                    className={cn(
                      'h-5 w-5',
                      rating <= Number(field.value || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/40',
                    )}
                  />
                </button>
              ),
            )}
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">{error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

interface FormCharCountProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
  maxLength: number;
  multiline?: boolean;
  rows?: number;
}

export function FormCharCount<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  maxLength,
  multiline = false,
  rows = 3,
  className,
}: FormCharCountProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const value = String(field.value ?? '');
        return (
          <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
              <Label htmlFor={name}>{label}</Label>
              <span
                className={cn(
                  'text-xs text-muted-foreground',
                  value.length > maxLength && 'text-destructive',
                )}
              >
                {value.length}/{maxLength}
              </span>
            </div>
            {multiline ? (
              <Textarea
                id={name}
                value={value}
                onChange={field.onChange}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
              />
            ) : (
              <Input
                id={name}
                value={value}
                onChange={field.onChange}
                placeholder={placeholder}
                maxLength={maxLength}
              />
            )}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

interface FormFieldGroupProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormFieldGroup({
  title,
  description,
  defaultOpen = true,
  children,
  className,
}: FormFieldGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('rounded-lg border', className)}>
      <div
        role="button"
        tabIndex={0}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {open ? (
        <div className="space-y-4 border-t px-4 pb-4 pt-2">{children}</div>
      ) : null}
    </div>
  );
}

interface LanguageTabsProps {
  enContent: ReactNode;
  urContent: ReactNode;
  settingsContent?: ReactNode;
  className?: string;
}

export function LanguageTabs({
  enContent,
  urContent,
  settingsContent,
  className,
}: LanguageTabsProps) {
  return (
    <Tabs defaultValue="en" className={className}>
      <TabsList
        className={cn(
          'grid w-full',
          settingsContent ? 'grid-cols-3' : 'grid-cols-2',
        )}
      >
        <TabsTrigger value="en">English</TabsTrigger>
        <TabsTrigger value="ur">Urdu</TabsTrigger>
        {settingsContent ? (
          <TabsTrigger value="settings">Settings</TabsTrigger>
        ) : null}
      </TabsList>
      <TabsContent value="en" className="mt-4">
        {enContent}
      </TabsContent>
      <TabsContent value="ur" className="mt-4" dir="rtl">
        {urContent}
      </TabsContent>
      {settingsContent ? (
        <TabsContent value="settings" className="mt-4">
          {settingsContent}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-muted-foreground/50">{icon}</div>
      ) : null}
      <h3 className="text-lg font-medium">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SavingIndicator({ isSaving }: { isSaving: boolean }) {
  if (!isSaving) return null;
  return (
    <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
      <div className="h-2 w-2 rounded-full bg-yellow-500" />
      Saving...
    </div>
  );
}

interface FormCurrencyInputProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  currency?: string;
  readOnly?: boolean;
}

export function FormCurrencyInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  currency = 'PKR',
  readOnly = false,
  className,
}: FormCurrencyInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-2', className)}>
          <Label htmlFor={name}>{label}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              {currency}
            </span>
            <Input
              id={name}
              type="number"
              value={field.value ?? ''}
              onChange={(event) =>
                field.onChange(
                  event.target.value === '' ? '' : Number(event.target.value),
                )
              }
              readOnly={readOnly}
              className={cn(
                'pl-12 font-mono tabular-nums',
                readOnly && 'cursor-not-allowed bg-muted/50',
              )}
            />
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">{error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

interface FormSlugInputProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  sourceValue?: string;
  prefix?: string;
}

export function FormSlugInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  sourceValue = '',
  prefix,
  className,
}: FormSlugInputProps<TFieldValues>) {
  const [unlocked, setUnlocked] = useState(false);
  const previousSource = useRef(sourceValue);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        if (!unlocked && sourceValue !== previousSource.current) {
          const generated = sourceValue
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          if (generated !== field.value) {
            setTimeout(() => field.onChange(generated), 0);
          }
          previousSource.current = sourceValue;
        }

        return (
          <div className={cn('space-y-2', className)}>
            <div className="flex items-center gap-1.5">
              <Label htmlFor={name}>{label}</Label>
              <button
                type="button"
                onClick={() => setUnlocked(!unlocked)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                title={
                  unlocked
                    ? 'Unlock to auto-generate'
                    : 'Lock to edit manually'
                }
              >
                {unlocked ? (
                  <Unlock className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
              </button>
            </div>
            <Input
              id={name}
              value={field.value ?? ''}
              onChange={(event) => {
                setUnlocked(true);
                field.onChange(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, ''),
                );
              }}
              placeholder="auto-generated-from-title"
              className="font-mono text-sm"
            />
            {prefix && field.value ? (
              <p className="text-xs text-muted-foreground">
                URL: {prefix}
                {field.value}
              </p>
            ) : null}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

interface FormRichTextProps<TFieldValues extends FieldValues>
  extends BaseFieldProps<TFieldValues> {
  placeholder?: string;
}

export function FormRichText<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
}: FormRichTextProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn('space-y-2', className)}>
          <Label>{label}</Label>
          <RichTextEditor
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder={placeholder}
          />
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">{error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}
