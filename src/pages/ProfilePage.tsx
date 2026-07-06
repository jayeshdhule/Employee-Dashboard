import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Calendar, User, Building2, Pencil, X, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useNotifications } from '../context/NotificationContext';
import { fetchProfile, updateProfile } from '../services/api';
import { formatDate } from '../utils/format';
import type { UserProfile } from '../types';

type EditableFields = Pick<UserProfile, 'name' | 'email' | 'phone' | 'location' | 'bio' | 'role'>;

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<EditableFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addNotification } = useNotifications();

  const isEditing = editForm !== null;

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      role: profile.role,
    });
    setErrors({});
  };

  const cancelEditing = () => {
    setEditForm(null);
    setErrors({});
  };

  const validate = (): boolean => {
    if (!editForm) return false;
    const newErrors: Record<string, string> = {};
    if (!editForm.name.trim()) newErrors.name = 'Name is required';
    if (!editForm.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!editForm.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!editForm || !validate()) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        location: editForm.location.trim(),
        bio: editForm.bio.trim(),
        role: editForm.role.trim(),
      });
      setProfile(updated);
      setEditForm(null);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information has been saved.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const readOnlyItems = [
    { icon: Calendar, label: 'Joined', value: formatDate(profile.joinDate) },
    { icon: User, label: 'Manager', value: profile.manager },
    { icon: Building2, label: 'Department', value: profile.department },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
          My Profile
        </h2>
        {!isEditing ? (
          <Button variant="secondary" onClick={startEditing} className="w-full sm:w-auto">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto">
            <Button variant="ghost" onClick={cancelEditing} className="w-full sm:w-auto">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
              <Check className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full ring-4 ring-brand-100 dark:ring-brand-900 shrink-0"
          />
          <div className="text-center sm:text-left w-full">
            {isEditing && editForm ? (
              <div className="space-y-3">
                <Input
                  label="Full Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  error={errors.name}
                />
                <Input
                  label="Job Title"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-brand-600 dark:text-brand-400 font-medium">{profile.role}</p>
                <Badge variant="success" className="mt-2">Active Employee</Badge>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        {isEditing && editForm ? (
          <textarea
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-y"
          />
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        {isEditing && editForm ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              error={errors.phone}
            />
            <Input
              label="Location"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="sm:col-span-2"
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Mail, label: 'Email', value: profile.email },
              { icon: Phone, label: 'Phone', value: profile.phone },
              { icon: MapPin, label: 'Location', value: profile.location },
              ...readOnlyItems,
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 min-w-0">
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800 shrink-0">
                  <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
