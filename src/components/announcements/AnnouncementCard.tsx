import { useState } from 'react';
import { Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { summarizeAnnouncement, getAiProviderLabel } from '../../services/aiService';
import type { Announcement, AISummaryResult } from '../../types';
import { formatDateTime } from '../../utils/format';
import { cn } from '../../utils/helpers';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const priorityVariant = {
  high: 'danger' as const,
  medium: 'warning' as const,
  low: 'default' as const,
};

const sentimentLabels = {
  positive: { label: 'Positive', variant: 'success' as const },
  neutral: { label: 'Neutral', variant: 'default' as const },
  informative: { label: 'Informative', variant: 'info' as const },
};

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<AISummaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const isLongContent = announcement.content.length > 200;
  const displayContent =
    isLongContent && !showFullContent
      ? announcement.content.slice(0, 200) + '...'
      : announcement.content;

  const handleSummarize = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    setLoading(true);
    setShowSummary(true);
    try {
      const result = await summarizeAnnouncement(announcement.title, announcement.content);
      setSummary(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={priorityVariant[announcement.priority]}>
              {announcement.priority} priority
            </Badge>
            {announcement.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="info">{tag}</Badge>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {announcement.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {announcement.author} · {announcement.department} · {formatDateTime(announcement.publishedAt)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSummarize}
          loading={loading}
          className="w-full sm:w-auto shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">
            {summary ? (showSummary ? 'Hide' : 'Show') : 'AI'} Summary
          </span>
        </Button>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {displayContent}
      </p>

      {isLongContent && (
        <button
          onClick={() => setShowFullContent((prev) => !prev)}
          className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          {showFullContent ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showFullContent ? 'Show less' : 'Read more'}
        </button>
      )}

      {showSummary && (
        <div
          className={cn(
            'mt-4 rounded-lg border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-950/30 animate-fade-in',
          )}
        >
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-brand-600 dark:text-brand-400">
              <Sparkles className="h-4 w-4 animate-pulse-soft" />
              AI is analyzing this announcement...
            </div>
          ) : summary ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    AI Summary
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={sentimentLabels[summary.sentiment].variant}>
                    {sentimentLabels[summary.sentiment].label}
                  </Badge>
                  <Badge variant="info">{getAiProviderLabel(summary.provider)}</Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {summary.readingTimeMinutes} min read
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{summary.summary}</p>
              <ul className="space-y-1.5">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-brand-500 font-bold">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
