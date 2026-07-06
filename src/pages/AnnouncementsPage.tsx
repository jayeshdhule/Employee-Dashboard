import { useEffect, useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { AnnouncementCard } from '../components/announcements/AnnouncementCard';
import { AnnouncementForm } from '../components/announcements/AnnouncementForm';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useNotifications } from '../context/NotificationContext';
import { createAnnouncement, fetchAnnouncements, fetchProfile } from '../services/api';
import { summarizeAllAnnouncements, getAiProviderLabel } from '../services/aiService';
import type { Announcement } from '../types';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [authorName, setAuthorName] = useState('Alex Morgan');
  const [authorDepartment, setAuthorDepartment] = useState('Engineering');
  const [loading, setLoading] = useState(true);
  const [digest, setDigest] = useState<{ text: string; provider: 'gemini' | 'local' } | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    Promise.all([fetchAnnouncements(), fetchProfile()])
      .then(([ann, profile]) => {
        setAnnouncements(ann);
        setAuthorName(profile.name);
        setAuthorDepartment(profile.department);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: Omit<Announcement, 'id' | 'publishedAt' | 'author'>) => {
    const created = await createAnnouncement(data, authorName);
    setAnnouncements((prev) => [created, ...prev]);
    addNotification({
      type: 'success',
      title: 'Announcement Published',
      message: `"${created.title}" is now live.`,
    });
  };

  const handleDigest = async () => {
    setDigestLoading(true);
    try {
      const result = await summarizeAllAnnouncements(announcements);
      setDigest({ text: result.digest, provider: result.provider });
    } finally {
      setDigestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            Company Announcements
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AnnouncementForm
          authorName={authorName}
          authorDepartment={authorDepartment}
          onSubmit={handleCreate}
        />
      </div>

      <Card className="bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950 dark:to-indigo-950 border-brand-200 dark:border-brand-800">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              AI Weekly Digest
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Get an AI-powered summary of all recent announcements
            </p>
          </div>
          <Button
            onClick={handleDigest}
            loading={digestLoading}
            variant="primary"
            className="w-full sm:w-auto shrink-0"
          >
            Generate Digest
          </Button>
        </CardHeader>
        {digest && (
          <div className="mt-4 animate-fade-in border-t border-brand-200 dark:border-brand-800 pt-4 space-y-2">
            <span className="inline-flex text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/50 px-2 py-0.5 rounded-full">
              {getAiProviderLabel(digest.provider)}
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{digest.text}</p>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="text-center py-12">
            <Plus className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No announcements yet. Create one to get started.
            </p>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>
    </div>
  );
}
