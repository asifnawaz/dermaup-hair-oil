'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Reconstructed from deployed client module 1190.
 *
 * Browsers show their own confirmation copy for `beforeunload`, but assigning
 * `returnValue` remains necessary to trigger the prompt.
 */
export function useUnsavedChanges(
  isDirty: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?',
) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = message;
    },
    [message],
  );

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () =>
      window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);
}

export function useKeyboardSave(onSave: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 's'
      ) {
        event.preventDefault();
        onSave();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onSave]);
}
