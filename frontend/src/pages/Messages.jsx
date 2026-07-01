import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEllipsis,
  faMagnifyingGlass,
  faPaperPlane,
  faShieldHalved,
  faUserDoctor,
  faUserGroup,
  faTrash,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { staffProfiles } from '../lib/mockData'
import { apiFetch } from '../lib/api-client'
import { API_URL, readSession } from '../lib/auth'

function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [chatList, setChatList] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [localMessages, setLocalMessages] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 50)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [localMessages, isAiLoading, activeId])

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true)
        const payload = await apiFetch('/api/conversations/me')
        let convos = payload?.conversations || []
        
        if (convos.length === 0) {
          const newConvo = await apiFetch('/api/conversations', { method: 'POST' })
          if (newConvo) convos = [newConvo]
        }

        const staffQueueIds = JSON.parse(localStorage.getItem('staff_queue_ids') || '[]')

        const formatted = convos.map(c => {
          let name = 'An Nhiên AI'
          let lastMsg = 'AI Healer sẵn sàng lắng nghe.'
          let isBot = true
          let color = 'from-sage to-sage-dark'
          let role = 'ai'

          if (c.status === 'waiting') {
            if (staffQueueIds.includes(c.id)) {
              name = 'Đang tìm người đồng hành...'
              lastMsg = 'Hệ thống đang xếp hàng chờ cho cậu...'
              isBot = false
              color = 'from-bark-light/20 to-bark-light/40'
              role = 'healer'
            } else {
              name = 'An Nhiên AI'
              lastMsg = 'AI luôn ở đây lắng nghe cậu.'
              isBot = true
              color = 'from-sage to-sage-dark'
              role = 'ai'
            }
          } else if (c.status === 'active' && c.healerId) {
            name = 'Chuyên gia An Nhiên' 
            lastMsg = 'Chuyên gia đã kết nối.'
            isBot = false
            role = 'healer' 
            color = 'from-lavender to-sage'
          }

          return {
            id: c.id,
            name,
            initials: isBot ? 'AI' : (c.status === 'waiting' ? '...' : 'CG'),
            color,
            online: true,
            role,
            isBot,
            status: c.status,
            lastMsg,
            time: new Date(c.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            unread: 0,
          }
        })
        
        const uniqueChats = []
        const seenRoles = new Set()
        for (const chat of formatted) {
          if (!seenRoles.has(chat.role)) {
            uniqueChats.push(chat)
            seenRoles.add(chat.role)
          }
        }
        
        setChatList(uniqueChats)

        // Handle URL params once we have the data
        const mode = searchParams.get('mode')
        const connect = searchParams.get('connect')
        
        if (connect === 'doctor') {
          const existing = uniqueChats.find(c => c.role === 'doctor' && c.status !== 'closed')
          if (existing) {
            setActiveId(existing.id)
          } else {
            connectToStaff('doctor')
          }
          setShowMobileChat(true)
          setSearchParams({}, { replace: true })
          return // connectToStaff or setActiveId will handle the rest
        } else if (mode === 'ai') {
          const aiConvo = uniqueChats.find(c => c.isBot)
          if (aiConvo) setActiveId(aiConvo.id)
          setShowMobileChat(true)
          setSearchParams({}, { replace: true })
        } else if (uniqueChats.length > 0 && !activeId) {
          setActiveId(uniqueChats[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    initializeChat()
    
    // Polling nhẹ mỗi 10s để xem có ai nhận ca chưa
    const interval = setInterval(initializeChat, 10000)
    return () => clearInterval(interval)
  }, [activeId])

  useEffect(() => {
    if (!activeId) return
    const fetchMessages = async () => {
      if (isAiLoading) return
      try {
        const res = await apiFetch(`/api/messages/${activeId}?limit=50`)
        const msgs = (res?.messages || []).map(m => ({
          id: m.id,
          sender: m.senderRole === 'user' ? 'me' : 'them',
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }))
        setLocalMessages(prev => ({ ...prev, [activeId]: msgs }))
      } catch (err) {
        console.error(err)
      }
    }
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [activeId, isAiLoading])

  const connectToStaff = useCallback(async (role) => {
    try {
      const existing = chatList.find(c => c.role === role && c.status !== 'closed')
      if (existing) {
        setActiveId(existing.id)
        return
      }

      const newConvo = await apiFetch('/api/conversations', { method: 'POST' })
      const id = newConvo.id
      
      const staffQueueIds = JSON.parse(localStorage.getItem('staff_queue_ids') || '[]')
      localStorage.setItem('staff_queue_ids', JSON.stringify([...staffQueueIds, id]))
      
      const nextChat = {
        id,
        name: 'Đang tìm người đồng hành...',
        initials: '...',
        color: 'from-bark-light/20 to-bark-light/40',
        online: true,
        role,
        isBot: false,
        status: 'waiting',
        lastMsg: 'Hệ thống đang xếp hàng chờ cho cậu...',
        time: 'Bây giờ',
        unread: 0,
      }

      setChatList((items) => [nextChat, ...items])
      setActiveId(id)
      setShowMobileChat(true)
    } catch (err) {
      console.error(err)
    }
  }, [chatList])

  // Removed buggy useEffect since URL logic is now handled in initializeChat
  // URL params are processed there to guarantee chatList is loaded first.

  const filteredConversations = useMemo(
    () => chatList.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [chatList, searchQuery],
  )
  const activeChat = chatList.find((chat) => chat.id === activeId) || chatList[0]
  const messages = activeChat ? (localMessages[activeChat.id] || []) : []

  const handleSend = async (overrideText = null) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : inputValue
    if (!textToSend.trim() || !activeChat) return
    const userText = textToSend.trim()
    setInputValue('')
    
    const tempId = Date.now().toString()
    const newMsg = {
      id: tempId,
      sender: 'me',
      text: userText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }
    
    setLocalMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }))

    setIsAiLoading(true)
    
    try {
      const res = await apiFetch(`/api/messages`, {
        method: 'POST',
        body: JSON.stringify({
          conversationId: activeChat.id,
          content: userText,
          requestAiReply: Boolean(activeChat.isBot),
          personaId: 'ai_annhien'
        })
      })

      if (res?.aiReply) {
        const aiMsg = {
          id: res.aiReply.id,
          sender: 'them',
          text: res.aiReply.content,
          time: new Date(res.aiReply.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
        setLocalMessages(prev => ({
          ...prev,
          [activeChat.id]: prev[activeChat.id].map(m => m.id === tempId ? { ...m, id: res.userMessage.id } : m).concat(aiMsg)
        }))
      }
    } catch (err) {
      console.error(err)
      alert('Lỗi gửi tin nhắn: ' + (err.message || 'Không rõ'))
    } finally {
      setIsAiLoading(false)
    }
  }

  const continueWithAi = async () => {
    if (!activeChat?.isBot) return
    handleSend('Mình muốn tiếp tục trò chuyện với AI')
  }

  const handleDeleteChat = async () => {
    if (!activeChat) return
    if (!window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return
    try {
      await apiFetch(`/api/conversations/${activeChat.id}`, { method: 'DELETE' })
      setChatList(prev => prev.filter(c => c.id !== activeChat.id))
      setLocalMessages(prev => {
        const newLocal = { ...prev }
        delete newLocal[activeChat.id]
        return newLocal
      })
      setActiveId(null)
    } catch (err) {
      console.error(err)
      alert('Không thể xóa cuộc trò chuyện.')
    }
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col overflow-hidden bg-cream lg:h-dvh">
      <div className="mx-auto grid h-full w-full max-w-[1480px] grid-cols-1 grid-rows-1 gap-0 sm:gap-4 p-0 sm:p-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:p-6">
        <aside className={`${showMobileChat ? 'hidden' : 'flex'} min-h-0 min-w-0 flex-col bg-white/55 sm:rounded-3xl sm:border sm:border-white/70 sm:shadow-sm sm:shadow-sage/5 lg:flex`}>
          <div className="border-b border-bark-light/6 p-5">
            <div className="mb-4 flex min-w-0 items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-bark">Tin nhắn</h1>
                <p className="mt-1 text-sm text-bark-light/48">Người đồng hành, chuyên gia và An Nhiên Bot.</p>
              </div>
              <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
                {chatList.reduce((sum, c) => sum + c.unread, 0)}
              </span>
            </div>

            <div className="relative min-w-0">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-bark-light/28"
              />
              <input
                type="text"
                placeholder="Tìm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-bark-light/8 bg-white/60 py-3 pl-10 pr-4 text-sm text-bark placeholder:text-bark-light/30 focus:border-sage/35 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {filteredConversations.map((chat) => {
              const isActive = chat.id === activeChat?.id
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveId(chat.id)
                    setShowMobileChat(true)
                  }}
                className={`mb-2 flex w-full min-w-0 items-center gap-3 rounded-2xl p-3 text-left transition active:scale-[0.98] ${
                    isActive ? 'bg-sage-ghost shadow-sm shadow-sage/5' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${chat.color}`}>
                      <span className="text-sm font-bold text-white">{chat.initials}</span>
                    </div>
                    {chat.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-cream bg-emerald-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-bark">
                      {chat.name}
                      {chat.isBot && <span className="ml-2 rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-bold text-sage">AI</span>}
                      {chat.role === 'doctor' && <span className="ml-2 rounded-full bg-lavender-light/70 px-2 py-0.5 text-[10px] font-bold text-bark">Bác sĩ</span>}
                      {chat.role === 'healer' && <span className="ml-2 rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-bold text-sage">Healer</span>}
                    </p>
                      <span className="shrink-0 text-[10px] text-bark-light/35">{chat.time}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-bark-light/48">{chat.lastMsg}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sage px-1.5 text-[10px] font-bold text-white">
                      {chat.unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        <section className={`${showMobileChat ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-col overflow-hidden bg-white/55 sm:rounded-3xl sm:border sm:border-white/70 sm:shadow-sm sm:shadow-sage/5 lg:flex`}>
          {activeChat && (
            <>
              <header className="flex items-center gap-3 border-b border-bark-light/6 px-4 py-3 sm:px-5 sm:py-4">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-bark transition hover:bg-sage-ghost active:scale-95 lg:hidden"
                  aria-label="Quay lại"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div className="relative shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${activeChat.color}`}>
                    <span className="text-sm font-bold text-white">{activeChat.initials}</span>
                  </div>
                  {activeChat.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-cream bg-emerald-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold tracking-tight text-bark">
                    {activeChat.name}
                    {activeChat.isBot && <span className="ml-2 rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-bold text-sage">AI</span>}
                    {activeChat.role === 'doctor' && <span className="ml-2 rounded-full bg-lavender-light/70 px-2 py-0.5 text-[11px] font-bold text-bark">Bác sĩ</span>}
                    {activeChat.role === 'healer' && <span className="ml-2 rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-bold text-sage">Healer</span>}
                  </h2>
                  <p className="text-xs text-bark-light/42">{activeChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[activeChat.role === 'doctor' ? faUserDoctor : faUserGroup, faShieldHalved].map((icon, index) => (
                    <button
                      key={index}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl text-sage transition hover:bg-sage-ghost active:scale-95"
                      aria-label="Hành động cuộc trò chuyện"
                    >
                      <FontAwesomeIcon icon={icon} />
                    </button>
                  ))}
                  <button
                    onClick={handleDeleteChat}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-red-400 transition hover:bg-red-50 active:scale-95"
                    aria-label="Xóa cuộc trò chuyện"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-sage transition hover:bg-sage-ghost active:scale-95">
                    <FontAwesomeIcon icon={faEllipsis} className="text-bark-light/40" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mx-auto flex max-w-4xl flex-col gap-3">
                  {activeChat.isBot && (
                    <div className="rounded-3xl border border-sage-light/20 bg-sage-ghost/58 p-4">
                      <p className="text-sm font-bold text-bark">An Nhiên hỏi cậu muốn đi theo hướng nào?</p>
                      <p className="mt-1 text-xs leading-5 text-bark-light/55">
                        Cậu có thể nhắn tiếp với AI, hoặc để AI random một healer đang online kết nối với cậu.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={continueWithAi}
                          className="h-10 rounded-full bg-sage px-4 text-xs font-bold text-white transition active:scale-[0.98]"
                        >
                          Nhắn với AI
                        </button>
                        <button
                          onClick={() => connectToStaff('healer')}
                          className="h-10 rounded-full border border-bark-light/8 bg-white/70 px-4 text-xs font-bold text-bark-light/70 transition hover:text-sage active:scale-[0.98]"
                        >
                          Kết nối healer
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => {
                    const isMe = message.sender === 'me'
                    return (
                      <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[78%]">
                          <div
                            className={`whitespace-pre-line rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                              isMe
                                ? 'rounded-br-lg bg-sage text-white shadow-sage/12'
                                : 'rounded-bl-lg border border-bark-light/7 bg-white/75 text-bark'
                            }`}
                          >
                            {message.text}
                          </div>
                          <p className={`mt-1 text-[10px] text-bark-light/28 ${isMe ? 'text-right' : 'text-left'}`}>{message.time}</p>
                        </div>
                      </div>
                    )
                  })}
                  
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[78%]">
                        <div className="rounded-3xl rounded-bl-lg border border-bark-light/7 bg-white/75 px-5 py-4 text-bark shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-dark/60"></span>
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-dark/60" style={{ animationDelay: '0.2s' }}></span>
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-dark/60" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <footer className="border-t border-bark-light/6 bg-cream/60 px-4 py-3 sm:px-5">
                <div className="mx-auto flex max-w-4xl items-end gap-2">
                  <input
                    type="text"
                    placeholder="Nhắn tin..."
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleSend()
                      }
                    }}
                    className="min-h-11 flex-1 rounded-2xl border border-bark-light/8 bg-white/70 px-4 text-sm text-bark placeholder:text-bark-light/28 focus:border-sage/35 focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition active:scale-95 ${
                      inputValue.trim() ? 'bg-sage text-white shadow-lg shadow-sage/18' : 'bg-white/70 text-sage/70'
                    }`}
                    aria-label="Gửi tin nhắn"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
                <p className="mx-auto mt-2 max-w-4xl text-[11px] text-bark-light/36">
                  Chat chỉ hỗ trợ văn bản để giữ an toàn và riêng tư.
                </p>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
