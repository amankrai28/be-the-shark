import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset: () => void
}

interface State {
  hasError: boolean
}

/**
 * The v6 prototype had no error boundary: a render crash (e.g. the practice
 * pitch bug) unmounted the whole app to a black screen. Never again.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Game crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="text-5xl">🦈</div>
          <h1 className="font-display text-xl font-bold">Something went wrong</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            The sharks stepped out for a minute. Your streak and stats are safe.
          </p>
          <button
            className="btn-gold px-6 py-3"
            onClick={() => {
              this.setState({ hasError: false })
              this.props.onReset()
            }}
          >
            Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
