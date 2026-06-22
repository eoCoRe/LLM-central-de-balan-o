import type { ButtonHTMLAttributes } from 'react'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/** Botão de ação principal, usado para confirmar etapas do fluxo human-in-the-loop. */
export function PrimaryButton({ className = '', children, ...buttonProps }: PrimaryButtonProps) {
  return (
    <button
      className={`rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
