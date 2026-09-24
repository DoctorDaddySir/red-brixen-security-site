export const profile = {
  name: 'Trent Shelton',
  location: 'Memphis, Tennessee',
  focus: 'Penetration testing & secure coding',
  introduction:
    'I work at the intersection of offensive security and software engineering. My focus is understanding how applications break—and how to build them better.',
  github: 'https://github.com/DoctorDaddySir',
  email: 'trent.shelton.primary@gmail.com',
  credential:
    'https://credentials.offsec.com/e09b9888-70b7-4542-a8cc-a308d86728d5',
};

export const capabilities = [
  {
    number: '01',
    title: 'Find the weakness.',
    label: 'PENETRATION TESTING',
    description:
      'Look beyond the happy path. Explore attack surfaces, question assumptions, and follow the connections between applications, identities, and infrastructure.',
    skills: ['Enumeration', 'Web & API security', 'Attack-path analysis'],
  },
  {
    number: '02',
    title: 'Understand the code.',
    label: 'SECURE ENGINEERING',
    description:
      'Connect a security finding to its underlying cause. Bring code review, stronger authorization, and practical remediation into the engineering workflow.',
    skills: [
      'Secure code review',
      'Authorization',
      'Vulnerability remediation',
    ],
  },
];

export const projects = [
  {
    number: '01',
    category: 'METHODOLOGY / KNOWLEDGE',
    title: 'Offensive Security Field Guide',
    description:
      'A structured collection of enumeration workflows, privilege-escalation playbooks, Active Directory notes, and reporting material.',
    tags: ['Penetration testing', 'Technical writing'],
    href: 'https://github.com/DoctorDaddySir/Red-Brixen-Offensive-Security-Field-Guide',
    visual: 'fieldguide',
    status: 'Independent project',
  },
  {
    number: '02',
    category: 'TOOLING / SOFTWARE',
    title: 'Pentai',
    description:
      'An operator-driven CLI project for organizing penetration-testing engagements, terminal sessions, and the evidence they produce.',
    tags: ['Java', 'CLI tooling', 'Workflow design'],
    href: 'mailto:trent.shelton.primary@gmail.com?subject=Let%E2%80%99s%20talk%20about%20Pentai',
    visual: 'pentai',
    status: 'Private project · In development',
  },
];

export const certifications = [
  {
    name: 'OffSec Certified Professional+ (OSCP+)',
    issuer: 'OffSec',
    detail: 'Issued June 2026 · Expires May 2029',
    href: profile.credential,
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    detail: '',
    href: '',
  },
  {
    name: 'Artificial Intelligence Master’s Program Certificate',
    issuer: 'Simplilearn',
    detail: 'Professional training certificate',
    href: '',
  },
];

export const skills = [
  {
    title: 'Security',
    items:
      'Penetration testing, secure code review, authorization controls, vulnerability remediation, dependency management',
  },
  {
    title: 'Engineering',
    items:
      'Java 25, Spring Boot, Spring MVC, Hibernate, REST APIs, SOAP, JMS, React',
  },
  {
    title: 'Data & delivery',
    items:
      'Oracle, MySQL, SQL Server, Liquibase, Docker, Git, Gradle, Maven, JUnit, Mockito',
  },
  {
    title: 'Scripting',
    items: 'Python, Bash, PowerShell, JavaScript, SQL, C#',
  },
];

export const experience = [
  {
    role: 'Independent security work & instruction',
    company: 'Self-employed',
    period: 'March 2026 — Present',
    bullets: [
      'Freelance application-security work informed by secure software development experience.',
      'Technical instruction, learning materials, and mentorship in cybersecurity and software development.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'TransConnect Services',
    period: 'June 2023 — March 2026',
    bullets: [
      'Performed secure code reviews, strengthened authorization controls, upgraded dependencies, and remediated vulnerabilities.',
      'Built and maintained backend services and REST APIs for customer-facing applications, internal systems, and third-party integrations.',
      'Developed Stripe payment and Comdata service integrations; managed database schema changes with Liquibase across Oracle and MySQL environments.',
    ],
  },
  {
    role: 'Software Developer',
    company: 'Hare Media Group',
    period: 'October 2022 — March 2023',
    bullets: [
      'Helped build a Background Check as a Service platform supporting sensitive-data workflows.',
      'Developed Java and Spring Boot services integrating third-party data providers, with ingestion, normalization, and report-generation logic.',
    ],
  },
  {
    role: 'Software Developer',
    company: 'GenSpark',
    period: 'March 2022 — October 2022',
    bullets: [
      'Developed full-stack applications and REST APIs using Java, Spring Boot, Spring MVC, React, and MySQL.',
      'Designed database schemas, optimized SQL queries, and wrote unit tests with JUnit and Mockito.',
    ],
  },
  {
    role: 'Tax Examiner & Lead Instructor',
    company: 'Internal Revenue Service',
    period: 'January 2020 — March 2022',
    bullets: [
      'Examined federal tax returns and researched complex records in a high-volume environment.',
      'Selected as a lead instructor across three onboarding cohorts; developed supplemental training materials and mentored new examiners.',
    ],
  },
];
