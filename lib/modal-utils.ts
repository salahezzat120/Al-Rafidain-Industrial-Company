/**
 * Utility functions for consistent modal sizing across the application
 */

export type ModalSize = 'small' | 'medium' | 'large' | 'extra-large'

export interface ModalSizeConfig {
  className: string
  maxWidth: string
  maxHeight: string
  width: string
}

export const modalSizeConfigs: Record<ModalSize, ModalSizeConfig> = {
  small: {
    className: 'w-[85vw] max-w-2xl max-h-[85vh] overflow-y-auto',
    maxWidth: '672px',
    maxHeight: '85vh',
    width: '85vw'
  },
  medium: {
    className: 'w-[85vw] max-w-4xl max-h-[85vh] overflow-y-auto',
    maxWidth: '896px',
    maxHeight: '85vh',
    width: '85vw'
  },
  large: {
    className: 'w-[85vw] max-w-5xl max-h-[85vh] overflow-y-auto',
    maxWidth: '1024px',
    maxHeight: '85vh',
    width: '85vw'
  },
  'extra-large': {
    className: 'w-[85vw] max-w-6xl max-h-[85vh] overflow-y-auto',
    maxWidth: '1152px',
    maxHeight: '85vh',
    width: '85vw'
  }
}

/**
 * Get responsive modal classes based on size
 */
export function getModalClasses(size: ModalSize = 'medium'): string {
  const config = modalSizeConfigs[size]
  return config.className
}

/**
 * Get scrollable content classes
 */
export function getScrollableContentClasses(): string {
  return 'flex-1 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
}

/**
 * Get fixed footer classes
 */
export function getFixedFooterClasses(): string {
  return 'flex-shrink-0 border-t bg-white p-4 flex justify-end gap-3'
}

/**
 * Get responsive form grid classes
 */
export function getResponsiveFormGridClasses(): string {
  return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
}

/**
 * Get compact form spacing classes
 */
export function getCompactFormSpacingClasses(): string {
  return 'space-y-4'
}

/**
 * Modal size recommendations based on content type
 */
export const modalSizeRecommendations = {
  // Simple forms (login, settings, etc.)
  'simple-form': 'small' as ModalSize,
  
  // Customer/User creation forms
  'user-form': 'medium' as ModalSize,
  
  // Complex forms with multiple sections
  'complex-form': 'large' as ModalSize,
  
  // Data tables and lists
  'data-table': 'large' as ModalSize,
  
  // Product selection and multi-step forms
  'product-selection': 'extra-large' as ModalSize,
  
  // Task creation with products
  'task-creation': 'extra-large' as ModalSize,
  
  // Settings and configuration
  'settings': 'medium' as ModalSize,
  
  // Details and information display
  'details': 'large' as ModalSize
}

/**
 * Get recommended modal size for content type
 */
export function getRecommendedModalSize(contentType: keyof typeof modalSizeRecommendations): ModalSize {
  return modalSizeRecommendations[contentType]
}

/**
 * Responsive breakpoints for modal sizing
 */
export const responsiveModalSizes = {
  mobile: {
    maxWidth: '95vw',
    maxHeight: '90vh',
    margin: '1rem'
  },
  tablet: {
    maxWidth: '80vw',
    maxHeight: '80vh',
    margin: '2rem'
  },
  desktop: {
    maxWidth: '70vw',
    maxHeight: '85vh',
    margin: '2rem'
  },
  'large-desktop': {
    maxWidth: '60vw',
    maxHeight: '80vh',
    margin: '2rem'
  }
}

/**
 * Get responsive modal size based on screen size
 */
export function getResponsiveModalSize(): string {
  return `
    max-w-[95vw] max-h-[90vh] 
    sm:max-w-[80vw] sm:max-h-[80vh] 
    lg:max-w-[70vw] lg:max-h-[85vh] 
    xl:max-w-[60vw] xl:max-h-[80vh]
    overflow-hidden flex flex-col
  `.replace(/\s+/g, ' ').trim()
}
