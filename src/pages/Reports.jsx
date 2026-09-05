import { useState } from 'react';

import { ClipboardCheck, HandCoins, Users, FileText } from 'lucide-react';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { apiDownload } from '../lib/api.js';

const reportTypes = [
  {
    id: 'general',
    title: 'General report',
    description: 'Department overview, attendance, members, and contributions',
    icon: FileText,
  },

  {
    id: 'attendance',
    title: 'Attendance report',
    description: 'Attendance records, on-time, late, and absent members',
    icon: ClipboardCheck,
  },

  {
    id: 'contributions',
    title: 'Contribution report',
    description: 'Recorded contributions, contributors, and total amounts',
    icon: HandCoins,
  },

  {
    id: 'members',
    title: 'Member report',
    description: 'Department member information and statistics',
    icon: Users,
  },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const [attendanceFrom, setAttendanceFrom] = useState('');
  const [attendanceTo, setAttendanceTo] = useState('');
  const [attendanceFormat, setAttendanceFormat] = useState('detailed');

  const [contributionFrom, setContributionFrom] = useState('');
  const [contributionTo, setContributionTo] = useState('');
  const [contributionFormat, setContributionFormat] = useState('detailed');

  const [memberReportOptions, setMemberReportOptions] = useState({
    contactInfo: true,
    unitInfo: true,
    statistics: true,
  });

  const [generating, setGenerating] = useState(false);
  const [generalFrom, setGeneralFrom] = useState('');
  const [generalTo, setGeneralTo] = useState('');
  const [generationError, setGenerationError] = useState('');

  const handleGenerateReport = async (reportType) => {
    setGenerating(true);
    setGenerationError('');

    if (
      (reportType === 'attendance' &&
        attendanceFrom &&
        attendanceTo &&
        attendanceFrom > attendanceTo) ||
      (reportType === 'contributions' &&
        contributionFrom &&
        contributionTo &&
        contributionFrom > contributionTo) ||
      (reportType === 'general' &&
        generalFrom &&
        generalTo &&
        generalFrom > generalTo)
    ) {
      setGenerationError('The From date cannot be later than the To date.');
      setGenerating(false);
      return;
    }

    try {
      const params = new URLSearchParams();

      params.set('type', reportType);

      if (reportType === 'attendance') {
        if (attendanceFrom) {
          params.set('from', attendanceFrom);
        }

        if (attendanceTo) {
          params.set('to', attendanceTo);
        }

        params.set('format', attendanceFormat);
      }

      if (reportType === 'contributions') {
        if (contributionFrom) {
          params.set('from', contributionFrom);
        }

        if (contributionTo) {
          params.set('to', contributionTo);
        }

        params.set('format', contributionFormat);
      }

      if (reportType === 'general') {
        if (generalFrom) {
          params.set('from', generalFrom);
        }

        if (generalTo) {
          params.set('to', generalTo);
        }
      }

      if (reportType === 'members') {
        params.set('contactInfo', String(memberReportOptions.contactInfo));

        params.set('unitInfo', String(memberReportOptions.unitInfo));

        params.set('statistics', String(memberReportOptions.statistics));
      }

      const blob = await apiDownload(`/reports/generate?${params.toString()}`);

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setGenerationError(err.message || 'Could not generate the report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className='flex flex-col gap-6 dark:text-white'>
      <div>
        <h1 className='font-display text-2xl font-semibold'>Reports</h1>

        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          Generate reports from your department records.
        </p>
      </div>

      <div>
        <h2 className='mb-3 font-display text-lg font-semibold'>Report type</h2>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const selected = selectedReport === report.id;

            return (
              <button
                key={report.id}
                type='button'
                onClick={() => setSelectedReport(report.id)}
                className={`text-left transition ${
                  selected ? 'ring-2 ring-brand-500 rounded-lg' : ''
                }`}
              >
                <Card>
                  <div className='flex items-start gap-4'>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? 'bg-brand-500 text-white'
                          : 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className='font-medium text-zinc-900 dark:text-white'>
                        {report.title}
                      </h3>

                      <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                        {report.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      {generationError && (
        <p className='text-sm text-red-600 dark:text-red-400'>
          {generationError}
        </p>
      )}

      {selectedReport && (
        <Card>
          <div className='mb-5'>
            <h2 className='font-display text-lg font-semibold'>
              Report options
            </h2>

            <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
              Configure the options for your selected report.
            </p>
          </div>

          {selectedReport === 'general' && (
            <div>
              <div className='mb-4'>
                <h3 className='text-sm font-medium text-zinc-900 dark:text-white'>
                  General report period
                </h3>

                <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                  Select the period you want included in the department
                  overview.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-sm font-medium'>
                    From
                  </label>

                  <input
                    type='date'
                    value={generalFrom}
                    onChange={(e) => setGeneralFrom(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-sm font-medium'>To</label>

                  <input
                    type='date'
                    value={generalTo}
                    onChange={(e) => setGeneralTo(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                  />
                </div>
              </div>

              <div className='mt-6 flex justify-end'>
                <Button
                  onClick={() => handleGenerateReport('general')}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate report'}
                </Button>
              </div>
            </div>
          )}

          {selectedReport === 'attendance' && (
            <div>
              <div className='mb-4'>
                <h3 className='text-sm font-medium text-zinc-900 dark:text-white'>
                  Attendance period
                </h3>

                <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                  Select the period you want included in the report.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-sm font-medium'>
                    From
                  </label>

                  <input
                    type='date'
                    value={attendanceFrom}
                    onChange={(e) => setAttendanceFrom(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-sm font-medium'>To</label>

                  <input
                    type='date'
                    value={attendanceTo}
                    onChange={(e) => setAttendanceTo(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                  />
                </div>
              </div>

              <div className='mt-5'>
                <label className='mb-1.5 block text-sm font-medium'>
                  Report format
                </label>

                <select
                  value={attendanceFormat}
                  onChange={(e) => setAttendanceFormat(e.target.value)}
                  className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                >
                  <option value='detailed'>Detailed</option>
                  <option value='summary'>Summary</option>
                </select>
              </div>

              <div className='mt-6 flex justify-end'>
                <Button
                  onClick={() => handleGenerateReport('attendance')}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate report'}
                </Button>
              </div>
            </div>
          )}

          {selectedReport === 'contributions' && (
            <div>
              <div className='mb-4'>
                <h3 className='text-sm font-medium text-zinc-900 dark:text-white'>
                  Contribution period
                </h3>

                <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                  Select the period you want included in the report.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-sm font-medium'>
                    From
                  </label>

                  <input
                    type='date'
                    value={contributionFrom}
                    onChange={(e) => setContributionFrom(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-sm font-medium'>To</label>

                  <input
                    type='date'
                    value={contributionTo}
                    onChange={(e) => setContributionTo(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                  />
                </div>
              </div>

              <div className='mt-5'>
                <label className='mb-1.5 block text-sm font-medium'>
                  Report format
                </label>

                <select
                  value={contributionFormat}
                  onChange={(e) => setContributionFormat(e.target.value)}
                  className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900'
                >
                  <option value='summary'>Summary</option>
                  <option value='detailed'>Detailed</option>
                </select>
              </div>

              <div className='mt-6 flex justify-end'>
                <Button
                  onClick={() => handleGenerateReport('contributions')}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate report'}
                </Button>
              </div>
            </div>
          )}

          {selectedReport === 'members' && (
            <div>
              <div className='mb-4'>
                <h3 className='text-sm font-medium text-zinc-900 dark:text-white'>
                  Member report options
                </h3>

                <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                  Choose what member information should be included in the
                  report.
                </p>
              </div>

              <div className='flex flex-col gap-3'>
                <label className='flex items-center gap-3 text-sm'>
                  <input
                    type='checkbox'
                    checked={memberReportOptions.contactInfo}
                    onChange={(e) =>
                      setMemberReportOptions((current) => ({
                        ...current,
                        contactInfo: e.target.checked,
                      }))
                    }
                    className='h-4 w-4 rounded border-zinc-300 text-brand-500 focus:ring-brand-500'
                  />
                  Member contact information
                </label>

                <label className='flex items-center gap-3 text-sm'>
                  <input
                    type='checkbox'
                    checked={memberReportOptions.unitInfo}
                    onChange={(e) =>
                      setMemberReportOptions((current) => ({
                        ...current,
                        unitInfo: e.target.checked,
                      }))
                    }
                    className='h-4 w-4 rounded border-zinc-300 text-brand-500 focus:ring-brand-500'
                  />
                  Unit information
                </label>

                <label className='flex items-center gap-3 text-sm'>
                  <input
                    type='checkbox'
                    checked={memberReportOptions.statistics}
                    onChange={(e) =>
                      setMemberReportOptions((current) => ({
                        ...current,
                        statistics: e.target.checked,
                      }))
                    }
                    className='h-4 w-4 rounded border-zinc-300 text-brand-500 focus:ring-brand-500'
                  />
                  Membership statistics
                </label>
              </div>

              <div className='mt-6 flex justify-end'>
                <Button
                  onClick={() => handleGenerateReport('members')}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate report'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
