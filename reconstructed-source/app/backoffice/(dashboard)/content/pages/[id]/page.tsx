'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from 'react';
import { toast } from 'sonner';

import { SavingIndicator } from '@/components/admin/form-fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  adminDelete,
  adminFetch,
  adminPost,
  adminPut,
} from '@/lib/admin-api';
import {
  useKeyboardSave,
  useUnsavedChanges,
} from '@/lib/hooks/use-unsaved-changes';
import { cn } from '@/lib/utils';

import type {
  PageRecord,
  PageSectionRecord,
  ProductRecord,
} from '../../_types';
import {
  getSectionLabel,
  SECTION_CATALOG,
  type SectionCatalogItem,
} from './_section-catalog';
import { SectionConfigEditor } from './_section-config-editor';

const CATEGORY_LABELS = {
  content: 'Content',
  social: 'Social Proof',
  commerce: 'Commerce',
  media: 'Media',
  utility: 'Utility',
} as const;

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [productId, setProductId] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sections, setSections] = useState<PageSectionRecord[]>([]);
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');
  const [sectionCategory, setSectionCategory] = useState('all');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const page = useQuery({
    queryKey: ['page', id],
    queryFn: () =>
      adminFetch<PageRecord>(`/api/admin/content/pages/${id}`),
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });

  useEffect(() => {
    if (!page.data) return;
    setTitle(page.data.title);
    setSlug(page.data.slug);
    setProductId(page.data.productId || '');
    setActive(page.data.active);
    setDescription(String(page.data.parsedMeta?.description || ''));
    setKeywords(String(page.data.parsedMeta?.keywords || ''));
    setSections(
      (page.data.sections || []).map((section, index) => ({
        ...section,
        sortOrder: index,
        parsedConfig: section.parsedConfig || {},
      })),
    );
    setDirty(false);
  }, [page.data]);

  useUnsavedChanges(dirty);
  const markDirty = () => setDirty(true);

  const save = useMutation({
    mutationFn: async () => {
      await adminPut(`/api/admin/content/pages/${id}`, {
        title: title.trim(),
        slug: slug.trim(),
        productId: productId || null,
        active,
        meta: { description, keywords },
      });
      await adminPut(`/api/admin/content/pages/${id}/sections`, {
        sections: sections.map((section, index) => ({
          id: section.id,
          sectionType: section.sectionType,
          sortOrder: index,
          active: section.active,
          config: section.parsedConfig || {},
        })),
      });
    },
    onSuccess: () => {
      toast.success('Page saved successfully');
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ['page', id] });
      void queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to save page'),
  });

  const savePage = useCallback(() => {
    if (!save.isPending) save.mutate();
  }, [save]);
  useKeyboardSave(savePage);

  const addSection = useMutation({
    mutationFn: (item: SectionCatalogItem) =>
      adminPost<{ id: string }>(
        `/api/admin/content/pages/${id}/sections`,
        {
          sectionType: item.type,
          sortOrder: sections.length,
          config: {},
          active: true,
        },
      ),
    onSuccess: ({ id: sectionId }, item) => {
      setSections((current) => [
        ...current,
        {
          id: sectionId,
          pageId: id,
          sectionType: item.type,
          sortOrder: current.length,
          active: true,
          parsedConfig: {},
        },
      ]);
      setDirty(true);
      toast.success(`${item.label} section added`);
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to add section'),
  });

  const removeSection = useMutation({
    mutationFn: (sectionId: string) =>
      adminDelete(
        `/api/admin/content/pages/${id}/sections/${sectionId}`,
      ),
    onSuccess: (_, sectionId) => {
      setSections((current) =>
        current
          .filter((section) => section.id !== sectionId)
          .map((section, index) => ({ ...section, sortOrder: index })),
      );
      setDirty(true);
      toast.success('Section removed');
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to remove section'),
  });

  const deletePage = useMutation({
    mutationFn: () => adminDelete(`/api/admin/content/pages/${id}`),
    onSuccess: () => {
      toast.success('Page deleted');
      router.push('/backoffice/content/pages');
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to delete page'),
  });

  const updateSection = (
    sectionId: string,
    update: Partial<PageSectionRecord>,
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, ...update } : section,
      ),
    );
    setDirty(true);
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === sectionId);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next.map((section, currentIndex) => ({
        ...section,
        sortOrder: currentIndex,
      }));
    });
    setDirty(true);
  };

  const handleDrop = (targetId: string, event: DragEvent) => {
    event.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    setSections((current) => {
      const from = current.findIndex((item) => item.id === draggingId);
      const to = current.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
    setDirty(true);
    setDraggingId(null);
  };

  const filteredSections = useMemo(() => {
    const term = sectionSearch.trim().toLowerCase();
    return SECTION_CATALOG.filter(
      (item) =>
        (sectionCategory === 'all' || item.category === sectionCategory) &&
        (!term ||
          item.label.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)),
    );
  }, [sectionCategory, sectionSearch]);

  const editingSection = sections.find(
    (section) => section.id === editingSectionId,
  );

  if (page.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (page.error || !page.data) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-destructive">
          {page.error?.message || 'Page not found'}
        </p>
        <Button onClick={() => router.push('/backoffice/content/pages')}>
          Back to Pages
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/backoffice/content/pages')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Page</h1>
            {dirty ? (
              <p className="text-xs text-yellow-600">Unsaved changes</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(slug === 'home' ? '/' : `/pages/${slug}`, '_blank')
            }
          >
            <Eye className="mr-1 h-4 w-4" />
            Preview
          </Button>
          <SavingIndicator isSaving={save.isPending} />
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Page Details</h2>
            <p className="text-xs text-muted-foreground">
              Title, URL, product association, and search metadata
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={active}
              onCheckedChange={(checked) => {
                setActive(checked);
                markDirty();
              }}
            />
            <Label>{active ? 'Active' : 'Draft'}</Label>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="page-title">Title</Label>
            <Input
              id="page-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                markDirty();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page-slug">Slug</Label>
            <Input
              id="page-slug"
              value={slug}
              className="font-mono"
              onChange={(event) => {
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, ''),
                );
                markDirty();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Select
              value={productId || '_none'}
              onValueChange={(value) => {
                setProductId(value === '_none' ? '' : value);
                markDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="No Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No Product</SelectItem>
                {(products.data || []).map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="page-keywords">Meta Keywords</Label>
            <Input
              id="page-keywords"
              value={keywords}
              onChange={(event) => {
                setKeywords(event.target.value);
                markDirty();
              }}
              placeholder="keyword1, keyword2"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="page-description">Meta Description</Label>
            <Textarea
              id="page-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                markDirty();
              }}
              rows={2}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Page Sections</h2>
            <p className="text-xs text-muted-foreground">
              Reorder, configure, enable, or remove page sections.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Section
          </Button>
        </div>
        {sections.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No sections yet. Add a section to start building this page.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDraggingId(section.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(section.id, event)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-background p-3 transition-all',
                  draggingId === section.id &&
                    'opacity-50 ring-2 ring-primary/20',
                  !section.active && 'bg-muted/20 opacity-60',
                )}
              >
                <GripVertical className="h-5 w-5 cursor-grab touch-none text-muted-foreground hover:text-foreground" />
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                    section.active
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getSectionLabel(section.sectionType)}
                    </span>
                    {Object.keys(section.parsedConfig || {}).length > 0 ? (
                      <span className="rounded border px-1.5 py-0.5 text-xs">
                        {Object.keys(section.parsedConfig || {}).length}{' '}
                        overrides
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {SECTION_CATALOG.find(
                      (item) => item.type === section.sectionType,
                    )?.description || 'Custom section'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => moveSection(section.id, -1)}
                    disabled={index === 0}
                    title="Move section up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => moveSection(section.id, 1)}
                    disabled={index === sections.length - 1}
                    title="Move section down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      updateSection(section.id, { active: !section.active })
                    }
                    title={
                      section.active ? 'Disable section' : 'Enable section'
                    }
                  >
                    <Switch checked={section.active} aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingSectionId(section.id)}
                    title="Configure section"
                  >
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    disabled={removeSection.isPending}
                    onClick={() => {
                      if (window.confirm('Remove this section?')) {
                        removeSection.mutate(section.id);
                      }
                    }}
                    title="Remove section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Press{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+S
          </kbd>{' '}
          to save
        </p>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={deletePage.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Delete "${title}" and all of its sections? This cannot be undone.`,
              )
            ) {
              deletePage.mutate();
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Page
        </Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Choose a section type to add to this page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={sectionSearch}
                onChange={(event) => setSectionSearch(event.target.value)}
                placeholder="Search sections..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={sectionCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSectionCategory('all')}
              >
                All
              </Button>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <Button
                  key={value}
                  variant={sectionCategory === value ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSectionCategory(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {filteredSections.map((item) => {
                const added = sections.some(
                  (section) => section.sectionType === item.type,
                );
                return (
                  <button
                    key={item.type}
                    type="button"
                    disabled={added || addSection.isPending}
                    onClick={() => addSection.mutate(item)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                      added
                        ? 'cursor-default border-muted bg-muted/50'
                        : 'cursor-pointer hover:border-primary/30 hover:bg-muted/30',
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {item.label.slice(0, 1)}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.label}</span>
                        {added ? (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                            Added
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
              {filteredSections.length === 0 ? (
                <p className="col-span-2 py-4 text-center text-sm text-muted-foreground">
                  No sections match your search.
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter className="items-center justify-between border-t pt-2 sm:justify-between">
            <span className="text-xs text-muted-foreground">
              {sections.length} section{sections.length === 1 ? '' : 's'} added
            </span>
            <Button onClick={() => setAddOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={Boolean(editingSection)}
        onOpenChange={(open) => {
          if (!open) setEditingSectionId(null);
        }}
      >
        <SheetContent className="flex h-full w-[520px] max-w-[95vw] flex-col sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>
              {editingSection
                ? getSectionLabel(editingSection.sectionType)
                : 'Section'}
            </SheetTitle>
            <SheetDescription>
              Configure this section. Empty fields use storefront defaults.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {editingSection ? (
              <SectionConfigEditor
                sectionType={editingSection.sectionType}
                value={editingSection.parsedConfig || {}}
                onChange={(config) =>
                  updateSection(editingSection.id, { parsedConfig: config })
                }
              />
            ) : null}
          </div>
          <SheetFooter className="border-t pt-4">
            <Button onClick={() => setEditingSectionId(null)}>Done</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
