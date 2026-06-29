import { describe, expect, it, vi } from "vitest";
import { createDebouncedCallback } from "./debounce";

describe("createDebouncedCallback", () => {
  it("executa apenas a última chamada após o atraso", () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = createDebouncedCallback(spy, 300);

    debounced("primeira");
    debounced("segunda");
    debounced("terceira");

    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("terceira");
    vi.useRealTimers();
  });

  it("permite cancelar a execução pendente", () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = createDebouncedCallback(spy, 300);

    debounced("valor");
    debounced.cancel();
    vi.advanceTimersByTime(300);

    expect(spy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
