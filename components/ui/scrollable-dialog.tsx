'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface ScrollableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  showScrollButtons?: boolean;
  scrollAmount?: number;
}

export function ScrollableDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-6xl',
  showScrollButtons = true,
  scrollAmount = 300
}: ScrollableDialogProps) {
  const { isRTL } = useLanguage();

  const handleScroll = (direction: 'up' | 'down') => {
    const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;
    if (scrollContainer) {
      if (direction === 'down') {
        scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${maxWidth} max-h-[90vh] flex flex-col`}>
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-base text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div 
          className="space-y-6 py-4 overflow-y-auto flex-1 max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          data-scroll-container
        >
          {/* Scroll Indicator */}
          <div className="sticky top-0 bg-white z-10 py-2 border-b border-gray-200 mb-4">
            <div className="text-xs text-gray-500 text-center">
              {isRTL ? 'اسحب للأسفل لرؤية المزيد من الحقول' : 'Scroll down to see more fields'}
            </div>
          </div>
          
          {children}
          
          {/* Scroll Navigation */}
          {showScrollButtons && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-8">
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleScroll('up')}
                  className="flex items-center gap-2"
                >
                  <ChevronUp className="h-4 w-4" />
                  {isRTL ? 'للأعلى' : 'Scroll Up'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleScroll('down')}
                  className="flex items-center gap-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  {isRTL ? 'للأسفل' : 'Scroll Down'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {footer && (
          <DialogFooter className="pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex-shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}


