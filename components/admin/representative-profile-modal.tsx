import { useState } from 'react';
import { Representative } from '../../types/representative';

interface RepresentativeProfileModalProps {
  representative: Representative | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (representative: Representative) => void;
}

export function RepresentativeProfileModal({ representative, isOpen, onClose, onSave }: RepresentativeProfileModalProps) {
  const [editedRepresentative, setEditedRepresentative] = useState<Representative | null>(representative);

  if (!representative || !editedRepresentative) return null;

  onSave(editedRepresentative);

  return (
    <div>
      <p className="text-sm text-gray-600">Representative ID: {representative.id}</p>
      {/* Other UI elements */}
    </div>
  );
}
