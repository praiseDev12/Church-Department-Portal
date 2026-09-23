import { BriefcaseIcon, PhoneIcon, UserIcon, UsersIcon } from 'lucide-react';

import StatusBadge from './StatusBadge';
import { formatDate, formatEnum } from '../../utils/memberUtils';
import UnitHistory from './UnitHistory';

function InfoSection({ title, icon, children }) {
  return (
    <div className='min-w-0 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='shrink-0 text-zinc-400 dark:text-zinc-500'>{icon}</div>

        <h3 className='text-sm font-semibold text-zinc-900 dark:text-white'>
          {title}
        </h3>
      </div>

      <div className='space-y-3'>{children}</div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className='flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
      <span className='shrink-0 text-xs text-zinc-500 dark:text-zinc-400'>
        {label}
      </span>

      <span className='min-w-0 wrap-break-word text-left text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:text-right'>
        {value || '—'}
      </span>
    </div>
  );
}

function MemberDetails({ member }) {
  const initials = member.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className='mx-auto min-w-0 max-w-6xl'>
      {/* Profile header */}
      <div className='mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.fullName}
              className='h-14 w-14 shrink-0 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-900 sm:h-16 sm:w-16'
            />
          ) : (
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 sm:h-16 sm:w-16 sm:text-xl'>
              {initials || '?'}
            </div>
          )}

          <div className='min-w-0'>
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
              <h2 className='max-w-full wrap-break-word text-lg font-semibold text-zinc-900 dark:text-white'>
                {member.fullName}
              </h2>

              <StatusBadge status={member.status} />
            </div>

            <p className='mt-1 wrap-break-word text-sm text-zinc-500 dark:text-zinc-400'>
              {member.roleInUnit || 'Member'}
              {member.unit?.name ? ` · ${member.unit.name}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Information sections */}
      <div className='grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <InfoSection title='Personal Information' icon={<UserIcon size={16} />}>
          <InfoItem label='Full Name' value={member.fullName} />

          <InfoItem
            label='Date of Birth'
            value={formatDate(member.dateOfBirth)}
          />

          <InfoItem label='Gender' value={formatEnum(member.gender)} />

          <InfoItem
            label='Marital Status'
            value={formatEnum(member.maritalStatus)}
          />
        </InfoSection>

        <InfoSection title='Contact Information' icon={<PhoneIcon size={16} />}>
          <InfoItem label='Phone Number' value={member.phoneNumber} />

          <InfoItem label='WhatsApp' value={member.whatsappNumber} />

          <InfoItem label='Email' value={member.email} />

          <InfoItem label='Address' value={member.address} />
        </InfoSection>

        <InfoSection title='Membership' icon={<UsersIcon size={16} />}>
          <InfoItem label='Department' value={member.department?.name} />

          <InfoItem label='Unit' value={member.unit?.name} />

          <InfoItem label='Role in Unit' value={member.roleInUnit} />

          <InfoItem
            label='Date Joined'
            value={formatDate(member.dateJoinedDepartment)}
          />
        </InfoSection>

        <InfoSection
          title='Additional Information'
          icon={<BriefcaseIcon size={16} />}
        >
          <InfoItem label='Occupation' value={member.occupation} />

          <InfoItem label='Status' value={formatEnum(member.status)} />

          <InfoItem label='Registered' value={formatDate(member.createdAt)} />

          <InfoItem label='Last Updated' value={formatDate(member.updatedAt)} />
        </InfoSection>

        <div className='min-w-0 md:col-span-2'>
          <UnitHistory member={member} />
        </div>
      </div>
    </div>
  );
}

export default MemberDetails;
