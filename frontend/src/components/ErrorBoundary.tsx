import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

// If a component throws while drawing, React removes the whole page and the visitor sees white.
// This catches it and shows a message instead. React still writes this one as a class.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  // React calls this when a component below throws while drawing
  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    // A plain <a>, not a Link: this is outside the router, and a full reload is the way to recover.
    return (
      <div className="container page empty">
        <h1>Une erreur est survenue</h1>
        <p>Rechargez la page. Si le problème continue, contactez-nous sur WhatsApp.</p>
        <a href="/" className="button button--accent">
          Retour à l’accueil
        </a>
      </div>
    )
  }
}
