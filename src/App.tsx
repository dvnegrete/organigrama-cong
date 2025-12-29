import { Dashboard } from './components/layout/Dashboard'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import './App.css'

function App() {
  return (
    <WorkspaceProvider>
      <Dashboard />
    </WorkspaceProvider>
  )
}

export default App
