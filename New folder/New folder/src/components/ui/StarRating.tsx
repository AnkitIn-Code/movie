import { Star } from 'lucide-react';
import { getRatingColor } from '../../utils/helpers';

interface StarRatingProps {
  rating: number;
  votes?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, votes, size = 'md' }: StarRatingProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1.5">
      <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
      <span className={`font-bold ${textSize} ${getRatingColor(rating)}`}>{rating}/10</span>
      {votes && (
        <span className={`text-gray-400 ${textSize}`}>
          ({(votes / 1000).toFixed(0)}K votes)
        </span>
      )}
    </div>
  );
}
