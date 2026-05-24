import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🥪</div>
            <h1 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="bg-[#009A44] text-white font-bold px-6 py-2.5 rounded-full hover:bg-[#007A36] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
