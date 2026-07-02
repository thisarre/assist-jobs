import { db } from "./client";
import {
  users,
  companies,
  contacts,
  opportunities,
  interactions,
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Create a test user
  const [testUser] = await db
    .insert(users)
    .values({
      email: "test@freelance-os.dev",
      fullName: "Test User",
      profile: {
        bio: "Senior Front-End Engineer specializing in React and TypeScript",
        role: "Senior Front-End Engineer",
        skills: ["React", "Next.js", "TypeScript", "Vue.js", "Tailwind CSS"],
        preferredStack: ["React", "Next.js", "Node.js"],
        targetDailyRate: 650,
        preferredRemote: "remote",
        preferredLocation: "Paris, France",
        targetClients: "Startups and scale-ups in fintech and healthtech",
        yearsExperience: 8,
        languages: ["fr", "en"],
      },
    })
    .returning();

  // Create companies
  const [company1] = await db
    .insert(companies)
    .values({
      userId: testUser.id,
      name: "TechCorp",
      website: "https://techcorp.example.com",
      industry: "Fintech",
      size: "scaleup",
      location: "Paris, France",
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      relationshipStatus: "warm",
      score: 75,
      notes: "Met the CTO at a meetup. Active hiring.",
    })
    .returning();

  const [company2] = await db
    .insert(companies)
    .values({
      userId: testUser.id,
      name: "HealthStartup",
      website: "https://healthstartup.example.com",
      industry: "Healthtech",
      size: "startup",
      location: "Lyon, France",
      technologies: ["Vue.js", "TypeScript", "Python"],
      relationshipStatus: "cold",
      score: 60,
    })
    .returning();

  // Create contacts
  const [contact1] = await db
    .insert(contacts)
    .values({
      userId: testUser.id,
      companyId: company1.id,
      firstName: "Marie",
      lastName: "Dupont",
      role: "CTO",
      email: "marie@techcorp.example.com",
      language: "fr",
      relationshipStrength: "medium",
      notes: "Met at React Paris meetup in March 2026",
    })
    .returning();

  const [contact2] = await db
    .insert(contacts)
    .values({
      userId: testUser.id,
      companyId: company2.id,
      firstName: "James",
      lastName: "Wilson",
      role: "Engineering Manager",
      language: "en",
      relationshipStrength: "weak",
    })
    .returning();

  // Create opportunities
  await db.insert(opportunities).values([
    {
      userId: testUser.id,
      companyId: company1.id,
      contactId: contact1.id,
      title: "Senior React Developer - Fintech Platform",
      source: "linkedin",
      status: "contacted",
      priority: "high",
      probability: 60,
      dailyRate: 650,
      location: "Paris, France",
      remotePolicy: "hybrid",
      technologies: ["React", "TypeScript", "Next.js"],
      description: "6-month mission to rebuild the client dashboard",
      nextAction: "Wait for Marie's response to schedule a call",
      nextFollowupAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      language: "fr",
    },
    {
      userId: testUser.id,
      companyId: company2.id,
      contactId: contact2.id,
      title: "Vue.js Lead - Patient Portal",
      source: "referral",
      status: "detected",
      priority: "medium",
      probability: 30,
      dailyRate: 600,
      location: "Lyon, France",
      remotePolicy: "remote",
      technologies: ["Vue.js", "TypeScript"],
      description: "Building a new patient-facing portal",
      nextAction: "Research the company and prepare intro message",
      language: "en",
    },
    {
      userId: testUser.id,
      title: "React Native Mobile App",
      source: "malt",
      status: "to_contact",
      priority: "low",
      probability: 20,
      dailyRate: 550,
      remotePolicy: "remote",
      technologies: ["React Native", "TypeScript"],
      language: "fr",
    },
  ]);

  // Create interactions
  await db.insert(interactions).values([
    {
      userId: testUser.id,
      companyId: company1.id,
      contactId: contact1.id,
      type: "linkedin",
      direction: "outbound",
      content: "Sent connection request to Marie after the React meetup",
    },
    {
      userId: testUser.id,
      companyId: company1.id,
      contactId: contact1.id,
      type: "linkedin",
      direction: "inbound",
      content: "Marie accepted and mentioned they are looking for a React developer",
    },
  ]);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
