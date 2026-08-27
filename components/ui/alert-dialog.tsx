"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./dialog";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export const AlertDialog = Dialog;
export const AlertDialogTrigger = DialogTrigger;

export function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      role="alertdialog"
      className={cn("max-w-md", className)}
      hideClose
      onInteractOutside={(e) => e.preventDefault()} // Prevent closing on backdrop click
      {...props}
    >
      {children}
    </DialogContent>
  );
}

export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;

export function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose asChild>
      <Button variant="secondary" className={cn("mt-2 sm:mt-0", className)} {...props} />
    </DialogClose>
  );
}

export function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button className={className} {...props} />;
}
