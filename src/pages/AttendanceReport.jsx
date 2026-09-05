import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import { apiFetch } from '../lib/api.js';

function MemberRow({ member }) {
  const initials = member.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className='flex items-center gap-3 py-2'>
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt=''
          className='h-8 w-8 shrink-0 rounded-full object-cover'
        />
      ) : (
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'>
          {initials || '?'}
        </div>
      )}
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium text-zinc-900 dark:text-white'>
          {member.fullName}
        </p>
        {member.unit && (
          <p className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
            {member.unit}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, tone, members }) {
  return (
    <Card>
      <div className='mb-3 flex items-center gap-2'>
        <Icon className={`h-4 w-4 ${tone}`} />
        <h2 className='font-medium text-zinc-900 dark:text-white'>{title}</h2>
        <span className='ml-auto text-sm text-zinc-500 dark:text-zinc-400'>
          {members.length}
        </span>
      </div>
      {members.length === 0 ? (
        <p className='py-4 text-center text-sm text-zinc-400 dark:text-zinc-500'>
          None
        </p>
      ) : (
        <div className='max-h-96 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800'>
          {members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function AttendanceReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/check-in/last-service')
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load attendance.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className='text-sm text-zinc-500 dark:text-zinc-400'>Loading…</p>;
  }

  if (error) {
    return <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>;
  }

  if (!data?.session) {
    return (
      <Card>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          No service has been checked into yet.
        </p>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
          {data.session.serviceName}
        </h1>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          {new Date(data.session.scheduledStart).toLocaleString()}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Section
          title='On time'
          icon={CheckCircle2}
          tone='text-emerald-500'
          members={data.onTime}
        />
        <Section
          title='Late'
          icon={Clock}
          tone='text-amber-500'
          members={data.late}
        />
        <Section
          title='Absent'
          icon={XCircle}
          tone='text-red-500'
          members={data.absent}
        />
      </div>
    </div>
  );
}
