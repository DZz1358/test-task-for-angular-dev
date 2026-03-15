// Global mocks for jsdom.
const storageMock = () => {
  let storage: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { configurable: true, value: storageMock() });
Object.defineProperty(window, 'sessionStorage', { configurable: true, value: storageMock() });
const noop = (): void => undefined;
const getComputedStyleMock = (): CSSStyleDeclaration =>
  (({
    getPropertyValue: (_property: string): string => '',
    length: 0,
    item: (_index: number): string | null => null,
    0: '-webkit-appearance',
  } as unknown) as CSSStyleDeclaration);

const matchMediaMock = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null as MediaQueryList['onchange'],
    addEventListener: noop,
    removeEventListener: noop,
    addListener: noop,
    removeListener: noop,
    dispatchEvent: (_event: Event): boolean => false,
  } as MediaQueryList);

Object.defineProperty(window, 'getComputedStyle', {
  configurable: true,
  value: getComputedStyleMock,
});

document.body.style.transform = '';
window.matchMedia = matchMediaMock;

/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
