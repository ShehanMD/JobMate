
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
  Home,
} from "lucide-react";
import "./Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [currentMenu, setCurrentMenu] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hello! I'm Job Assistant. How can I help you today?",
    },
  ]);

  const quickActions = [
    { label: "Find Jobs", icon: Search, menu: "jobs" },
    { label: "Skilled Workers", icon: Users, menu: "workers" },
    { label: "CV Tips", icon: FileText, menu: "cv" },
    { label: "Career Advice", icon: Lightbulb, menu: "career" },
  ];

  const menus = {
    jobs: {
      title: "Find Jobs",
      welcome:
        "Great! I can help you with job searching. What would you like to know?",
      options: [
        {
          label: "Job Categories",
          response:
            "You can explore opportunities in IT, Finance, Marketing, Management, Engineering, Hospitality and many other fields. Visit the Jobs section on PattaJobs to explore available vacancies.",
        },
        {
          label: "Job Types",
          response:
            "Common job types include:\n\n• Full-time\n• Part-time\n• Internship\n• Contract\n• Remote\n\nCheck the job details to see the employment type.",
        },
        {
          label: "How to Apply",
          response:
            "To apply for a job:\n\n1. Open the Jobs section.\n2. Select a suitable vacancy.\n3. Read the job requirements.\n4. Click Apply Now if you meet the requirements.\n\nMake sure your profile and CV are updated.",
        },
      ],
    },

    workers: {
      title: "Skilled Workers",
      welcome:
        "Looking for skilled workers? Here are some ways to find suitable candidates.",
      options: [
        {
          label: "Find Workers",
          response:
            "Visit the Workers section on PattaJobs to explore available worker profiles. Review their skills, qualifications and experience before contacting them.",
        },
        {
          label: "Search by Skills",
          response:
            "You can look for workers based on skills such as:\n\n• Web Development\n• Graphic Design\n• Accounting\n• Marketing\n• Customer Service\n• Data Entry\n\nChoose skills that match your requirements.",
        },
        {
          label: "Employer Guide",
          response:
            "As an employer, you can:\n\n1. Create your employer profile.\n2. Explore suitable worker profiles.\n3. Review qualifications and experience.\n4. Contact suitable candidates.\n\nUse the relevant sections of PattaJobs to get started.",
        },
      ],
    },

    cv: {
      title: "CV Tips",
      welcome:
        "Let's improve your CV! Select a topic below to get helpful tips.",
      options: [
        {
          label: "CV Structure",
          response:
            "A professional CV should normally include:\n\n1. Contact Information\n2. Professional Summary\n3. Education\n4. Work Experience\n5. Skills\n6. Certifications\n7. References (if requested)\n\nKeep your CV clear and easy to read.",
        },
        {
          label: "CV Writing Tips",
          response:
            "Tips for a better CV:\n\n• Use a professional email address.\n• Highlight relevant skills.\n• Use clear headings.\n• Include achievements where possible.\n• Check spelling and grammar.\n• Keep the information accurate.",
        },
        {
          label: "Common CV Mistakes",
          response:
            "Avoid these common mistakes:\n\n• Spelling and grammar errors.\n• Unprofessional email addresses.\n• Too much unnecessary information.\n• Incorrect contact details.\n• False or exaggerated qualifications.\n\nAlways review your CV before applying.",
        },
      ],
    },

    career: {
      title: "Career Advice",
      welcome:
        "I'm here to help you develop your career. Choose a topic below.",
      options: [
        {
          label: "Interview Tips",
          response:
            "Prepare for interviews by:\n\n• Researching the company.\n• Practising common interview questions.\n• Dressing professionally.\n• Arriving on time.\n• Communicating confidently.\n• Asking relevant questions.",
        },
        {
          label: "First Job Tips",
          response:
            "Looking for your first job?\n\n• Create a professional CV.\n• Highlight your education and skills.\n• Apply for internships and entry-level roles.\n• Build your communication skills.\n• Prepare for interviews.\n• Keep learning.",
        },
        {
          label: "Improve Your Skills",
          response:
            "You can improve your career opportunities by developing:\n\n• English communication\n• Computer literacy\n• Problem-solving\n• Teamwork\n• Time management\n• Technical skills related to your career.\n\nFree online courses can also help you learn new skills.",
        },
      ],
    },
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender,
        text,
      },
    ]);
  };

  const handleTopic = (menuKey) => {
    const menu = menus[menuKey];

    if (!menu) return;

    addMessage("user", menu.title);
    addMessage("bot", menu.welcome);
    setCurrentMenu(menuKey);
  };

  const handleOption = (option) => {
    addMessage("user", option.label);
    addMessage("bot", option.response);
  };

  const handleMainMenu = () => {
    setCurrentMenu(null);
    addMessage(
      "bot",
      "🏠 You're back at the main menu. How else can I help you?"
    );
  };

  const handleTextMessage = (e) => {
    e.preventDefault();

    const message = input.trim();

    if (!message) return;

    addMessage("user", message);
    setInput("");

    const text = message.toLowerCase();

    const keywordMenus = [
      {
        menu: "jobs",
        keywords: ["job", "jobs", "vacancy", "vacancies", "employment"],
      },
      {
        menu: "workers",
        keywords: ["worker", "workers", "employee", "employees", "hire"],
      },
      {
        menu: "cv",
        keywords: ["cv", "resume", "cover letter"],
      },
      {
        menu: "career",
        keywords: ["career", "interview", "first job", "skills"],
      },
    ];

    const matchedMenu = keywordMenus.find((item) =>
      item.keywords.some((keyword) => text.includes(keyword))
    );

    if (matchedMenu) {
      const menu = menus[matchedMenu.menu];
      setCurrentMenu(matchedMenu.menu);

      addMessage(
        "bot",
        `${menu.welcome}\n\nPlease choose one of the options below.`
      );
      return;
    }

    const faqAnswers = [
      {
        keywords: ["apply", "application"],
        answer:
          "To apply for a job, visit the Jobs section, select a suitable vacancy and follow the application instructions.",
      },
      {
        keywords: ["register", "registration", "sign up", "account"],
        answer:
          "To get started, use the Register option on PattaJobs and complete the required information.",
      },
      {
        keywords: ["password", "login", "log in"],
        answer:
          "If you cannot access your account, check your email and password. You can also use the Forgot Password option if available.",
      },
      {
        keywords: ["contact", "support", "help"],
        answer:
          "For further assistance, please use the Contact or Support section available on PattaJobs.",
      },
      {
        keywords: ["thank", "thanks"],
        answer:
          "You're welcome! 😊 I'm always here to help you with PattaJobs.",
      },
      {
        keywords: ["hello", "hi", "hey"],
        answer:
          "Hello! 👋 Welcome to PattaJobs. Choose one of the options above to get started.",
      },
    ];

    const matchedFAQ = faqAnswers.find((item) =>
      item.keywords.some((keyword) => text.includes(keyword))
    );

    if (matchedFAQ) {
      addMessage("bot", matchedFAQ.answer);
    } else {
      addMessage(
        "bot",
        "I'm a button-based Job Assistant, so I can help with predefined topics only. 😊\n\nPlease select Find Jobs, Skilled Workers, CV Tips or Career Advice above."
      );
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
                  Online · Always here to help!
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
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={
                  index === 0
                    ? "chatbot-welcome"
                    : `chatbot-message-row ${
                        message.sender === "user"
                          ? "user-message-row"
                          : "bot-message-row"
                      }`
                }
              >
                {message.sender === "bot" && (
                  <div className="chatbot-avatar">
                    <Bot size={index === 0 ? 25 : 22} />
                  </div>
                )}

                <div
                  className={`chatbot-message ${
                    message.sender === "user"
                      ? "user-message"
                      : "bot-message"
                  } ${index === 0 ? "chatbot-welcome-message" : ""}`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {!currentMenu && (
              <div className="chatbot-quick-actions">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      className="quick-action-btn"
                      onClick={() => handleTopic(action.menu)}
                    >
                      <Icon size={19} />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentMenu && (
              <div className="chatbot-menu-options">
                {menus[currentMenu].options.map((option) => (
                  <button
                    key={option.label}
                    className="quick-action-btn"
                    onClick={() => handleOption(option)}
                  >
                    <span>{option.label}</span>
                  </button>
                ))}

                <button
                  className="chatbot-home-btn"
                  onClick={handleMainMenu}
                >
                  <Home size={17} />
                  <span>Main Menu</span>
                </button>
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
              onSubmit={handleTextMessage}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                type="submit"
                className="chatbot-send-btn"
                aria-label="Send message"
                disabled={!input.trim()}
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
