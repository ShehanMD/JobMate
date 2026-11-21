
import { useEffect, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  Users,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  FileText,
  Handshake,
  HardHat,
  Wrench,
  Paintbrush,
  Zap,
  Hammer,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import "./Home.css";

function TypingHeading() {
  const words = [
    "Discover Opportunities",
    "Find Great Jobs",
    "Build Your Career",
    "Connect with Skilled Workers",
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let delay = deleting ? 40 : 85;

    if (!deleting && displayText === currentWord) delay = 1700;
    if (deleting && displayText === "") delay = 350;

    const timer = setTimeout(() => {
      if (!deleting && displayText === currentWord) {
        setDeleting(true);
      } else if (deleting && displayText === "") {
        setDeleting(false);
        setWordIndex((previous) => (previous + 1) % words.length);
      } else if (deleting) {
        setDisplayText(currentWord.slice(0, -1).slice(0, displayText.length - 1));
      } else {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayText, deleting, wordIndex]);

  return (
    <span className="typing-visual">
      <span className="typing-bg-animation" />
      <span className="typing-text">{displayText}</span>
      <span className="typing-cursor">|</span>
    </span>
  );
}

/* =========================================
   JOBMATE SVG LINE DRAWING ANIMATION
========================================= */

function JobMateLineAnimation() {
  return (
    <div className="jobmate-line-scene">
      <svg
        className="jobmate-drawing"
        viewBox="0 0 560 390"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Employer and skilled worker connecting through JobMate"
      >
        <defs>
          <linearGradient id="lineGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>

        {/* Decorative circles */}
        <circle
          className="draw-decoration"
          cx="280"
          cy="145"
          r="125"
        />

        <circle
          className="draw-decoration draw-decoration-two"
          cx="280"
          cy="145"
          r="155"
        />

        {/* BOSS HEAD */}
        <circle
          className="draw-line boss-line line-1"
          cx="155"
          cy="88"
          r="31"
        />

        {/* BOSS HAIR */}
        <path
          className="draw-line boss-line line-2"
          d="M125 83 Q128 48 157 53 Q183 53 186 82"
        />

        {/* BOSS NECK */}
        <path
          className="draw-line boss-line line-3"
          d="M143 117 L143 137 M168 117 L168 137"
        />

        {/* BOSS BODY */}
        <path
          className="draw-line boss-line line-4"
          d="M143 132 L112 146 Q98 153 94 177 L82 237
             M168 132 L198 146 Q212 153 216 177 L228 237"
        />

        {/* BOSS SUIT */}
        <path
          className="draw-line boss-line line-5"
          d="M112 146 L155 176 L198 146
             M155 176 L155 256
             M155 176 L137 198 L124 180
             M155 176 L174 198 L187 180"
        />

        {/* BOSS ARMS */}
        <path
          className="draw-line boss-line line-6"
          d="M94 177 L78 219 L106 240
             M216 177 L232 219 L204 240"
        />

        {/* WORKER HEAD */}
        <circle
          className="draw-line worker-line line-7"
          cx="405"
          cy="88"
          r="31"
        />

        {/* WORKER HELMET */}
        <path
          className="draw-line worker-line line-8"
          d="M370 82 Q373 48 405 48 Q437 48 440 82
             M365 83 L445 83
             M405 48 L405 37"
        />

        {/* WORKER NECK */}
        <path
          className="draw-line worker-line line-9"
          d="M393 117 L393 137 M417 117 L417 137"
        />

        {/* WORKER BODY */}
        <path
          className="draw-line worker-line line-10"
          d="M393 132 L361 146 Q347 153 343 177 L331 237
             M417 132 L449 146 Q463 153 467 177 L479 237"
        />

        {/* WORKER SHIRT */}
        <path
          className="draw-line worker-line line-11"
          d="M361 146 L405 176 L449 146
             M405 176 L405 256
             M386 163 L405 181 L424 163"
        />

        {/* WORKER ARMS */}
        <path
          className="draw-line worker-line line-12"
          d="M343 177 L327 219 L355 240
             M467 177 L483 219 L455 240"
        />

        {/* CONNECTION LINE */}
        <path
          className="draw-line connection-line line-13"
          d="M228 211 C260 175 300 175 331 211"
        />

        <circle
          className="connection-dot dot-one"
          cx="228"
          cy="211"
          r="5"
        />

        <circle
          className="connection-dot dot-two"
          cx="331"
          cy="211"
          r="5"
        />

        {/* CONNECTION SYMBOL */}
        <path
          className="draw-line connection-line line-14"
          d="M267 191 L280 180 L293 191
             M280 180 L280 210"
        />

        {/* GROUND LINE */}
        <path
          className="draw-line ground-line line-15"
          d="M70 263 Q280 279 490 263"
        />

        {/* JOBMATE LOGO */}
        <text
          className="jobmate-logo-draw"
          x="280"
          y="330"
          textAnchor="middle"
        >
          JobMate
        </text>

        {/* LOGO UNDERLINE */}
        <path
          className="draw-line logo-underline line-16"
          d="M205 348 Q280 365 355 348"
        />
      </svg>

      <div className="animation-caption">
        <span className="caption-dot" />
        Connecting People. Creating Opportunities.
      </div>
    </div>
  );
}

/* =========================================
   WORKER CATEGORIES
========================================= */

const workerCategories = [
  {
    title: "Electricians",
    description: "Electrical repairs and installations",
    icon: Zap,
  },
  {
    title: "Plumbers",
    description: "Water systems and plumbing services",
    icon: Droplets,
  },
  {
    title: "Carpenters",
    description: "Woodwork and furniture services",
    icon: Hammer,
  },
  {
    title: "Painters",
    description: "Interior and exterior painting",
    icon: Paintbrush,
  },
  {
    title: "Technicians",
    description: "Technical repairs and maintenance",
    icon: Wrench,
  },
  {
    title: "Construction Workers",
    description: "Construction and building services",
    icon: HardHat,
  },
];

/* =========================================
   HOME PAGE
========================================= */

function Home() {
  return (
    <main className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Sri Lanka's Job & Skilled Worker Platform
            </div>

            <h1 className="hero-title">
              Find the Right Job or
              <br />
              <TypingHeading />
            </h1>

            <p className="hero-description">
              Connect with skilled professionals or discover great job
              opportunities — all in one place. JobMate makes finding
              opportunities and connecting with people easier.
            </p>

            <div className="hero-buttons">
              <a href="/jobs" className="btn-primary">
                <Search size={18} />
                Browse Jobs
                <ArrowRight size={17} />
              </a>

              <a href="/workers" className="btn-secondary">
                <Users size={18} />
                Find Skilled Workers
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <ShieldCheck size={18} />
                <span>Easy to Explore</span>
              </div>

              <div className="trust-item">
                <CheckCircle2 size={18} />
                <span>Simple Connections</span>
              </div>
            </div>

          </div>

          {/* NEW LINE DRAWING ANIMATION */}
          <div className="hero-animation-area">
            <JobMateLineAnimation />
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section">
        <div className="section-container">

          <div className="section-heading">
            <span className="section-tag">WHAT WE OFFER</span>
            <h2>Everything You Need in One Place</h2>
            <p>
              Whether you are looking for a job or searching for skilled
              professionals, JobMate makes the connection easier.
            </p>
          </div>

          <div className="services-grid">

            <article className="service-card">
              <div className="service-icon">
                <BriefcaseBusiness size={30} />
              </div>

              <h3>General Job Vacancies</h3>

              <p>
                Explore job opportunities from different industries and
                organizations. Find vacancies that match your interests
                and career goals.
              </p>

              <a href="/jobs" className="service-link">
                Browse Jobs <ArrowRight size={17} />
              </a>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <Users size={30} />
              </div>

              <h3>Skilled Worker Directory</h3>

              <p>
                Discover skilled and experienced professionals. Find the
                right person for repair, maintenance, and other services.
              </p>

              <a href="/workers" className="service-link">
                Find Workers <ArrowRight size={17} />
              </a>
            </article>

          </div>
        </div>
      </section>

      {/* LATEST JOBS */}
      <section className="jobs-section">
        <div className="section-container">

          <div className="section-heading">
            <span className="section-tag">CAREER OPPORTUNITIES</span>
            <h2>Latest Job Vacancies</h2>
            <p>
              Explore new opportunities and take the next step in your career.
            </p>
          </div>

          <div className="empty-jobs">
            <div className="empty-jobs-icon">
              <BriefcaseBusiness size={34} />
            </div>

            <h3>No Vacancies Available Yet</h3>

            <p>
              New job opportunities will appear here soon.
              Please check back later.
            </p>

            <a href="/jobs" className="btn-primary">
              Explore Jobs <ArrowRight size={17} />
            </a>
          </div>

        </div>
      </section>

      {/* WORKER CATEGORIES */}
      <section className="categories-section">
        <div className="section-container">

          <div className="section-heading">
            <span className="section-tag">SKILLED PROFESSIONALS</span>
            <h2>Find Workers by Category</h2>
            <p>
              Connect with professionals who have the skills you need.
            </p>
          </div>

          <div className="categories-grid">
            {workerCategories.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <a
                  href="/workers"
                  className="category-card"
                  key={category.title}
                >
                  <div className="category-icon">
                    <CategoryIcon size={25} />
                  </div>

                  <div className="category-info">
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </div>

                  <ArrowRight className="category-arrow" size={19} />
                </a>
              );
            })}
          </div>

          <div className="categories-bottom">
            <a href="/workers" className="text-link">
              Explore All Skilled Workers <ArrowRight size={17} />
            </a>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-container">

          <div className="section-heading">
            <span className="section-tag">SIMPLE PROCESS</span>
            <h2>How JobMate Works</h2>
            <p>
              Finding opportunities and skilled professionals has never
              been easier.
            </p>
          </div>

          <div className="steps-grid">

            <article className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <Search size={27} />
              </div>
              <h3>Explore Opportunities</h3>
              <p>
                Browse available job vacancies or explore skilled worker
                profiles.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <FileText size={27} />
              </div>
              <h3>View Details</h3>
              <p>
                Check job requirements or learn more about a worker's
                skills and experience.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <Handshake size={27} />
              </div>
              <h3>Take the Next Step</h3>
              <p>
                Follow the employer's application instructions or contact
                the skilled professional.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* JOIN AS WORKER */}
      <section className="join-section">
        <div className="section-container">

          <div className="join-content">

            <div className="join-text">
              <span className="section-tag">JOIN OUR COMMUNITY</span>

              <h2>
                Are You a Skilled Worker?
                <br />
                Let People Discover Your Skills.
              </h2>

              <p>
                Create your professional profile, showcase your experience,
                and make it easier for people to find your services.
              </p>

              <a href="/register" className="btn-primary">
                <UserPlus size={18} />
                Join as a Worker
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="join-visual">
              <div className="join-icon-circle">
                <Users size={65} />
              </div>

              <div className="join-floating-icon join-float-one">
                <CheckCircle2 size={23} />
              </div>

              <div className="join-floating-icon join-float-two">
                <BriefcaseBusiness size={23} />
              </div>
            </div>

          </div>
        </div>
      </section>

      

    </main>
  );
}

export default Home;
