/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { createContext, useContext, useState } from 'react'

import type { ChildrenType } from '@/types/component-props'
import type { ChatContextType, ChatOffcanvasStatesType, OffcanvasControlType } from '@/types/context'
import type { UserType } from '@/types/data'

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext can only be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }: ChildrenType) => {
  const [activeChat, setActiveChat] = useState<UserType>()
  const [offcanvasStates, setOffcanvasStates] = useState<ChatOffcanvasStatesType>({
    showChatList: true,
    showUserSetting: false,
    showUserProfile: false,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const changeActiveChat = async (_userId: UserType['id']) => {
    // Chat feature non utilisé dans cette application
  }

  const toggleChatList: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showChatList: !offcanvasStates.showChatList })
  }

  const toggleUserProfile: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showUserProfile: !offcanvasStates.showUserProfile })
  }

  const toggleUserSetting: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showUserSetting: !offcanvasStates.showUserSetting })
  }

  const chatList: ChatContextType['chatList'] = {
    open: offcanvasStates.showChatList,
    toggle: toggleChatList,
  }

  const chatProfile: ChatContextType['chatProfile'] = {
    open: offcanvasStates.showUserProfile,
    toggle: toggleUserProfile,
  }

  const chatSetting: ChatContextType['chatSetting'] = {
    open: offcanvasStates.showUserSetting,
    toggle: toggleUserSetting,
  }

  return (
    <ChatContext.Provider
      value={{
        chatSetting,
        activeChat,
        changeActiveChat,
        chatList,
        chatProfile,
      }}>
      {children}
    </ChatContext.Provider>
  )
}
