export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  startingPrice: number;
}

export interface Attraction {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  duration: string;
  description: string;
}

export interface TravelPackage {
  id: string;
  name: string;
  image: string;
  duration: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  highlights: string[];
  category: string;
  demoLink?: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  content: string;
  destination: string;
  verified: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  lastFetched?: string;
}

export interface RSSItem {
  id: string;
  title: string;
  source: string;
  category: string;
  publishedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  image?: string;
  content?: string;
}

export interface GeneratedContent {
  id: string;
  title: string;
  thumbnail: string;
  blogPost: string;
  facebookPost: string;
  instagramCaption: string;
  linkedinPost: string;
  twitterPost: string;
  aiImage: string;
  seoTitle: string;
  metaDescription: string;
  hashtags: string[];
  status: 'generated' | 'approved' | 'published';
}
