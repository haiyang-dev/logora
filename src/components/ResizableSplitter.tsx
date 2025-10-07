import React, { useState, useEffect, useRef } from 'react';

interface ResizableSplitterProps {
  children: [React.ReactNode, React.ReactNode];
  defaultFirstWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  children,
  defaultFirstWidth = 280,
  minWidth = 180,
  maxWidth = 500,
  className = ''
}) => {
  const [firstWidth, setFirstWidth] = useState(defaultFirstWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const splitterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartXRef.current;
      const newWidth = dragStartWidthRef.current + deltaX;
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setFirstWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = firstWidth;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  return (
    <div className={`resizable-splitter ${className}`} style={{
      display: 'flex',
      width: '100%',
      height: '100%'
    }}>
      {/* First panel (sidebar) */}
      <div style={{
        width: `${firstWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        {children[0]}
      </div>

      {/* Splitter */}
      <div
        ref={splitterRef}
        style={{
          width: '4px',
          backgroundColor: isDragging ? '#3b82f6' : '#e5e7eb',
          cursor: 'col-resize',
          flexShrink: 0,
          position: 'relative',
          transition: isDragging ? 'none' : 'background-color 0.15s ease'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#d1d5db';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }
        }}
        title="拖拽调整大小"
      >
        {/* Visual drag indicator */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1px',
          height: '20px',
          backgroundColor: isDragging ? '#ffffff' : '#9ca3af',
          opacity: isDragging ? 0.6 : 0.3
        }} />
      </div>

      {/* Second panel (editor) */}
      <div style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {children[1]}
      </div>
    </div>
  );
};