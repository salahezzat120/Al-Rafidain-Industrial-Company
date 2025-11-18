"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getModalClasses, getScrollableContentClasses, getFixedFooterClasses, type ModalSize } from "@/lib/modal-utils"
import { useLanguage } from "@/contexts/language-context"

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  showCloseButton?: boolean
  className?: string
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  showCloseButton = true,
  className = ''
}: ResponsiveModalProps) {
  const { isRTL } = useLanguage()
  
  const modalClasses = getModalClasses(size)
  const scrollableClasses = getScrollableContentClasses()
  const footerClasses = getFixedFooterClasses()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${modalClasses} ${className}`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={scrollableClasses}>
          {children}
        </div>

        {footer && (
          <div className={footerClasses}>
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ResponsiveFormModalProps extends Omit<ResponsiveModalProps, 'footer'> {
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitText?: string
  cancelText?: string
  isSubmitting?: boolean
  submitDisabled?: boolean
}

export function ResponsiveFormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
  size = 'medium',
  className = ''
}: ResponsiveFormModalProps) {
  const { isRTL } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4 mr-2" />
        {cancelText}
      </Button>
      <Button
        type="submit"
        form="responsive-form"
        disabled={isSubmitting || submitDisabled}
      >
        {isSubmitting ? "Saving..." : submitText}
      </Button>
    </>
  )

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size={size}
      className={className}
    >
      <form id="responsive-form" onSubmit={handleSubmit} className="space-y-6">
        {children}
      </form>
    </ResponsiveModal>
  )
}
















