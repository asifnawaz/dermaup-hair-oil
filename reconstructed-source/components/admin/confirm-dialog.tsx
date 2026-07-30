"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export interface PromptOptions {
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
}

export type PromptFn = (options: PromptOptions) => Promise<string | null>;

interface DialogContext {
  confirm: ConfirmFn;
  prompt: PromptFn;
}

const DialogCtx = React.createContext<DialogContext | null>(null);

export function useConfirm(): ConfirmFn {
  const value = React.useContext(DialogCtx);
  if (!value) throw new Error("useConfirm must be used within DialogProvider");
  return value.confirm;
}

export function usePrompt(): PromptFn {
  const value = React.useContext(DialogCtx);
  if (!value) throw new Error("usePrompt must be used within DialogProvider");
  return value.prompt;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmOptions, setConfirmOptions] =
    React.useState<ConfirmOptions>({ description: "" });
  const confirmResolver = React.useRef<(value: boolean) => void>(null);

  const [promptOpen, setPromptOpen] = React.useState(false);
  const [promptOptions, setPromptOptions] =
    React.useState<PromptOptions>({});
  const [promptValue, setPromptValue] = React.useState("");
  const promptResolver =
    React.useRef<(value: string | null) => void>(null);

  const confirm = React.useCallback<ConfirmFn>(
    (options) =>
      new Promise((resolve) => {
        confirmResolver.current = resolve;
        setConfirmOptions(options);
        setConfirmOpen(true);
      }),
    [],
  );

  const prompt = React.useCallback<PromptFn>(
    (options) =>
      new Promise((resolve) => {
        promptResolver.current = resolve;
        setPromptOptions(options);
        setPromptValue(options.defaultValue || "");
        setPromptOpen(true);
      }),
    [],
  );

  const resolveConfirm = (value: boolean) => {
    confirmResolver.current?.(value);
    confirmResolver.current = null;
    setConfirmOpen(false);
  };

  const resolvePrompt = (value: string | null) => {
    promptResolver.current?.(value);
    promptResolver.current = null;
    setPromptOpen(false);
  };

  return (
    <DialogCtx.Provider value={{ confirm, prompt }}>
      {children}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) resolveConfirm(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmOptions.title || "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmOptions.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => resolveConfirm(false)}>
              {confirmOptions.cancelLabel || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmOptions.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              onClick={() => resolveConfirm(true)}
            >
              {confirmOptions.confirmLabel || "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={promptOpen}
        onOpenChange={(open) => {
          if (!open) resolvePrompt(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {promptOptions.title || "Input required"}
            </DialogTitle>
            {promptOptions.description ? (
              <DialogDescription>
                {promptOptions.description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="space-y-2">
            {promptOptions.label ? (
              <Label>{promptOptions.label}</Label>
            ) : null}
            <Input
              autoFocus
              value={promptValue}
              placeholder={promptOptions.placeholder}
              onChange={(event) => setPromptValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && promptValue.trim()) {
                  resolvePrompt(promptValue.trim());
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => resolvePrompt(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => resolvePrompt(promptValue.trim() || null)}
            >
              {promptOptions.confirmLabel || "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogCtx.Provider>
  );
}
