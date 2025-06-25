export interface FormData {
  name: string;
  country: string;
  university: string;
  phoneNumber: string;
  profileImage: string;
  skillIds: string[];
  courses: string[];
  summerGoals: string;
  currentProject: string;
  linkedinUrl: string;
  instagramHandle: string;
  twitterHandle: string;
  githubUsername: string;
  websiteUrl: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  department?: string;
}

export interface Country {
  name: string;
  code: string;
}

export interface Step {
  number: number;
  title: string;
  subtitle: string;
} 