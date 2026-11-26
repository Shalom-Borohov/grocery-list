import { Component, type ReactNode } from 'react'
import { db } from '../data/db'
import { RecoveryScreen } from './RecoveryScreen'

interface RecoveryBoundaryProps {
  children: ReactNode
}

export class RecoveryBoundary extends Component<RecoveryBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  showRecovery = () => this.setState({ failed: true })

  componentDidMount() {
    db.open().catch(this.showRecovery)
  }


  render() {
    return this.state.failed ? <RecoveryScreen /> : this.props.children
  }
}
