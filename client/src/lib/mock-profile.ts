import { ProfileData } from "@/lib/profile.store";

export const mockProfileData: ProfileData = {
    _id: "mock_id_123",
    user: "mock_user_id",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    education: [
        {
            institution: "Stanford University",
            degree: "Bachelor of Science in Computer Science",
            year: "2020-2024",
            _id: "edu_001",
        },
        {
            institution: "MIT",
            degree: "Master of Science in Artificial Intelligence",
            year: "2024-2026",
            _id: "edu_002",
        },
    ],
    experience: [
        {
            company: "Google",
            role: "Software Engineer",
            duration: "06 2023 – Present",
            _id: "exp_001",
        },
        {
            company: "Meta",
            role: "Junior Software Engineer",
            duration: "01 2022 – 05 2023",
            _id: "exp_002",
        },
        {
            company: "Startup XYZ",
            role: "Full Stack Developer Intern",
            duration: "06 2021 – 12 2021",
            _id: "exp_003",
        },
    ],
    skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "Machine Learning",
        "AWS",
        "Docker",
        "PostgreSQL",
        "MongoDB",
        "GraphQL",
        "REST APIs",
    ],
    resumeText: `JOHN DOE
San Francisco, CA
📧 john.doe@example.com | 📱 +1-555-123-4567 | 💼 linkedin.com/in/johndoe | 🐙 github.com/johndoe

PROFESSIONAL SUMMARY
Full-stack software engineer with 3+ years of experience building scalable web applications and machine learning solutions. 
Proven expertise in React, Node.js, and cloud technologies with a strong foundation in computer science and AI.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, Java
Frontend: React, Next.js, Vue.js, Redux, Tailwind CSS
Backend: Node.js, Express, Django, FastAPI, GraphQL
Databases: PostgreSQL, MongoDB, Redis, Firebase
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD
ML/AI: TensorFlow, PyTorch, Scikit-learn, LangChain
Tools: Git, VS Code, Figma, Jira, Postman

PROFESSIONAL EXPERIENCE

Software Engineer | Google
06 2023 – Present | Mountain View, CA
• Developed and maintained critical microservices handling 10M+ daily requests
• Implemented real-time features using WebSockets reducing latency by 40%
• Led a team of 3 engineers in redesigning the recommendation engine
• Improved system performance by 25% through database optimization

Junior Software Engineer | Meta
01 2022 – 05 2023 | Menlo Park, CA
• Built responsive UI components using React and TypeScript
• Collaborated with product team to deliver features impacting 100M+ users
• Reduced bundle size by 30% through code splitting and lazy loading
• Mentored 2 junior developers on best practices and system design

Full Stack Developer Intern | Startup XYZ
06 2021 – 12 2021 | San Francisco, CA
• Developed full-stack features for e-commerce platform using MERN stack
• Implemented user authentication and payment integration
• Wrote 150+ unit and integration tests achieving 85% code coverage

EDUCATION

Master of Science in Artificial Intelligence | MIT
2024 – 2026 | Cambridge, MA
GPA: 3.9/4.0

Bachelor of Science in Computer Science | Stanford University
2020 – 2024 | Stanford, CA
GPA: 3.8/4.0 | Honors: Summa Cum Laude

PROJECTS

E-Commerce Platform | React, Node.js, MongoDB, Stripe
• Built full-stack e-commerce platform with real-time inventory management
• Implemented Stripe payment processing with 99.9% uptime
• Achieved 95% Lighthouse performance score

AI Chatbot Assistant | Python, LangChain, OpenAI API
• Created intelligent chatbot using LLMs and retrieval-augmented generation
• Deployed on AWS Lambda with serverless architecture
• Processed 50K+ conversations with 92% user satisfaction

Portfolio Website | Next.js, Tailwind CSS, GitHub API
• Developed personal portfolio with dynamic project showcase
• Integrated GitHub API to display real-time project statistics
• Optimized for SEO with 100 Lighthouse score

CERTIFICATIONS & AWARDS
• AWS Certified Solutions Architect – Associate (2023)
• Google Cloud Professional Cloud Architect (2023)
• Stanford Excellence Award for Innovation (2024)`,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-03-19T15:45:00.000Z",
};
