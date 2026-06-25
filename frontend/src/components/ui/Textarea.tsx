import { cn } from '@/utils/cn'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        {...props}
        className={cn(
          'block w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          error && 'border-status-danger',
          className
        )}
      />
      {error && <p className="text-xs text-status-danger">{error}</p>}
    </div>
  )
}
