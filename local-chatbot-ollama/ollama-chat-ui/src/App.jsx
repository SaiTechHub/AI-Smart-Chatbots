import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const bottomRef = useRef(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input; // keep input visible until sent
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput(""); // clear only after send
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Server error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col overflow-x-hidden">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Heading */}
          <p className="text-center text-sm font-semibold mb-2">
            Local Ollama Chatbot
          </p>

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {/* USER */}
                {m.role === "user" && (
                  <div className="flex justify-end">
                    <div className="relative bg-blue-600 text-white text-sm px-4 py-3 rounded-xl max-w-[75%] break-words">
                      <button
                        onClick={() => copyText(m.text, i)}
                        className="absolute top-2 right-2 text-white/70 hover:text-white"
                      >
                        {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <User size={14} className="inline mr-2" />
                      {m.text}
                    </div>
                  </div>
                )}

                {/* BOT */}
                {m.role === "bot" && (
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-[90%] bg-slate-900 border border-slate-800 rounded-xl px-6 py-5 shadow">

                      {/* GPT badge */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-[10px] flex items-center justify-center">
                        GPT
                      </div>

                      <button
                        onClick={() => copyText(m.text, i)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-white"
                      >
                        {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      <ReactMarkdown
                        className="prose prose-invert max-w-none text-[13px] leading-relaxed break-words"
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-center text-sm text-slate-400">
              GPT is thinking<span className="animate-pulse">...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom Prompt Area (ChatGPT style) */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800">

        {/* Input */}
        <div className="py-3">
          <div
            className={`mx-auto flex gap-3 ${
              hasMessages ? "max-w-[70%]" : "max-w-[40%]"
            }`}
          >
            <input
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-slate-900 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
