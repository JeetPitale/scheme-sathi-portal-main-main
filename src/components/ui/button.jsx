import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft active:scale-[0.98]",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
            outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-muted hover:text-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            navy: "bg-navy text-navy-foreground hover:bg-navy/90 shadow-soft",
            accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft",
            hero: "gradient-primary text-primary-foreground shadow-glow hover:shadow-lg active:scale-[0.98] text-lg font-semibold",
        },
        size: {
            default: "h-12 px-6 py-3",
            sm: "h-10 rounded-md px-4 text-sm",
            lg: "h-14 rounded-lg px-8 text-lg",
            xl: "h-16 rounded-xl px-10 text-xl",
            icon: "h-12 w-12",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>;
});
Button.displayName = "Button";
export { Button, buttonVariants };
