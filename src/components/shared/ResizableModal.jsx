import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

/**
 * ResizableModal - Verschiebbares und skalierbares Modal
 *
 * Features:
 * - Verschiebbar durch Ziehen am Header
 * - Skalierbar durch Ziehen an den Ecken/Kanten
 * - Minimieren/Maximieren Button
 * - Mindest- und Maximalgröße
 */
const ResizableModal = ({
  children,
  title,
  subtitle,
  onClose,
  defaultWidth = 900,
  defaultHeight = 600,
  minWidth = 400,
  minHeight = 300,
  maxWidth,
  maxHeight
}) => {
  const modalRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);

  // Position und Größe
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  // Speichere Position vor Maximieren
  const [preMaxState, setPreMaxState] = useState(null);

  // Zentriere Modal initial und passe Größe an Viewport an (max 90%)
  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidthPercent = 0.95;
    const maxHeightPercent = 0.90;

    // Beschränke Größe auf max 90% des Viewports
    const maxWidth = viewportWidth * maxWidthPercent;
    const maxHeight = viewportHeight * maxHeightPercent;
    const effectiveWidth = Math.min(defaultWidth, maxWidth);
    const effectiveHeight = Math.min(defaultHeight, maxHeight);

    // Zentriere Modal
    const centerX = (viewportWidth - effectiveWidth) / 2;
    const centerY = (viewportHeight - effectiveHeight) / 2;

    setSize({ width: effectiveWidth, height: effectiveHeight });
    setPosition({ x: centerX, y: centerY });
  }, [defaultWidth, defaultHeight]);

  // Drag Start
  const handleDragStart = useCallback((e) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position, isMaximized]);

  // Drag Move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragStart.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Resize Start
  const handleResizeStart = useCallback((e, direction) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y
    });
  }, [size, position, isMaximized]);

  // Resize Move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.posX;
      let newY = resizeStart.posY;

      // Berechne neue Größe basierend auf Richtung
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(minWidth, resizeStart.width + deltaX);
        if (maxWidth) newWidth = Math.min(maxWidth, newWidth);
      }
      if (resizeDirection.includes('w')) {
        const potentialWidth = resizeStart.width - deltaX;
        if (potentialWidth >= minWidth && (!maxWidth || potentialWidth <= maxWidth)) {
          newWidth = potentialWidth;
          newX = resizeStart.posX + deltaX;
        }
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(minHeight, resizeStart.height + deltaY);
        if (maxHeight) newHeight = Math.min(maxHeight, newHeight);
      }
      if (resizeDirection.includes('n')) {
        const potentialHeight = resizeStart.height - deltaY;
        if (potentialHeight >= minHeight && (!maxHeight || potentialHeight <= maxHeight)) {
          newHeight = potentialHeight;
          newY = resizeStart.posY + deltaY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, resizeStart, minWidth, minHeight, maxWidth, maxHeight]);

  // Maximieren/Wiederherstellen
  const toggleMaximize = () => {
    if (isMaximized) {
      // Wiederherstellen
      if (preMaxState) {
        setPosition(preMaxState.position);
        setSize(preMaxState.size);
      }
      setIsMaximized(false);
    } else {
      // Maximieren
      setPreMaxState({ position, size });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  };

  // Doppelklick auf Header = Maximieren
  const handleHeaderDoubleClick = () => {
    toggleMaximize();
  };

  // Cursor für Resize-Handles
  const getCursor = (direction) => {
    const cursors = {
      'n': 'ns-resize',
      's': 'ns-resize',
      'e': 'ew-resize',
      'w': 'ew-resize',
      'ne': 'nesw-resize',
      'nw': 'nwse-resize',
      'se': 'nwse-resize',
      'sw': 'nesw-resize'
    };
    return cursors[direction] || 'default';
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="absolute bg-white dark:bg-gray-800 rounded-card shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{
          left: isMaximized ? 0 : position.x,
          top: isMaximized ? 0 : position.y,
          width: isMaximized ? '100%' : size.width,
          height: isMaximized ? '100%' : size.height,
          borderRadius: isMaximized ? 0 : undefined
        }}
      >
        {/* Header - Draggable */}
        <div
          className={`
            flex justify-between items-center p-3 border-b
            bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700
            select-none transition-colors
            ${!isMaximized ? 'cursor-move' : ''}
          `}
          onMouseDown={handleDragStart}
          onDoubleClick={handleHeaderDoubleClick}
        >
          {/* Links: Titel */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>

          {/* Mitte: Subtitle (z.B. Projekt/Phase/Datum) */}
          {subtitle && (
            <div className="flex-1 flex justify-center items-center min-w-0 px-4">
              {typeof subtitle === 'string' ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
              ) : (
                subtitle
              )}
            </div>
          )}

          {/* Rechts: Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={toggleMaximize}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isMaximized ? 'Wiederherstellen' : 'Maximieren'}
              aria-label={isMaximized ? 'Wiederherstellen' : 'Maximieren'}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Schließen"
              aria-label="Schließen"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-800">
          {children}
        </div>

        {/* Resize Handles - nur wenn nicht maximiert */}
        {!isMaximized && (
          <>
            {/* Ecken */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize"
              style={{ cursor: getCursor('nw') }}
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize"
              style={{ cursor: getCursor('ne') }}
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize"
              style={{ cursor: getCursor('sw') }}
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group"
              style={{ cursor: getCursor('se') }}
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            >
              {/* Visueller Resize-Griff rechts unten */}
              <svg
                className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14Z" />
              </svg>
            </div>

            {/* Kanten */}
            <div
              className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize"
              style={{ cursor: getCursor('n') }}
              onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div
              className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize"
              style={{ cursor: getCursor('s') }}
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div
              className="absolute left-0 top-3 bottom-3 w-1 cursor-ew-resize"
              style={{ cursor: getCursor('w') }}
              onMouseDown={(e) => handleResizeStart(e, 'w')}
            />
            <div
              className="absolute right-0 top-3 bottom-3 w-1 cursor-ew-resize"
              style={{ cursor: getCursor('e') }}
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ResizableModal;
