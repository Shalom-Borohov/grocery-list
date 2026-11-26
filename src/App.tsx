import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactHashRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'
import { RecordsProvider } from './data/RecordsProvider'
import { LIST_PATH } from './navigation/paths'
import { RecoveryBoundary } from './recovery/RecoveryBoundary'
import { Tabs } from './Tabs'

export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route path="/tabs/*" element={<Tabs />} />
      <Route path="/" element={<Navigate to={LIST_PATH} replace />} />
    </IonRouterOutlet>
  )
}

export function App() {
  return (
    <RecoveryBoundary>
      <IonApp>
        <RecordsProvider>
          <IonReactHashRouter>
            <AppRoutes />
          </IonReactHashRouter>
        </RecordsProvider>
      </IonApp>
    </RecoveryBoundary>
  )
}
