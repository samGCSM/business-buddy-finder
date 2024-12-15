"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sidebarVariants = cva("h-full border-r bg-background", {
  variants: {
    variant: {
      default: "w-64",
      sm: "w-16",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

const SidebarContext = React.createContext<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}>({
  expanded: true,
  setExpanded: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(true);
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { expanded } = React.useContext(SidebarContext);
  return (
    <aside
      className={cn(sidebarVariants({ variant: expanded ? "default" : "sm" }), className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 space-y-4", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm font-semibold text-foreground/60", className)} {...props} />;
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function SidebarMenuButton({
  className,
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <Comp
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function SidebarTrigger() {
  const { expanded, setExpanded } = React.useContext(SidebarContext);
  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="fixed bottom-4 left-4 p-2 bg-primary text-primary-foreground rounded-full shadow-lg"
    >
      {expanded ? "←" : "→"}
    </button>
  );
}