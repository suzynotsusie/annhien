import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faPaperPlane,
  faMagnifyingGlass,
  faPhone,
  faVideo,
  faEllipsis,
  faImage,
  faFaceSmile,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons'

/* ─── Conversations Data ─── */
export const conversations = [
  {
    id: 1, name: 'Chị Linh', initials: 'L', color: 'from-sage to-sage-dark',
    online: true, lastMsg: 'Cậu cảm thấy thế nào sau buổi nói chuyện hôm qua?', time: '10 phút', unread: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Chào Dương! Hôm nay cậu thế nào?', time: '14:20' },
      { id: 2, sender: 'me', text: 'Em chào chị! Em hơi mệt vì kỳ thi sắp tới ạ', time: '14:22' },
      { id: 3, sender: 'them', text: 'Chị hiểu. Áp lực học tập nhiều lúc khiến mình kiệt sức nhỉ. Cậu có muốn chia sẻ thêm không?', time: '14:23' },
      { id: 4, sender: 'me', text: 'Dạ em cảm thấy như mình không đủ giỏi, luôn phải cố gắng hơn nữa...', time: '14:25' },
      { id: 5, sender: 'them', text: 'Cảm giác đó rất bình thường. Nhưng cậu biết không, chỉ cần cậu đã cố gắng là đáng tự hào rồi', time: '14:26' },
      { id: 6, sender: 'them', text: 'Cậu cảm thấy thế nào sau buổi nói chuyện hôm qua?', time: '15:40' },
    ],
  },
  {
    id: 2, name: 'Anh Minh', initials: 'M', color: 'from-lavender to-lavender-light',
    online: false, lastMsg: 'Nhớ viết nhật ký trước khi ngủ nha!', time: '2 giờ', unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Chào Dương! Tuần này cậu có gì muốn chia sẻ không?', time: '10:00' },
      { id: 2, sender: 'me', text: 'Em có chuyện buồn về bạn bè ạ', time: '10:05' },
      { id: 3, sender: 'them', text: 'Anh nghe đây. Cậu kể cho anh nghe nhé, không vội gì cả', time: '10:06' },
      { id: 4, sender: 'me', text: 'Em cảm giác mấy đứa bạn thân ngày càng xa cách, không ai hiểu em', time: '10:10' },
      { id: 5, sender: 'them', text: 'Đó là một cảm giác rất khó chịu. Cậu có muốn thử nói chuyện trực tiếp với bạn mình không?', time: '10:12' },
      { id: 6, sender: 'them', text: 'Nhớ viết nhật ký trước khi ngủ nha!', time: '21:30' },
    ],
  },
  {
    id: 3, name: 'Chị Hà', initials: 'H', color: 'from-petal to-coral',
    online: true, lastMsg: 'Bài tập thở hôm nay cậu làm chưa?', time: '5 giờ', unread: 1,
    messages: [
      { id: 1, sender: 'them', text: 'Dương ơi, hôm nay chị gửi cậu một bài tập mới nhé', time: '09:00' },
      { id: 2, sender: 'me', text: 'Dạ vâng ạ, em sẵn sàng rồi!', time: '09:15' },
      { id: 3, sender: 'them', text: 'Mỗi sáng khi thức dậy, cậu hít thở sâu 5 lần, rồi nghĩ về 3 điều mình biết ơn', time: '09:16' },
      { id: 4, sender: 'them', text: 'Bài tập thở hôm nay cậu làm chưa?', time: '11:00' },
    ],
  },
  {
    id: 4, name: 'An Nhiên Bot', initials: 'AN', color: 'from-sage-muted to-sage-ghost',
    online: true, lastMsg: 'Mình ở đây bất cứ khi nào cậu cần', time: 'Hôm qua', unread: 0, isBot: true,
    messages: [
      { id: 1, sender: 'them', text: 'Xin chào Dương! Mình là An Nhiên, trợ lý AI của cậu', time: '08:00' },
      { id: 2, sender: 'them', text: 'Cậu có thể chia sẻ với mình bất cứ điều gì. Mình luôn ở đây lắng nghe, không phán xét', time: '08:00' },
      { id: 3, sender: 'me', text: 'Cảm ơn bạn! Mình muốn hiểu thêm về cách quản lý stress', time: '08:30' },
      { id: 4, sender: 'them', text: 'Tuyệt vời! Có vài phương pháp mình gợi ý:\n\nThở sâu 4-7-8\nViết nhật ký cảm xúc\nĐi bộ trong thiên nhiên\nNghe nhạc thư giãn\n\nCậu muốn thử cái nào trước?', time: '08:31' },
      { id: 5, sender: 'them', text: 'Mình ở đây bất cứ khi nào cậu cần', time: '22:00' },
    ],
  },
]

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
                {[faPhone, faVideo, faEllipsis].map((icon, i) => (
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
                <div className="flex items-center gap-0.5 pb-1.5">
                  {[faImage, faFaceSmile].map((icon, i) => (
                    <button key={i} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-bark-light/5 transition-colors cursor-pointer active:scale-95">
                      <FontAwesomeIcon icon={icon} className="text-base text-sage/70" />
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  <input ref={inputRef} type="text" placeholder="Nhắn tin..."
                    value={inputValue} onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-bark-light/8
                      text-sm text-bark placeholder:text-bark-light/20 font-light
                      focus:outline-none focus:border-sage/30 focus:bg-white/60 transition-all" />
                </div>
                <div className="pb-1">
                  {inputValue.trim() ? (
                    <button onClick={handleSend}
                      className="w-9 h-9 rounded-full bg-sage flex items-center justify-center shadow-md shadow-sage/15
                        transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                      <FontAwesomeIcon icon={faPaperPlane} className="text-sm text-white" />
                    </button>
                  ) : (
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-bark-light/5 transition-colors cursor-pointer active:scale-95">
                      <FontAwesomeIcon icon={faMicrophone} className="text-base text-sage/70" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
