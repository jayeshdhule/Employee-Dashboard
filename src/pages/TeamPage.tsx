import { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { TeamMemberCard } from '../components/team/TeamMemberCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { fetchEmployees } from '../services/api';
import { DEPARTMENTS } from '../utils/format';
import type { Employee } from '../types';

export function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  const handleVoiceResult = useCallback((transcript: string) => {
    setSearch(transcript);
  }, []);

  const { isListening, isSupported, startListening, stopListening } =
    useVoiceSearch(handleVoiceResult);

  useEffect(() => {
    fetchEmployees()
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !debouncedSearch ||
        emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.role.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesDept = department === 'All' || emp.department === department;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, debouncedSearch, department, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {isSupported && (
          <Button
            variant={isListening ? 'danger' : 'secondary'}
            onClick={isListening ? stopListening : startListening}
            className="shrink-0"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Stop' : 'Voice Search'}
          </Button>
        )}
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          options={DEPARTMENTS.map((d) => ({ value: d, label: d === 'All' ? 'All Departments' : d }))}
          className="sm:w-48"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'remote', label: 'Remote' },
            { value: 'on-leave', label: 'On Leave' },
          ]}
          className="sm:w-40"
        />
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {filtered.length} of {employees.length} team members
        {isListening && (
          <span className="ml-2 text-brand-600 dark:text-brand-400 animate-pulse-soft">
            Listening...
          </span>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No team members match your search criteria
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((employee) => (
            <TeamMemberCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  );
}
