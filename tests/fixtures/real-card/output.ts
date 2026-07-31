import { tv } from 'tailwind-variants';

export const card = tv({
  slots: {
    base: 'text-foreground bg-content1 relative box-border flex h-auto flex-col overflow-hidden outline-transparent outline-solid',
    header:
      'overflow-inherit color-inherit flex w-full shrink-0 items-center justify-start p-3 subpixel-antialiased',
    body: 'relative flex w-full flex-1 flex-col overflow-y-auto p-3 text-left wrap-break-word subpixel-antialiased',
    footer: 'color-inherit flex w-full items-center overflow-hidden p-3 subpixel-antialiased'
  },
  variants: {
    shadow: {
      none: { base: 'shadow-none' },
      sm: { base: 'shadow-small' },
      md: { base: 'shadow-medium' },
      lg: { base: 'shadow-large' }
    },
    radius: {
      none: {
        base: 'rounded-none',
        header: 'rounded-none',
        footer: 'rounded-none'
      },
      sm: {
        base: 'rounded-small',
        header: 'rounded-t-small',
        footer: 'rounded-b-small'
      },
      md: {
        base: 'rounded-medium',
        header: 'rounded-t-medium',
        footer: 'rounded-b-medium'
      },
      lg: {
        base: 'rounded-large',
        header: 'rounded-t-large',
        footer: 'rounded-b-large'
      }
    },
    fullWidth: {
      true: { base: 'w-full' }
    },
    isHoverable: {
      true: { base: 'data-[hover=true]:bg-content2 dark:data-[hover=true]:bg-content2' }
    },
    isPressable: {
      true: { base: 'cursor-pointer' }
    },
    isDisabled: {
      true: { base: ['opacity-disabled', 'pointer-events-none', 'cursor-default'] }
    }
  },
  compoundVariants: [
    {
      isPressable: true,
      class: {
        base: ['tap-highlight-transparent', 'data-[pressed=true]:scale-[0.97]']
      }
    }
  ],
  defaultVariants: {
    radius: 'lg',
    shadow: 'sm',
    fullWidth: false,
    isHoverable: false,
    isPressable: false,
    isDisabled: false
  }
});
