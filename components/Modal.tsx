import React from 'react';

interface ModalProps {
  /** Invoked when the backdrop is clicked. Omit/undefined to disable dismissal. */
  onBackdropClick?: () => void;
  /** Extra classes for the outer fixed wrapper (e.g. z-index, padding). */
  className?: string;
  /** Extra classes for the backdrop (e.g. background tint, blur strength). */
  backdropClassName?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  onBackdropClick,
  className = '',
  backdropClassName = '',
  children,
}) => (
  <div className={`fixed inset-0 flex items-center justify-center ${className}`}>
    <div
      className={`absolute inset-0 transition-opacity ${backdropClassName}`}
      onClick={onBackdropClick}
    ></div>
    {children}
  </div>
);

export default Modal;
