import type { BrandData, Scene, GeneratedAsset } from "./store";

export const mockBrand: BrandData = {
  name: "FlowSync",
  tagline: "Automate your workflow, amplify your team",
  colors: ["#7c3aed", "#06b6d4", "#f59e0b"],
  tone: "Professional yet approachable",
  audience: "SaaS teams, product managers, startups",
  cta: "Start Free Trial",
  features: [
    "Real-time collaboration",
    "AI-powered task routing",
    "One-click integrations",
    "Custom dashboards",
    "Automated reporting",
  ],
  screenshots: [],
};

export const mockScenes: Scene[] = [
  {
    id: "s1",
    title: "Hook",
    script: "Tired of scattered workflows? Meet FlowSync.",
    duration: 3,
    visualDescription: "Bold text zoom-in on gradient background",
  },
  {
    id: "s2",
    title: "Problem",
    script: "Teams waste 5+ hours a week switching between tools.",
    duration: 3,
    visualDescription: "Animated stat counter with icon grid",
  },
  {
    id: "s3",
    title: "Solution",
    script: "FlowSync brings everything into one AI-powered hub.",
    duration: 4,
    visualDescription: "Product screenshot with highlight annotations",
  },
  {
    id: "s4",
    title: "Features",
    script: "Real-time collab. Smart routing. One-click integrations.",
    duration: 4,
    visualDescription: "Feature cards sliding in with icons",
  },
  {
    id: "s5",
    title: "CTA",
    script: "Start your free trial today. No credit card needed.",
    duration: 3,
    visualDescription: "CTA button pulse with brand gradient background",
  },
];

export const mockAssets: GeneratedAsset[] = [
  {
    id: "a1",
    format: "reel",
    label: "Instagram Reel (9:16)",
    width: 1080,
    height: 1920,
    status: "done",
  },
  {
    id: "a2",
    format: "story",
    label: "Story (9:16)",
    width: 1080,
    height: 1920,
    status: "done",
  },
  {
    id: "a3",
    format: "square",
    label: "Square Post (1:1)",
    width: 1080,
    height: 1080,
    status: "done",
  },
  {
    id: "a4",
    format: "landscape",
    label: "Landscape (16:9)",
    width: 1920,
    height: 1080,
    status: "done",
  },
  {
    id: "a5",
    format: "linkedin",
    label: "LinkedIn Video (16:9)",
    width: 1920,
    height: 1080,
    status: "done",
  },
];
