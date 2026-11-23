
import { useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Search,
  Users,
  FileText,
  Lightbulb,
  Paperclip,
  Minus,
} from "lucide-react";
import "./Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hello! I'm Job Assistant. How can I help you today?",
    },
  ]);

  const quickActions = [
    { label: "Find Jobs", icon: Search },
    { label: "Skilled Workers", icon: Users },
    { label: "CV Tips", icon: FileText },
    { label: "Career Advice", icon: Lightbulb },
  ];

  const sendMessage = async (text = input) => {
    const message = text.trim();

    if (!message || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          history: messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            text: msg.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply || "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      const errorMessage =
        error.name === "AbortError"
          ? "⏳ AI is taking too long to respond. Please try again."
          : "⚠️ Sorry, I'm unable to connect right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="jobmate-chatbot">
      {!isOpen && (
        <button
          className="chatbot-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open Job Assistant"
        >
          <MessageCircle size={27} />
          <span className="chatbot-notification">1</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-brand">
              <div className="chatbot-avatar chatbot-header-avatar">
                <Bot size={35} />
              </div>

              <div className="chatbot-brand-info">
                <h3>Job Assistant</h3>
                <span className="chatbot-online">
                  <span className="online-dot"></span>
                  {isLoading ? "Typing..." : "Online · Always here to help!"}
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
              >
                <Minus size={21} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <X size={23} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.length === 1 && (
              <>
                <div className="chatbot-welcome">
                  <div className="chatbot-avatar">
                    <Bot size={25} />
                  </div>

                  <div className="bot-message">
                    👋 Hello! I'm Job Assistant.
                    <br />
                    How can I help you today?
                  </div>
                </div>

                <div className="chatbot-quick-actions">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.label}
                        className="quick-action-btn"
                        onClick={() => sendMessage(action.label)}
                        disabled={isLoading}
                      >
                        <Icon size={19} />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {messages.slice(1).map((message) => (
              <div
                key={message.id}
                className={`chatbot-message-row ${
                  message.sender === "user"
                    ? "user-message-row"
                    : "bot-message-row"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="chatbot-avatar">
                    <Bot size={22} />
                  </div>
                )}

                <div
                  className={`chatbot-message ${
                    message.sender === "user"
                      ? "user-message"
                      : "bot-message"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message-row bot-message-row">
                <div className="chatbot-avatar">
                  <Bot size={22} />
                </div>

                <div className="chatbot-message bot-message chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chatbot-input-area">
            <button
              className="chatbot-attach-btn"
              aria-label="Attach file"
              type="button"
              disabled
              title="File attachment coming soon"
            >
              <Paperclip size={21} />
            </button>

            <form
              className="chatbot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />

              <button
                type="submit"
                className="chatbot-send-btn"
                aria-label="Send message"
                disabled={!input.trim() || isLoading}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
