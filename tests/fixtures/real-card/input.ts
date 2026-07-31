import { tv } from 'tailwind-variants';

export const card = tv({
  slots: {
    base: 'flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent',
    header:
      'flex p-3 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased',
    body: 'relative flex flex-1 flex-col w-full p-3 wrap-break-word text-left overflow-y-auto subpixel-antialiased',
    footer: 'flex p-3 w-full items-center overflow-hidden color-inherit subpixel-antialiased'
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
      true: { base: ['opacity-disabled', 'cursor-default', 'pointer-events-none'] }
    }
  },
  compoundVariants: [
    {
      isPressable: true,
      class: {
        base: ['data-[pressed=true]:scale-[0.97]', 'tap-highlight-transparent']
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
