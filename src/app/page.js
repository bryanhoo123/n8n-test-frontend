"use client";

import { useEffect, useRef, useState } from "react";

/* ========= Session ID ========= */
function getSessionId() {
  if (typeof window === "undefined") return null;

  let sid = localStorage.getItem("sessionId");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("sessionId", sid);
  }
  return sid;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ========= Send ========= */
  async function sendMessage() {
    if (!input && !file) return;

    /* ===== 自己发的：user（右边） ===== */
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: input,
        image: file ? URL.createObjectURL(file) : null,
      },
    ]);

    const formData = new FormData();
    formData.append("message", input);
    formData.append("sessionId", sessionId);
    if (file) formData.append("image", file);

    setInput("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "n8n error");
      }

      const reply =
        data.reply ??
        data.output ??
        "(no reply from n8n)";

      /* ===== n8n 回的：ai（左边） ===== */
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          text: `⚠️ n8n error: ${err.message}`,
        },
      ]);
    }
  }

  return (
    <div style={styles.container}>
      {/* ===== Chat history ===== */}
      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                m.role === "user"
                  ? "flex-end"
                  : m.role === "ai"
                  ? "flex-start"
                  : "center",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user"
                  ? styles.user
                  : m.role === "ai"
                  ? styles.ai
                  : styles.system),
              }}
            >
              {/* ===== 文本 / HTML ===== */}
              {m.text && (
                m.role === "ai" && m.text.trim().startsWith("<") ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: m.text }}
                  />
                ) : (
                  <div style={{ marginBottom: m.image ? 8 : 0 }}>
                    {m.text}
                  </div>
                )
              )}

              {/* ===== 图片 ===== */}
              {m.image && (
                <img
                  src={m.image}
                  alt="uploaded"
                  style={styles.image}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ===== Input bar ===== */}
      <div style={styles.inputBar}>
        <input
          type="file"
          ref={fileRef}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <textarea
          rows={3}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.textarea}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

/* ========= Styles ========= */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  chat: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
    background: "#f3f3f3",
  },
  bubble: {
    maxWidth: "70%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    whiteSpace: "pre-wrap",
    lineHeight: 1.4,
  },
  user: {
    background: "#DCF8C6",
  },
  ai: {
    background: "#ffffff",
  },
  system: {
    background: "#ffe4e4",
    color: "#900",
  },
  image: {
    maxWidth: "100%",
    maxHeight: 300,
    borderRadius: 8,
    display: "block",
  },
  inputBar: {
    display: "flex",
    gap: 8,
    padding: 10,
    borderTop: "1px solid #ccc",
  },
  textarea: {
    flex: 1,
    resize: "none",
  },
};
