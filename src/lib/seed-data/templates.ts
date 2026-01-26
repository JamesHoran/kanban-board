// src/lib/seed-data/templates.ts
import type { SeedBoard } from "./seed-repository";

/**
 * Board templates used for seeding new user accounts.
 * These are copied to the user's account when they first sign up.
 */
export const BOARD_TEMPLATES: SeedBoard[] = [
  {
    id: "board-1",
    name: "Home Renovation",
    labels: [
      { id: "lbl-1", name: "Kitchen", color: "#e57373" },
      { id: "lbl-2", name: "Budget", color: "#64b5f6" },
      { id: "lbl-3", name: "Urgent", color: "#f44336" },
    ],
    columns: [
      {
        id: "col-1",
        position: 0,
        name: "To Research",
        cards: [
          {
            id: "card-1",
            position: 0,
            title: "Compare kitchen countertop materials",
            description:
              "Quartz vs granite vs butcher block - check durability, cost, and maintenance",
            due_date: "2024-02-15T00:00:00Z",
            card_labels: [
              { label: { id: "lbl-1" } },
              { label: { id: "lbl-2" } },
            ],
          },
        ],
      },
      {
        id: "col-2",
        position: 1,
        name: "In Progress",
        cards: [
          {
            id: "card-2",
            position: 0,
            title: "Get quotes from contractors",
            description: "Called 3 contractors, waiting on 2 more estimates",
            due_date: "2024-01-30T00:00:00Z",
            card_labels: [{ label: { id: "lbl-3" } }],
          },
        ],
      },
      {
        id: "col-3",
        position: 2,
        name: "Done",
        cards: [
          {
            id: "card-3",
            position: 0,
            title: "Measure bathroom dimensions",
            description: "Main: 8'x6', Vanity area: 36\" wide",
            card_labels: [],
          },
          {
            id: "card-4",
            position: 1,
            title: "Set renovation budget",
            description: "Approved: $25,000 total",
            card_labels: [{ label: { id: "lbl-2" } }],
          },
        ],
      },
    ],
  },
  {
    id: "board-2",
    name: "Product Roadmap",
    labels: [
      { id: "lbl-4", name: "Enhancement", color: "#4db6ac" },
      { id: "lbl-5", name: "Nice to Have", color: "#90a4ae" },
      { id: "lbl-6", name: "Mobile", color: "#ba68c8" },
      { id: "lbl-7", name: "Feature", color: "#7986cb" },
      { id: "lbl-8", name: "High Priority", color: "#e57373" },
      { id: "lbl-9", name: "Testing", color: "#fff176" },
      { id: "lbl-10", name: "Design", color: "#f06292" },
      { id: "lbl-11", name: "Setup", color: "#a1887f" },
    ],
    columns: [
      {
        id: "col-4",
        position: 0,
        name: "Backlog",
        cards: [
          {
            id: "card-5",
            position: 0,
            title: "Add dark mode support",
            description:
              "Implement system preference detection + manual toggle",
            card_labels: [
              { label: { id: "lbl-4" } },
              { label: { id: "lbl-5" } },
            ],
          },
          {
            id: "card-6",
            position: 1,
            title: "Mobile responsive nav",
            description: "Hamburger menu for screens under 768px",
            card_labels: [{ label: { id: "lbl-6" } }],
          },
        ],
      },
      {
        id: "col-5",
        position: 1,
        name: "In Development",
        cards: [
          {
            id: "card-7",
            position: 0,
            title: "User authentication flow",
            description:
              "Login, signup, password reset pages + API integration",
            due_date: "2024-02-28T00:00:00Z",
            card_labels: [
              { label: { id: "lbl-7" } },
              { label: { id: "lbl-8" } },
            ],
          },
        ],
      },
      {
        id: "col-6",
        position: 2,
        name: "Testing",
        cards: [
          {
            id: "card-8",
            position: 0,
            title: "Write unit tests for cart module",
            description: "Cover add, remove, update quantity operations",
            due_date: "2024-02-10T00:00:00Z",
            card_labels: [{ label: { id: "lbl-9" } }],
          },
        ],
      },
      {
        id: "col-7",
        position: 3,
        name: "Done",
        cards: [
          {
            id: "card-9",
            position: 0,
            title: "Design system setup",
            description:
              "Created color palette, typography scale, component library",
            card_labels: [{ label: { id: "lbl-10" } }],
          },
          {
            id: "card-10",
            position: 1,
            title: "Project scaffolding",
            description:
              "Next.js app initialized, ESLint & Prettier configured",
            card_labels: [{ label: { id: "lbl-11" } }],
          },
        ],
      },
    ],
  },
];
