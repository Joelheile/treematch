
export interface Student {
  id: string;
  name: string;
  city: string;
  university: string;
  profileImage?: string;
  skills: string[];
  lookingFor: string[];
  summerGoals: string;
  currentProject: string;
  createdAt: Date;
}

export const AVAILABLE_SKILLS = [
  "Web Development",
  "Mobile Development", 
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Product Management",
  "Marketing",
  "Business Development",
  "Research",
  "Writing",
  "Photography",
  "Video Editing",
  "Consulting",
  "Finance",
  "Entrepreneurship",
  "Public Speaking",
  "Leadership",
  "Project Management",
  "Social Media",
  "Content Creation",
  "Artificial Intelligence",
  "Blockchain",
  "Cybersecurity",
  "Game Development",
  "Hardware Engineering"
];

export const LOOKING_FOR_OPTIONS = [
  "Co-founder",
  "Technical Partner",
  "Designer",
  "Marketing Partner", 
  "Research Collaborator",
  "Study Buddy",
  "Mentorship",
  "Networking",
  "Project Partner",
  "Startup Team",
  "Internship Buddy",
  "Social Group",
  "Hackathon Team",
  "Career Guidance",
  "Industry Connections"
];
