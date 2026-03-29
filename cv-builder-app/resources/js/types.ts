
export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  targetRole?: string;
  targetKeywords?: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  graduationDate: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies?: string;
  goals?: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    profilePicture?: string;
    customLinks: SocialLink[];
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  languages: string[];
  activities: string[];
  references: Reference[];
  accentColor: string;
  sectionVisibility: {
    education: boolean;
    experience: boolean;
    projects: boolean;
    skills: boolean;
    languages: boolean;
    activities: boolean;
    summary: boolean;
    references: boolean;
  };
  sectionOrder: string[];
}

export interface User {
  id: string;
  phone: string;
  name?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailColor: string;
}

export const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex J. Developer",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "alexdev.com",
    profilePicture: "",
    customLinks: [
      { id: "1", platform: "LinkedIn", url: "linkedin.com/in/alexj" },
      { id: "2", platform: "GitHub", url: "github.com/alexj" }
    ]
  },
  accentColor: "#2563eb", // Default blue-600
  summary: "Results-oriented Senior Software Engineer with 6+ years of experience in full-stack development. Proven track record of delivering scalable web applications and optimizing system performance. Skilled in React, Node.js, and Cloud Infrastructure. Passionate about AI integration and user-centric design.",
  experience: [
    {
      id: "1",
      jobTitle: "Senior Frontend Engineer",
      company: "TechFlow Solutions",
      startDate: "2021-03",
      endDate: "Present",
      description: "• Led a team of 5 developers to rebuild the core customer dashboard, improving load times by 40%.\n• Implemented a new design system using React and Tailwind CSS, increasing development velocity by 25%.\n• Mentored junior engineers and conducted code reviews to ensure high-quality standards."
    },
    {
      id: "2",
      jobTitle: "Software Developer",
      company: "Innovate Corp",
      startDate: "2018-06",
      endDate: "2021-02",
      description: "• Developed and maintained multiple client-facing e-commerce platforms.\n• Integrated payment gateways (Stripe, PayPal) and optimized checkout flows.\n• Collaborated with UX designers to implement responsive and accessible interfaces."
    }
  ],
  education: [
    {
      id: "1",
      degree: "B.S. Computer Science",
      school: "University of Technology",
      graduationDate: "2018-05",
      description: "Graduated with Honors. President of the Coding Club."
    }
  ],
  projects: [
    {
      id: "p1",
      name: "E-Commerce Dashboard",
      description: "• Built a comprehensive analytics dashboard for e-commerce store owners to track real-time sales and inventory.\n• Optimized data fetching using GraphQL, reducing redundant API calls by 50%.\n• Designed an intuitive UI using D3.js for complex data visualization.",
      link: "github.com/alexj/dashboard",
      technologies: "React, D3.js, Firebase",
      goals: "Create a scalable analytics tool for high-traffic stores."
    }
  ],
  skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "AWS", "Git", "Agile", "Next.js", "GraphQL"],
  languages: ["English (Native)", "Spanish (Conversational)"],
  activities: ["Open Source Contributor", "Tech Meetup Speaker", "Marathon Runner"],
  references: [
    {
      id: "r1",
      name: "Sarah Connors",
      position: "CTO",
      company: "TechFlow Solutions",
      email: "sarah@techflow.com",
      phone: "(555) 987-6543"
    }
  ],
  sectionVisibility: {
    education: true,
    experience: true,
    projects: true,
    skills: true,
    languages: true,
    activities: true,
    summary: true,
    references: true
  },
  sectionOrder: [
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "languages",
    "activities",
    "references"
  ]
};

export const TEMPLATES: Template[] = [
  { id: "modern", name: "Modern Clean", description: "Clean layout with a sidebar", thumbnailColor: "bg-blue-500" },
  { id: "classic", name: "Classic Serif", description: "Traditional elegant style", thumbnailColor: "bg-gray-700" },
  { id: "minimal", name: "Minimalist", description: "Simple and whitespace heavy", thumbnailColor: "bg-white border" },
  { id: "tech", name: "Tech Bold", description: "High contrast for developers", thumbnailColor: "bg-slate-900" },
  { id: "creative", name: "Creative Color", description: "Accents of color", thumbnailColor: "bg-purple-500" },
  { id: "executive", name: "Executive", description: "Authoritative and dense", thumbnailColor: "bg-emerald-700" },
  { id: "compact", name: "Compact Grid", description: "Fits a lot of info", thumbnailColor: "bg-indigo-600" },
  { id: "timeline", name: "Timeline", description: "Focus on history", thumbnailColor: "bg-orange-500" },
  { id: "split", name: "Split Heavy", description: "50/50 visual split", thumbnailColor: "bg-teal-600" },
  { id: "plain", name: "Plain Text", description: "Maximum ATS compatibility", thumbnailColor: "bg-gray-200" },
];
