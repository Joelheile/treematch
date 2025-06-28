export interface FormData {
  name: string;
  country: string;
  university: string;
  phoneNumber: string;
  profileImage: string;
  skillIds: string[];
  courses: string[];
  summerGoals: string;
  coolestThing: string;
  linkedinUrl: string;
  instagramHandle: string;
  twitterHandle: string;
  githubUsername: string;
  websiteUrl: string;
  icon: string;
  email: string;
  hasEngr145Team?: boolean;
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
  { value: 'squirrel', label: 'Squirrel', emoji: '🐿️' },
  { value: 'trophy', label: 'Trophy', emoji: '🏆' },
  { value: 'goat', label: 'Goat', emoji: '🐐' },
  { value: 'factory', label: 'Factory', emoji: '🏭' },
  { value: 'turtle', label: 'Turtle', emoji: '🐢' },
  { value: 'tree', label: 'Tree', emoji: '🌳' },
  { value: 'rocket', label: 'Rocket', emoji: '🚀' },
  { value: 'sun', label: 'Sun', emoji: '🌞' },
  { value: 'moon', label: 'Moon', emoji: '🌙' },
  { value: 'star', label: 'Star', emoji: '⭐' },
  { value: 'heart', label: 'Heart', emoji: '💖' },
  { value: 'flower', label: 'Flower', emoji: '🌺' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
  { value: 'cat', label: 'Cat', emoji: '🐱' },
  { value: 'horse', label: 'Horse', emoji: '🐴' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'dino', label: 'Dino', emoji: '🦖' },
  { value: 'lion', label: 'Lion', emoji: '🦁' },
  { value: 'pridest', label: 'The Pridest', emoji: '🍑💦' }
] 