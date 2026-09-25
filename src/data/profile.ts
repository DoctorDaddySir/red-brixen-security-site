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
    name: 'Artificial Intelligence Master’s Program Certificate',
    issuer: 'Simplilearn',
    detail: 'Professional training certificate',
    href: 'https://success.simplilearn.com/936534eb-fec4-4c7b-aa64-244a357b393b#acc.zHV2BMva',
  },
];

export const skills = [
  {
    title: 'Offensive Security',
    items:
      'Penetration testing, web and API testing, Active Directory security, attack-path analysis, enumeration, privilege escalation, lateral movement, credential attacks, vulnerability validation, post-exploitation',
  },
  {
    title: 'Application Security',
    items:
      'Secure code review, authentication and authorization testing, threat modeling, vulnerability remediation, dependency security, OWASP methodology, security architecture, secure design, API security, security control validation',
  },
  {
    title: 'Software Engineering',
    items:
      'Java 25, Spring Boot, Spring MVC, Hibernate, REST APIs, SOAP, JMS, object-oriented design, backend services, enterprise integrations, distributed systems, React, automated testing',
  },
  {
    title: 'Security Research & Tooling',
    items:
      'Vulnerability research, CVE analysis, exploit reproduction, proof-of-concept development, attack-surface analysis, Burp Suite, Nmap, BloodHound, Impacket, Metasploit, Mimikatz, Rubeus, ffuf, NetExec, Ligolo-ng',
  },
  {
    title: 'Systems, Cloud & Delivery',
    items:
      'Linux, Windows, AWS, Docker, networking, virtualization, Git, GitHub Actions, CI/CD, Oracle, MySQL, SQL Server, Liquibase, Gradle, Maven, security lab design',
  },
  {
    title: 'Programming & Technical Leadership',
    items:
      'Java, Python, Bash, PowerShell, JavaScript, TypeScript, SQL, C#, automation, CLI development, technical instruction, curriculum development, mentorship, technical writing, security reporting, documentation',
  },
];

export const profileStory = [
  {
    chapter: 'BUILDING SINCE 1996',
    title: 'Curiosity came first.',
    paragraphs: [
      'I began developing software in 1996, building utilities and experimenting with automation, networking, and software distribution in the early AOL era. Online communities gave me a place to explore how things worked—and what I could make them do.',
      'That curiosity grew into work on backend services, enterprise integrations, payment systems, and full-stack applications. Getting close to the code is still how I make sense of a system.',
    ],
  },
  {
    chapter: 'SECURITY & SOFTWARE',
    title: 'Follow the question. Understand the weakness.',
    paragraphs: [
      'Red Brixen brings together my offensive-security research and application-security work. I explore attack paths, develop tooling, and turn what I learn into testing methodologies and practical engineering improvements.',
      'Penetration testing and secure coding inform each other: understanding how software is built helps me test it, and understanding how it fails helps me build it better.',
    ],
  },
  {
    chapter: 'TEACHING & SHARING',
    title: 'Make the knowledge useful.',
    paragraphs: [
      'I enjoy helping people find their way into difficult technical ideas. I create hands-on labs, demonstrations, and learning materials covering programming, ethical hacking, and security methodology.',
      'My time examining tax returns and leading onboarding instruction at the IRS also shaped how I approach complex systems: be precise, document the reasoning, and help the next person understand it.',
    ],
  },
];
