import { useRef, useCallback, useLayoutEffect } from 'react';

export default function usePreserveCursorTextarea(value, setValue) {
  const textareaRef = useRef(null);
  const cursorPos = useRef(null);

  const handleChange = useCallback((e) => {
    cursorPos.current = e.target.selectionStart;
    setValue(prev => ({ ...prev, comment: e.target.value }));
  }, [setValue]);

  useLayoutEffect(() => {
    if (textareaRef.current && cursorPos.current !== null) {
      textareaRef.current.setSelectionRange(cursorPos.current, cursorPos.current);
    }
  }, [value]);

  return [textareaRef, handleChange];
}
