import '@/styles/brand-tokens.css';
import '@/styles/error-fallback.css';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react';

const CHUNK_RELOAD_KEY = 'newgee-chunk-reload';

/** After a redeploy, old lazy chunks 404 — a single reload fetches the new build. */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|Loading chunk \d+ failed|error loading dynamically/i.test(
    message
  );
}

/** Reload at most once per 30 s so a genuinely missing chunk cannot cause a reload loop. */
function reloadOnceForChunkError(): boolean {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

const FALLBACK_TEXT: Record<string, string> = {
  'errors.errorTitle': 'Oups, quelque chose s’est mal passé',
  'errors.errorDesc': 'Cette page a rencontré une erreur inattendue. Vos données sont en sécurité.',
  'errors.errorRetry': 'Réessayer',
  'errors.errorHome': 'Retour à l’accueil',
  'errors.errorReload': 'Recharger la page',
};

function ErrorFallback({
  error,
  onRetry,
  compact,
}: {
  error: Error;
  onRetry: () => void;
  compact: boolean;
}) {
  const t = (key: string) => FALLBACK_TEXT[key] ?? key;

  return (
    <div className={compact ? 'error-fallback error-fallback--compact' : 'error-fallback'} role='alert'>
      <div className='error-fallback__card'>
        <span className='error-fallback__icon'>
          <AlertTriangle className='h-6 w-6' />
        </span>
        <h1 className='error-fallback__title'>{t('errors.errorTitle')}</h1>
        <p className='error-fallback__desc'>{t('errors.errorDesc')}</p>
        {import.meta.env.DEV ? <pre className='error-fallback__detail'>{error.message}</pre> : null}
        <div className='error-fallback__actions'>
          <button type='button' className='error-fallback__btn error-fallback__btn--primary' onClick={onRetry}>
            <RotateCcw className='h-4 w-4' />
            {t('errors.errorRetry')}
          </button>
          {compact ? (
            <button type='button' className='error-fallback__btn' onClick={() => window.location.reload()}>
              <RefreshCw className='h-4 w-4' />
              {t('errors.errorReload')}
            </button>
          ) : (
            <a className='error-fallback__btn' href='/'>
              <Home className='h-4 w-4' />
              {t('errors.errorHome')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

type Props = {
  children: ReactNode;
  /** Inline fallback (inside the dashboard) instead of a full-page one. */
  compact?: boolean;
  /** Changing this value clears the error (e.g. the active dashboard section). */
  resetKey?: unknown;
};

type State = { error: Error | null; resetKey: unknown };

/**
 * Catches render errors so one broken view never blanks the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && reloadOnceForChunkError()) return;
    console.error('[NewGee] UI error', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      return <ErrorFallback error={error} onRetry={this.reset} compact={Boolean(this.props.compact)} />;
    }
    return this.props.children;
  }
}
