// js/data/content.js

// Hero Section Data
const heroData = {
    badge: "creative technologist",
    name: "Joel Lithgow",
    subtitle: "I help people think visually",
    description: "I'm a creative technologist who transforms complex ideas into intuitive digital experiences. With a unique blend of design thinking and technical expertise, I help teams build products that not only look amazing but actually work for real users.",
    floatingElements: [
        "currently: building the future",
        "status: open to opportunities",
        "location: everywhere"
    ]
};

// Statistics Data
const statisticsData = [
    { number: "5+", label: "years experience" },
    { number: "50+", label: "projects completed" },
    { number: "15+", label: "happy clients" },
    { number: "∞", label: "ideas per day" }
];

// Skills Data
const skillsData = {
    design: [
        "figma",
        "sketch", 
        "adobe cc",
        "prototyping",
        "user research",
        "design systems"
    ],
    development: [
        "javascript",
        "typescript",
        "react",
        "node.js",
        "python",
        "docker"
    ],
    "emerging tech": [
        "ai/ml",
        "webgl",
        "ar/vr",
        "blockchain",
        "iot",
        "web3"
    ]
};

// Process Steps Data
const processData = {
    title: "how i work",
    description: "I leverage advanced technologies and streamlined methodologies to accelerate the design process while maintaining quality and stakeholder alignment. By utilizing modern tools and efficient workflows, I eliminate translation gaps and enable instant collaborative feedback.",
    steps: [
        {
            id: 1,
            title: "ai research",
            description: "Leverage AI tools for competitive analysis, user insights, and strategic documentation to accelerate research phases and uncover deeper insights faster than traditional methods.",
            example: {
                title: "Real Example: Feature Planning",
                content: "Used Claude AI to analyze 20 competitors → strategic brief → GitHub issues in 2 hours. What typically takes days of manual research and documentation was completed in a single focused session, providing comprehensive competitive insights and actionable next steps."
            },
            icon: "research" // SVG icon identifier
        },
        {
            id: 2,
            title: "rapid prototyping",
            description: "Direct-to-prototype with real content, utilizing advanced tools and efficient workflows to create high-fidelity designs that eliminate translation issues between wireframes and final products.",
            example: {
                title: "Real Example: Homepage Redesign",
                content: "Stakeholder said 'make it more engaging' → 2-hour prototype session → shipped design that reduced bounce rate 36%. By jumping straight to high-fidelity prototypes with real content, we could test actual user reactions and iterate in real-time."
            },
            icon: "prototype" // SVG icon identifier
        },
        {
            id: 3,
            title: "live collaboration",
            description: "Real-time stakeholder sessions with instant implementation and feedback loops, transforming traditional review meetings into collaborative creation sessions that align teams immediately.",
            example: {
                title: "Real Example: Marketing Campaign",
                content: "Marketing team meeting → live Figma session → 10 ad variations in 1 hour vs. usual 3-day cycle. By implementing feedback in real-time, stakeholders could see their ideas come to life instantly, leading to better decisions and faster alignment."
            },
            icon: "collaboration" // SVG icon identifier
        },
        {
            id: 4,
            title: "technical implementation",
            description: "Full-stack development leveraging modern technologies and streamlined deployment processes, from feature planning through cloud deployment, ensuring designs become functional products efficiently.",
            example: {
                title: "Real Example: Infrastructure Migration",
                content: "Kubernetes → Cloud Run migration with Docker containerization and CI/CD pipeline setup. By utilizing modern cloud technologies and automated deployment processes, complex infrastructure changes were completed smoothly with minimal downtime."
            },
            icon: "implementation" // SVG icon identifier
        }
    ]
};

// Contact Data
const contactData = {
    title: "let's create",
    description: "Ready to bring your ideas to life? I'm always excited to collaborate on projects that push the boundaries of what's possible with design and technology.",
    methods: [
        {
            type: "email",
            label: "email",
            value: "hello@yourname.com",
            href: "mailto:hello@yourname.com"
        },
        {
            type: "linkedin",
            label: "linkedin",
            value: "connect with me",
            href: "https://linkedin.com/in/yourname"
        },
        {
            type: "github",
            label: "github",
            value: "see my code",
            href: "https://github.com/yourname"
        }
    ]
};

// About Section Data
const aboutData = {
    title: "about me",
    biography: "I'm passionate about creating digital experiences that feel both innovative and human. My journey spans from visual design to full-stack development, giving me a unique perspective on how to bridge the gap between what's possible and what's meaningful.",
    statistics: statisticsData,
    skills: skillsData
};

// Navigation Data
const navigationData = [
    { label: "work", href: "#work" },
    { label: "process", href: "#process" },
    { label: "about", href: "#about" },
    { label: "contact", href: "#contact" }
];

// Export all data
export {
    heroData,
    statisticsData,
    skillsData,
    processData,
    contactData,
    aboutData,
    navigationData
};

// Default export as a combined object
export default {
    hero: heroData,
    statistics: statisticsData,
    skills: skillsData,
    process: processData,
    contact: contactData,
    about: aboutData,
    navigation: navigationData
};