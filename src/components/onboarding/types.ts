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
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  is_global: boolean;
  user_id: string | null;
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

export type IconOption = {
  value: string;
  label: string;
  emoji: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { value: 'trophy', label: 'Trophy', emoji: '🏆' },
  { value: 'turtle', label: 'Turtle', emoji: '🐢' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐇' },
  { value: 'sheep', label: 'Sheep', emoji: '🐑' },
] 