import { createContext, useContext, type ReactNode } from 'react'

const UserAvatar = createContext<string | undefined>(undefined)
export function UserAvatarProvider({ avatarUrl, children }: { avatarUrl?: string; children: ReactNode }) { return <UserAvatar.Provider value={avatarUrl}>{children}</UserAvatar.Provider> }
export function useUserAvatar() { return useContext(UserAvatar) }
