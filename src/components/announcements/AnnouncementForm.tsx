import { useState, type FormEvent } from 'react';
import { Sparkles, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { generateAnnouncementDraft } from '../../services/aiService';
import type { Announcement } from '../../types';
import { DEPARTMENTS } from '../../utils/format';

interface AnnouncementFormProps {
  authorName: string;
  authorDepartment: string;
  onSubmit: (data: Omit<Announcement, 'id' | 'publishedAt' | 'author'>) => Promise<void>;
}

export function AnnouncementForm({ authorName, authorDepartment, onSubmit }: AnnouncementFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('medium');
  const [department, setDepartment] = useState(authorDepartment);
  const [tags, setTags] = useState('');
  const [topic, setTopic] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('medium');
    setDepartment(authorDepartment);
    setTags('');
    setTopic('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (content.trim().length < 30) newErrors.content = 'Content must be at least 30 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrors({ topic: 'Enter a topic to generate' });
      return;
    }
    setGenerating(true);
    setErrors({});
    try {
      const draft = await generateAnnouncementDraft(topic.trim());
      setTitle(draft.title);
      setContent(draft.content);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        priority,
        department,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      resetForm();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Create Announcement
      </Button>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>Post a new company announcement as {authorName}</CardDescription>
        </div>
        <button
          onClick={() => {
            setOpen(false);
            resetForm();
          }}
          className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close form"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-4 dark:border-brand-700 dark:bg-brand-950/30">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            AI Draft Generator
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Topic"
              placeholder="e.g. Office closure on Friday"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              error={errors.topic}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerate}
              loading={generating}
              className="w-full sm:w-auto shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              Generate Draft
            </Button>
          </div>
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="Announcement title"
        />

        <div className="space-y-1.5">
          <label htmlFor="announcement-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Content
          </label>
          <textarea
            id="announcement-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Write your announcement..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-y min-h-[120px]"
          />
          {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Announcement['priority'])}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={DEPARTMENTS.filter((d) => d !== 'All').map((d) => ({ value: d, label: d }))}
          />
        </div>

        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. HR, policy, update (comma separated)"
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} className="w-full sm:w-auto">
            Publish Announcement
          </Button>
        </div>
      </form>
    </Card>
  );
}
