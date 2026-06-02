// Which UI variation to render. Resolved once at load:
//   1. ?v=spotlight|board|progress in the URL (overrides everything)
//   2. VITE_UI_VARIANT from the build mode (.env.spotlight etc. → `vite --mode spotlight`)
//   3. fallback 'spotlight'
export type UiVariant = 'spotlight' | 'board' | 'progress';

const VALID: UiVariant[] = ['spotlight', 'board', 'progress'];

function resolve(): UiVariant {
  const fromUrl = new URLSearchParams(window.location.search).get('v');
  if (fromUrl && VALID.includes(fromUrl as UiVariant)) return fromUrl as UiVariant;
  const fromEnv = import.meta.env.VITE_UI_VARIANT as string | undefined;
  if (fromEnv && VALID.includes(fromEnv as UiVariant)) return fromEnv as UiVariant;
  return 'spotlight';
}

export const VARIANT: UiVariant = resolve();

export const VARIANT_LABEL: Record<UiVariant, string> = {
  spotlight: 'Spotlight',
  board: 'Status Board',
  progress: 'Progress',
};
