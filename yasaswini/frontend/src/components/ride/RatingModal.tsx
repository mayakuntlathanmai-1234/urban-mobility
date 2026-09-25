import React, { useState } from 'react';
import { Star, MessageSquare, Check, X } from 'lucide-react';
import { fetchApi } from '../../services/api';

interface RatingModalProps {
  rideId: string;
  driverName?: string;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ rideId, driverName = 'Driver', onClose }) => {
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoveredScore, setHoveredScore] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetchApi('/ratings', {
        method: 'POST',
        body: JSON.stringify({ rideId, score, comment })
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Rating submission failed:', err);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h3 className="text-base font-extrabold text-white">How was your ride with {driverName}?</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Thank you for rating!</p>
            <p className="text-xs text-gray-400">Your feedback helps improve driver ratings.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Controls */}
            <div className="flex items-center justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoveredScore || score) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHoveredScore(star)}
                    onMouseLeave={() => setHoveredScore(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-center font-bold text-xs text-amber-400">
              {score === 5 ? ' Excellent (5/5)' : score === 4 ? ' Good (4/5)' : score === 3 ? ' Average (3/5)' : ' Poor'}
            </div>

            {/* Optional Comment */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-gray-400" />
                Optional Review Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about vehicle cleanliness, driver punctuality, or service..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 h-24"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Feedback...' : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
