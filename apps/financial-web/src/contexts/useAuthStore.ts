import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IUser } from '@types'

interface AuthState {
  isHydrated: boolean
  isAuthenticated: boolean
  user: Partial<IUser>
}

interface AuthActions {
  setIsHydrated: (isHydratedState: boolean) => void
  setUser: (user: Partial<IUser>) => void
  clearAuth: () => void
}

const initState: AuthState = {
  isHydrated: false,
  isAuthenticated: false,
  user: {},
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initState,
      setIsHydrated: (isHydratedState: boolean) => set({ isHydrated: isHydratedState }),
      setUser: (user: Partial<IUser>) => set(() => ({ isAuthenticated: true, user })),
      clearAuth: () =>
        set(() => ({ isAuthenticated: initState.isAuthenticated, user: initState.user })),
    }),
    {
      name: 'user.storage',
      onRehydrateStorage: (state: AuthState & AuthActions) => () => {
        state.setIsHydrated(true)
      },
    }
  )
)

export default useAuthStore
