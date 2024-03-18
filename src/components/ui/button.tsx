import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disable:shadow-none disabled:translate-x-0 disabled:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-2 border-border shadow text-primary-foreground hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-border shadow hover:shadow-none",
        outline:
          "border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground shadow hover:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-border shadow hover:shadow-none",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "destructive", "secondary"],
        size: "sm",
        className: "shadow-sm",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
