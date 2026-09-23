function PhotoPreviewModal({ member, onClose }) {
  if (!member?.photoUrl) return null;

  return (
    <div
      className='fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4'
      onClick={onClose}
    >
      <div
        className='relative max-h-[90vh] max-w-[90vw]'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute hover:text-red-500 right-2 top-2 z-10 flex-center h-9 w-9 rounded-full bg-black/60 text-xl text-white transition hover:bg-black/80'
          aria-label='Close image preview'
        >
          ×
        </button>

        <img
          src={member.photoUrl}
          alt={member.fullName}
          className='max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl'
        />

        <div className='mt-3 text-center border border-dashed border-gray-500 p-2 rounded-md'>
          <p className='text-[10px] lg:text-xs font-medium text-gray-500'>
            {member.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PhotoPreviewModal;
