type DebouncedCallback<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

export function createDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  waitMs: number,
): DebouncedCallback<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: TArgs) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      callback(...args);
      timer = null;
    }, waitMs);
  }) as DebouncedCallback<TArgs>;

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}
