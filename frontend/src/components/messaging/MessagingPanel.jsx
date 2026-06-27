import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faPaperPlane,
  faMagnifyingGlass,
  faEllipsis,
  faShieldHalved,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { conversations } from '../../lib/mockData'

export default function MessagingPanel({ isOpen, isClosing, onClose }) {
  const [activeChat, setActiveChat] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [localMessages, setLocalMessages] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat, localMessages])

  useEffect(() => {
    if (activeChat && inputRef.current) setTimeout(() => inputRef.current?.focus(), 400)
  }, [activeChat])

  useEffect(() => {
    if (!isOpen) setTimeout(() => { setActiveChat(null); setSearchQuery('') }, 350)
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  const handleSend = () => {
    if (!inputValue.trim() || !activeChat) return
    const newMsg = {
      id: Date.now(), sender: 'me', text: inputValue.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }
    setLocalMessages(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMsg] }))
    setInputValue('')
  }

  const getMessages = (chat) => [...chat.messages, ...(localMessages[chat.id] || [])]
  const filteredConversations = conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-bark/25 ${isClosing ? 'animate-overlay-out' : 'animate-overlay-in'}`}
        onClick={() => activeChat ? setActiveChat(null) : onClose()}
      />

      {/* Panel */}
      <div className={`absolute bottom-0 left-0 right-0 h-[84%] rounded-t-[28px] overflow-hidden
        bg-cream/95 backdrop-blur-2xl border-t border-white/50
        shadow-2xl shadow-sage/10
        ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        {/* ─── CONVERSATION LIST ─── */}
        {!activeChat && (
          <div className="h-full flex flex-col">
            <div className="pt-3 pb-2 px-5">
              <div className="w-10 h-1 rounded-full bg-bark-light/10 mx-auto mb-5" />

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-bark tracking-tight">Tin nhắn</h2>
                  {totalUnread > 0 && (
                    <p className="text-[11px] text-sage font-medium mt-0.5">{totalUnread} chưa đọc</p>
                  )}
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center
                    bg-bark-light/5 hover:bg-bark-light/10 transition-colors cursor-pointer text-bark-light/40 text-xs
                    active:scale-95" aria-label="Đóng">
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-bark-light/25" />
                <input type="text" placeholder="Tìm cuộc trò chuyện..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/40 border border-bark-light/8
                    text-sm text-bark placeholder:text-bark-light/25 font-light
                    focus:outline-none focus:border-sage/30 focus:bg-white/60 transition-all" />
              </div>
            </div>

            {/* Online avatars */}
            <div className="px-5 py-3">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {conversations.filter(c => c.online).map(c => (
                  <button key={c.id} onClick={() => setActiveChat(c)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group active:scale-95 transition-transform">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color}
                        flex items-center justify-center shadow-sm shadow-sage/10
                        transition-transform duration-200 group-hover:scale-105`}>
                        <span className="text-white text-xs font-semibold">{c.initials}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-cream" />
                    </div>
                    <span className="text-[10px] text-bark-light/50 font-medium truncate max-w-[48px]">
                      {c.name.split(' ').pop()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide scroll-touch px-3">
              {filteredConversations.map((chat) => (
                <button key={chat.id} onClick={() => setActiveChat(chat)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl text-left
                    transition-all duration-200 cursor-pointer hover:bg-white/40 active:scale-[0.98]"
                  id={`chat-${chat.id}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${chat.color} flex items-center justify-center shadow-sm shadow-sage/8`}>
                      <span className="text-white text-sm font-semibold">{chat.initials}</span>
                    </div>
                    {chat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-cream" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm leading-tight truncate ${chat.unread > 0 ? 'font-bold text-bark' : 'font-medium text-bark/80'}`}>
                        {chat.name}
                        {chat.isBot && <span className="ml-1.5 text-[9px] text-sage bg-sage/10 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
                      </span>
                      <span className="text-[10px] text-bark-light/35 font-light flex-shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <p className={`text-xs leading-snug truncate ${chat.unread > 0 ? 'text-bark-light/70 font-medium' : 'text-bark-light/40 font-light'}`}>
                      {chat.lastMsg}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-sage flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{chat.unread}</span>
                    </div>
                  )}
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xl text-bark-light/15 mb-3" />
                  <p className="text-sm text-bark-light/35 font-light">Không tìm thấy</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CHAT VIEW ─── */}
        {activeChat && (
          <div className="h-full flex flex-col">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-bark-light/6">
              <button onClick={() => setActiveChat(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-bark-light/5 transition-colors cursor-pointer active:scale-95"
                aria-label="Quay lại">
                <FontAwesomeIcon icon={faChevronLeft} className="text-sm text-bark-light/50" />
              </button>
              <div className="relative flex-shrink-0">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeChat.color} flex items-center justify-center shadow-sm shadow-sage/8`}>
                  <span className="text-white text-[11px] font-semibold">{activeChat.initials}</span>
                </div>
                {activeChat.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-cream" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-bark leading-tight truncate tracking-tight">
                  {activeChat.name}
                  {activeChat.isBot && <span className="ml-1.5 text-[9px] text-sage bg-sage/10 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
                </p>
                <p className="text-[10px] text-bark-light/35 font-light">
                  {activeChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                {[faUserGroup, faShieldHalved, faEllipsis].map((icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-bark-light/5 transition-colors cursor-pointer active:scale-95">
                    <FontAwesomeIcon icon={icon} className={`text-sm ${i < 2 ? 'text-sage' : 'text-bark-light/35'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide scroll-touch px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-bark-light/6" />
                <span className="text-[10px] text-bark-light/25 font-light">Hôm nay</span>
                <div className="flex-1 h-px bg-bark-light/6" />
              </div>

              {getMessages(activeChat).map((msg) => {
                const isMe = msg.sender === 'me'
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[78%]">
                      <div className={`
                        px-4 py-2.5 text-sm leading-relaxed font-light whitespace-pre-line
                        ${isMe
                          ? 'bg-sage text-white rounded-2xl rounded-br-md'
                          : 'bg-white/50 border border-bark-light/8 text-bark rounded-2xl rounded-bl-md'
                        }
                      `}>{msg.text}</div>
                      <p className={`text-[9px] text-bark-light/25 font-light mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-4 pt-2 border-t border-bark-light/6">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <input ref={inputRef} type="text" placeholder="Nhắn tin..."
                    value={inputValue} onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-bark-light/8
                      text-sm text-bark placeholder:text-bark-light/20 font-light
                      focus:outline-none focus:border-sage/30 focus:bg-white/60 transition-all" />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-9 h-9 rounded-full bg-sage flex items-center justify-center shadow-md shadow-sage/15
                    transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed">
                  <FontAwesomeIcon icon={faPaperPlane} className="text-sm text-white" />
                </button>
              </div>
              <p className="mt-2 px-1 text-[10px] text-bark-light/32">Chỉ hỗ trợ tin nhắn văn bản.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
