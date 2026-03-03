import { useCompare } from '../context/CompareContext';

interface AddToCompareButtonProps {
  vendorName: string;
  size?: 'sm' | 'md';
}

export default function AddToCompareButton({
  vendorName,
  size = 'md',
}: AddToCompareButtonProps) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const added = isInCompare(vendorName);

  const handleClick = () => {
    if (added) {
      removeFromCompare(vendorName);
    } else {
      addToCompare(vendorName);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : 'px-3 py-1.5 text-sm gap-1.5';

  if (added) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center rounded-md font-medium transition-colors
          bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30
          ${sizeClasses}`}
      >
        {/* Checkmark icon */}
        <svg
          className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Added
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center rounded-md font-medium transition-colors
        bg-slate-700 text-slate-300 hover:bg-slate-600
        ${sizeClasses}`}
    >
      {/* Plus icon */}
      <svg
        className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Compare
    </button>
  );
}
