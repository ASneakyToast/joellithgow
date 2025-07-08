// js/data/projects.js
const projects = [
    {
        id: 'homepage-redesign',
        number: '01',
        type: 'homepage redesign',
        title: 'cca.edu transformation',
        description: 'data-driven redesign that solved user confusion about institutional identity while improving conversion paths and engagement metrics',
        technologies: [
            'user research',
            'google analytics',
            'stakeholder interviews',
            'conversion optimization'
        ],
        impact: '36% reduction in confusion-driven navigation',
        // Extended data from the modal
        subtitle: 'homepage redesign',
        overview: 'A comprehensive homepage redesign that transformed user understanding of CCA\'s identity while dramatically improving conversion metrics and user engagement.',
        duration: '4 months',
        team: 'marketing team + 1 developer',
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
            'Users needed immediate geographic context - San Francisco location was crucial for prospective students',
            'The old content-first approach buried institutional identity',
            'Stakeholders needed to see themselves reflected in the new design to buy in'
        ],
        metrics: [
            { number: '36%', label: 'reduction in "about" clicks' },
            { number: '28%', label: 'increase in page engagement' },
            { number: '15%', label: 'more admissions event clicks' }
        ]
    },
    {
        id: 'ai-pipeline',
        number: '02',
        type: 'ai-augmented development',
        title: 'end-to-end ai pipeline',
        description: 'complete feature development from research to deployment using ai tools for every step of the process',
        technologies: [
            'claude ai',
            'github integration',
            'playwright automation',
            'cloud deployment'
        ],
        impact: 'strategy to deployment in 1 day',
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
    },
    {
        id: 'editorial-process',
        number: '03',
        type: 'collaborative design',
        title: 'real-time editorial process',
        description: 'high-fidelity rapid prototyping workflow that transforms stakeholder meetings into collaborative design sessions',
        technologies: [
            'rapid prototyping',
            'figma',
            'live collaboration',
            'multimedia storytelling'
        ],
        impact: '3 days reduced to 1 hour iteration cycles',
        // Extended data from the modal
        subtitle: 'collaborative design',
        overview: 'Developed a revolutionary workflow that transforms traditional design review meetings into collaborative creation sessions through high-fidelity rapid prototyping.',
        duration: 'ongoing process (6+ months)',
        team: 'editorial team + marketing',
        role: 'design facilitator',
        tools: 'figma, real content, live collaboration',
        problem: 'Traditional design workflows create bottlenecks where non-designers struggle to visualize ideas, leading to lengthy revision cycles and misaligned expectations.',
        solution: 'Skip wireframes entirely - jump straight to high-fidelity prototypes using real content, then facilitate live design sessions where stakeholders can see their feedback implemented instantly.',
        process: [
            {
                title: 'editorial strategy session',
                description: 'Team evaluates story pitches not just for editorial merit but for multimedia potential and available content assets.'
            },
            {
                title: 'rapid hi-fi prototyping',
                description: 'Create multiple high-fidelity design directions using actual story content and real images before the next team meeting.'
            },
            {
                title: 'live collaborative iteration',
                description: 'Present prototypes in working sessions where I implement feedback and suggestions in real-time, allowing non-designers to "design" by seeing ideas come to life instantly.'
            },
            {
                title: 'immediate alignment',
                description: 'Team leaves meeting with clear vision and aligned expectations, eliminating revision cycles and scope creep.'
            }
        ],
        insights: [
            'Real content reveals design problems that lorem ipsum hides',
            'Live implementation gets stakeholders excited and engaged in ways static presentations cannot',
            'Non-designers can contribute meaningfully when they see immediate visual feedback'
        ],
        metrics: [
            { number: '1 hour', label: 'meeting to final design' },
            { number: '85%', label: 'stakeholder satisfaction' },
            { number: '3 days', label: 'time saved per project' }
        ]
    },
    {
        id: 'cross-department',
        number: '04',
        type: 'technical translation',
        title: 'cross-department integration',
        description: 'bridging technical constraints with business goals across marketing, development, and stakeholder teams',
        technologies: [
            'stakeholder management',
            'system architecture',
            'data analytics',
            'process optimization'
        ],
        impact: 'aligned multiple departments on unified vision',
        // Extended data from the modal
        subtitle: 'technical translation',
        overview: 'Served as technical translator between marketing operations, external agencies, and internal systems to align data collection strategies with business intelligence needs.',
        duration: '6 months (ongoing)',
        team: 'marketing + external agency + IT',
        role: 'technical translator',
        tools: 'workday, pardot, google analytics, looker',
        problem: 'Marketing team and external ad agency struggled to set up proper data collection systems, leading to incomplete insights and misaligned campaign optimization.',
        solution: 'Bridge the gap between technical system capabilities (Workday, Pardot) and marketing intelligence needs by translating requirements and identifying integration opportunities.',
        process: [
            {
                title: 'system architecture audit',
                description: 'Mapped existing data flows between Workday, Pardot, Google Analytics, and other systems to identify gaps and opportunities.'
            },
            {
                title: 'requirement translation',
                description: 'Interpreted marketing team\'s analytics needs into specific technical field configurations and data collection strategies.'
            },
            {
                title: 'cross-team facilitation',
                description: 'Led sessions between marketing ops, external agency, and IT to align on implementation approach and timeline.'
            },
            {
                title: 'ongoing optimization',
                description: 'Continuous monitoring and refinement of data collection to ensure marketing insights remain actionable and accurate.'
            }
        ],
        insights: [
            'Technical systems often have capabilities that business teams don\'t know exist',
            'External agencies need internal context to set up effective measurement',
            'Data architecture decisions have long-term implications for business intelligence'
        ],
        metrics: [
            { number: '100%', label: 'data collection accuracy' },
            { number: '3 depts', label: 'successfully aligned' },
            { number: '50%', label: 'reporting efficiency gain' }
        ]
    }
];

export default projects;