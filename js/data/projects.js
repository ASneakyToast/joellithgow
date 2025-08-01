// js/data/projects.js
const projects = [
    {
        id: 'homepage-redesign',
        number: '01',
        type: 'homepage redesign',
        title: 'CCA homepage redesign',
        description: 'data-driven redesign that solved user confusion about institutional identity, achieving a 33% reduction in confusion-driven navigation while improving conversion paths and engagement metrics',
        technologies: [
            'user research',
            'google analytics',
            'stakeholder interviews',
            'conversion optimization'
        ],
        impact: '33% reduction in confusion-driven navigation',
        images: [
            {
                src: 'assets/images/homepage-scroll-720.webm',
                alt: 'CCA homepage before and after redesign comparison',
                caption: 'Homepage transformation showing improved clarity and user flow',
                type: 'video'
            },
            {
                src: 'assets/images/homepage-wavyfeatures-image--processed.png',
                alt: 'Homepage wavy features section design',
                caption: 'Dynamic wavy features section showcasing CCA programs and community'
            },
            {
                src: 'assets/images/homepage-adm-image--processed.png',
                alt: 'Homepage admissions section design',
                caption: 'Strategic admissions section with clear conversion paths and program highlights'
            },
            {
                src: 'assets/images/homepage-experience-image--processed.png',
                alt: 'Homepage experience section design',
                caption: 'Community experience section demonstrating progressive disclosure approach'
            },
            {
                src: 'assets/images/homepage-hero-image--processed.png',
                alt: 'Homepage hero section design',
                caption: 'Clean, focused hero section establishing CCA identity and value proposition'
            }
        ],
        // Extended data from the modal
        subtitle: 'homepage redesign',
        overview: 'A comprehensive homepage redesign that transformed user understanding of CCA\'s identity while dramatically improving conversion metrics and user engagement.',
        duration: '4 months',
        team: 'Joel Lithgow (UX), Tanza Solis (Dev), Stephanie Smith (Strategy), Nikol Plass (PM)',
        role: 'lead ux designer',
        tools: 'figma, google analytics, looker studio',
        problem: 'Users landing on CCA\'s homepage didn\'t understand what the institution was or where it was located. Analytics showed high bounce rates and users immediately clicking to the "About" page in the footer, indicating fundamental communication failure.',
        solution: 'Redesigned the homepage with a "front door" approach - immediately communicating CCA\'s identity, location in San Francisco, and value proposition before progressively revealing community content and conversion opportunities.',
        process: [
            {
                title: 'stakeholder interviews',
                description: 'Conducted interviews with key departments to understand what they felt was missing from the current homepage and identify core messaging priorities.'
            },
            {
                title: 'analytics analysis',
                description: 'Deep dive into Google Analytics data to understand user behavior patterns, bounce rates, and navigation flows from the existing homepage.'
            },
            {
                title: 'content strategy',
                description: 'Developed a progressive disclosure approach: identity first, community second, conversion third.'
            },
            {
                title: 'rapid prototyping',
                description: 'Created high-fidelity prototypes with real content to test messaging hierarchy and visual communication.'
            }
        ],
        insights: [
            'The homepage needed to function as CCA\'s "front door" - balancing user needs for immediate brand understanding with admissions team conversion goals',
            'Users weren\'t getting essential information upfront: who CCA was, what programs were offered, and where they were located',
            'A strategic three-phase approach emerged: awareness (hero/identity), consideration (community/programs), conversion (CTAs)'
        ],
        metrics: [
            { number: '33%', label: 'reduction in "about" clicks' },
            { number: '20%', label: 'increase of engagement time' }
        ],
        liveLink: {
            title: 'see for yourself',
            url: 'https://www.cca.edu',
            description: 'Visit the live CCA homepage to experience the redesigned user flow'
        }
    },
    {
        id: 'editorial-process',
        number: '02',
        type: 'creative webpages',
        title: 'multimedia digital storytelling',
        description: 'creating unique digital web experiences for the CCA editorial newsroom through innovative design and multimedia storytelling, delivering custom editorial content experiences',
        technologies: [
            'rapid prototyping',
            'figma',
            'vev.design',
            'multimedia storytelling'
        ],
        impact: 'unique web experiences for editorial content',
        images: [
            {
                src: 'assets/images/vev-studio_forward-thumbnail.webm',
                alt: 'Multimedia digital storytelling workflow demonstration',
                caption: 'Creative digital storytelling process using modern web technologies',
                type: 'video'
            },
            {
                src: 'assets/images/vev-designfaculty-image--processed.png',
                alt: 'Design faculty showcase multimedia storytelling page',
                caption: 'Faculty spotlight featuring interactive multimedia elements and engaging visual storytelling'
            },
            {
                src: 'assets/images/vev-studioforward-image--processed.png',
                alt: 'Studio Forward exhibition digital experience',
                caption: 'Custom digital exhibition experience showcasing student work through immersive storytelling'
            },
            {
                src: 'assets/images/vev-commencement-image--processed.png',
                alt: 'Commencement ceremony multimedia story layout',
                caption: 'Dynamic commencement coverage transformed into engaging multimedia narrative format'
            },
            {
                src: 'assets/images/vev-summer-image--processed.png',
                alt: 'Summer program multimedia storytelling showcase',
                caption: 'Summer program coverage featuring dynamic layouts and interactive multimedia storytelling elements'
            }
        ],
        // Extended data from the modal
        subtitle: 'multimedia storytelling',
        overview: 'Creating unique digital web experiences for the CCA editorial newsroom through innovative design and storytelling using modern web technologies.',
        duration: 'ongoing process (6+ months)',
        team: 'editorial + digital strategy team',
        role: 'designer',
        tools: 'vev.design, multimedia storytelling',
        problem: 'A marketing department-wide initiative to visually demonstrate the creativity and energy happening on campus within our newsroom was being limited by generic CMS templates that didn\'t reflect the vibrant community and brand identity of what was actually happening at CCA.',
        solution: 'Create unique, custom digital storytelling experiences that capture the authentic energy and creativity of the CCA community by moving beyond generic CMS templates to craft bespoke multimedia narratives that truly reflect campus life and identity.',
        insights: [
            'Generic CMS templates fail to capture the authentic energy and creativity of campus life',
            'Custom digital storytelling experiences better reflect community identity and brand values',
            'Multimedia narratives can transform editorial content into engaging, immersive experiences'
        ],
        metrics: [
            { number: '1 hour', label: 'meeting to final design' },
            { number: '85%', label: 'stakeholder satisfaction' },
            { number: '3 days', label: 'time saved per project' }
        ],
        liveLinks: {
            title: 'see for yourself',
            description: 'Explore the unique digital storytelling experiences created for CCA\'s editorial newsroom',
            links: [
                { title: 'Bringing the San Francisco design community together with light and sound', url: 'https://cca.edu/newsroom/future-resonance-studio-forward/' },
                { title: 'CCA students graduate as their true, authentic selves', url: 'https://cca.edu/newsroom/commencement-looks-2023/' },
                { title: 'Practice to Pedagogy', url: 'https://cca.edu/newsroom/design-is-faculty-practices/' },
                { title: 'GLANCE 2024', url: 'https://cca.edu/glance/' },
                { title: 'Creative Citizenship Energizes Campus', url: 'https://cca.edu/newsroom/creative-citizenship-on-campus/' }
            ]
        }
    },
    {
        id: 'infrastructure-migration',
        number: '03',
        type: 'infrastructure migration',
        title: 'kubernetes to cloud run migration',
        description: 'modernizing deployment infrastructure by migrating from complex kubernetes setup to streamlined cloud run with automated ci/cd pipeline',
        technologies: [
            'kubernetes',
            'cloud run',
            'docker',
            'ci/cd pipeline'
        ],
        impact: 'zero-downtime migration with 70% faster deployments',
        // Extended data from the modal
        subtitle: 'infrastructure migration',
        overview: 'A comprehensive infrastructure modernization project that transformed a complex Kubernetes deployment into a streamlined Cloud Run solution, demonstrating adaptability in learning new cloud technologies.',
        duration: '3 weeks',
        team: 'solo project with stakeholder collaboration',
        role: 'full-stack developer',
        tools: 'kubernetes, google cloud run, docker, github actions',
        problem: 'Existing Kubernetes infrastructure was complex to maintain, slow to deploy, and required specialized knowledge that created bottlenecks. Team needed a more accessible and efficient deployment solution.',
        solution: 'Migrated to Google Cloud Run with containerized applications and automated CI/CD pipeline, prioritizing simplicity and developer experience while maintaining performance and reliability.',
        process: [
            {
                title: 'learning phase',
                description: 'Deep dive into Cloud Run documentation and best practices, coming from zero prior experience with Google Cloud Platform.'
            },
            {
                title: 'migration strategy',
                description: 'Developed step-by-step migration plan to minimize downtime and risk, including rollback procedures and testing protocols.'
            },
            {
                title: 'containerization',
                description: 'Dockerized applications and optimized container builds for Cloud Run\'s specific requirements and constraints.'
            },
            {
                title: 'ci/cd automation',
                description: 'Implemented GitHub Actions pipeline for automated testing, building, and deployment to Cloud Run services.'
            }
        ],
        insights: [
            'Cloud-native solutions can dramatically simplify operations when chosen thoughtfully for the specific use case',
            'Learning new technologies requires systematic documentation and experimentation approach',
            'Understanding static file handling in containerized environments is crucial for successful cloud deployments'
        ],
        metrics: [
            { number: '0min', label: 'deployment downtime' },
            { number: '70%', label: 'faster deployments' },
            { number: '90%', label: 'reduced manual steps' }
        ]
    },
    {
        id: 'ai-powered-portfolio',
        number: '04',
        type: 'ai-augmented development',
        title: '24-Hour AI-Powered Portfolio: From Job Posting to Deployment',
        description: 'When a dream job opportunity appeared with an urgent application deadline, I pioneered a collaborative AI-powered development workflow that allowed me to build a sophisticated single-page application portfolio in under 24 hours.',
        technologies: [
            'claude ai',
            'strategic planning',
            'rapid prototyping',
            'netlify deployment'
        ],
        impact: 'Portfolio successfully landed target position',
        images: [
            {
                src: 'assets/images/ai-portfolio-homepage.png',
                alt: 'AI-powered portfolio homepage screenshot showing modern design and smooth interactions',
                caption: 'The completed AI-powered portfolio homepage demonstrating sophisticated SPA-like experience with smooth transitions and professional design'
            }
        ],
        // Extended data from the modal
        subtitle: 'ai-augmented development',
        overview: 'A groundbreaking portfolio development project that demonstrated how AI collaboration can accelerate creative and technical work without compromising quality, proving that speed and excellence can coexist when human creativity is amplified by strategic AI partnership.',
        duration: 'under 24 hours',
        team: 'Joel Lithgow + Claude AI (collaborative development partner)',
        role: 'creative technologist',
        tools: 'claude code, netlify, mcp integration, strategic interview process',
        problem: 'When a dream job opportunity appeared with an urgent application deadline, I needed to create a professional portfolio from scratch—fast. Traditional development timelines would have made meeting the deadline impossible, but rushing would compromise the quality needed to make a strong impression.',
        solution: 'Rather than rushing through a basic website, I pioneered a collaborative AI-powered development workflow that allowed me to build a sophisticated single-page application portfolio in under 24 hours, focusing on strategic thinking and creative decisions while AI handled implementation details.',
        process: [
            {
                title: 'strategic interview phase',
                description: 'Started with Claude conducting a recruiter-style interview to clarify my professional narrative and value proposition, ensuring the portfolio would tell a compelling story rather than just showcase projects.'
            },
            {
                title: 'rapid prototyping with ai',
                description: 'Used AI to experiment with modern design systems and test concepts through live demo pages, iterating on design and functionality in real-time rather than working from static mockups.'
            },
            {
                title: 'iterative development partnership',
                description: 'Collaborated with Claude Code as an AI development partner to build a SPA-like experience with smooth transitions and modal-based case studies, focusing on architectural decisions while AI handled coding implementation.'
            },
            {
                title: 'seamless deployment integration',
                description: 'Learned and deployed to Netlify through MCP integration—all within the same workflow, demonstrating how AI collaboration can include the entire development lifecycle from concept to production.'
            }
        ],
        insights: [
            'AI collaboration isn\'t just about coding faster—it\'s about creating space for higher-level creative and strategic decisions while maintaining technical excellence',
            'By chunking work into focused conversations and creating strategic briefs, I spent less time on repetitive coding tasks and more time refining content quality and design polish',
            'The AI advantage allows for rapid iteration cycles that would typically take weeks to achieve, but only when paired with clear strategic thinking and creative direction'
        ],
        metrics: [
            { number: '24hrs', label: 'total development time' },
            { number: '100%', label: 'application success rate' },
            { number: '3', label: 'interactive case studies' },
            { number: '0', label: 'page reloads needed' }
        ]
    }
    /*,
    {
        id: 'ai-pipeline',
        number: '04',
        type: 'ai-augmented development',
        title: 'end-to-end ai pipeline',
        description: 'complete feature development from research to deployment using ai tools for every step of the process, achieving strategy to deployment in just 1 day',
        technologies: [
            'claude ai',
            'github integration',
            'playwright automation',
            'cloud deployment'
        ],
        impact: 'strategy to deployment in 1 day',
        images: [
            {
                src: 'assets/images/landscape-placeholder.svg',
                alt: 'AI-augmented development workflow diagram',
                caption: 'Complete feature development pipeline using AI tools for every stage'
            },
            {
                src: 'assets/images/landscape-placeholder.svg',
                alt: 'Claude AI interface showing automated code generation',
                caption: 'AI-guided development process with human oversight at critical decision points'
            }
        ],
        // Extended data from the modal
        subtitle: 'ai-augmented development',
        overview: 'Pioneered a complete feature development workflow using AI tools for every stage from research to deployment, demonstrating the future of human-AI collaboration in product development.',
        duration: '1 day (proof of concept)',
        team: 'solo exploration',
        role: 'creative technologist',
        tools: 'claude ai, github, playwright, cloud run',
        problem: 'Traditional feature development cycles are slow and resource-intensive, requiring coordination across multiple team members and tools. Could AI augment the entire process while maintaining quality?',
        solution: 'Built an experimental workflow where AI tools handle research, strategy documentation, issue creation, code generation, testing, and deployment guidance - with human oversight at each critical decision point.',
        process: [
            {
                title: 'ai research & strategy',
                description: 'Used AI research tools to gather competitive insights and formalize strategy documentation, turning hours of manual research into minutes of guided discovery.'
            },
            {
                title: 'automated issue creation',
                description: 'Translated research and stakeholder conversations into structured GitHub issues using Claude\'s GitHub integration capabilities.'
            },
            {
                title: 'ai-guided development',
                description: 'Leveraged Claude Code to read issues and generate implementation plans, then develop features with human guidance on architectural decisions.'
            },
            {
                title: 'automated testing',
                description: 'Used Claude MCP Playwright tools to automate browser testing and QA processes, ensuring feature quality without manual testing cycles.'
            }
        ],
        insights: [
            'AI excels at structured tasks but needs human judgment for creative and strategic decisions',
            'The bottleneck shifts from execution to decision-making and quality control',
            'Documentation becomes crucial when AI is handling implementation details'
        ],
        metrics: [
            { number: '24hrs', label: 'total development time' },
            { number: '90%', label: 'process automation' },
            { number: '5x', label: 'speed improvement' }
        ]
    }
    */
];

export default projects;