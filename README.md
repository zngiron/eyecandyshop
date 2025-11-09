# Front-End Development

A modern Next.js 16 application built with React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) – JavaScript runtime and package manager

### Installation

```bash
bun install
```

### Running the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
bun run build
bun start
```

## Project Dependencies & Documentation

This project leverages a modern, typed React stack, with high-quality styling, UI, and tooling. Below is a list of key dependencies and links to their documentation:

### Core Framework

- **[Next.js](https://nextjs.org/)** - Production-grade React framework
- **[React](https://react.dev/)** - Component-based UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript for reliability and tooling
- **[Bun](https://bun.sh/)** - Ultra-fast JavaScript runtime and package manager

### Styling

- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** – Reusable UI components built with accessibility and customization in mind
- **[Lucide React](https://lucide.dev/)** – Consistent, SVG icon toolkit

### State Management & Data Fetching

- **[TanStack Query](https://tanstack.com/query/latest/)** – Powerful server-state/data-fetching tools
- **[Zustand](https://zustand-demo.pmnd.rs/)** – Lightweight, minimal state management  

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** – Performant, flexible, and extensible form library for React
- **[Zod](https://zod.dev/)** – TypeScript-first schema validation with static type inference

### Development Tools

- **[Biome](https://biomejs.dev/)** – Fast formatter and linter for TypeScript and JavaScript
- **[Lefthook](https://github.com/evilmartians/lefthook)** – Fast and powerful Git hooks manager (lint/format on commit)
- **[Commitlint](https://commitlint.js.org/)** – Lint commit messages for Conventional Commits
- **[React Compiler](https://react.dev/learn/react-compiler)** – Next-generation React automatic optimization

## Project Structure

```
frontend.dev/
├── public/                                   # Static assets publicly served
│   ├── robots.txt                            # Robots exclusion protocol
│   └── static/                               # Images and icons
│       ├── frontend-dev-icon.png
│       ├── frontend-dev-icon.svg
│       └── frontend-dev-thumbnail.png
├── src/                                      # Source code
│   ├── app/                                  # Next.js app directory (routing, globals, root layout)
│   │   ├── favicon.ico                       # Site favicon
│   │   ├── globals.css                       # Global styles
│   │   ├── layout.tsx                        # Root layout component
│   │   └── page.tsx                          # Main app page
│   ├── components/                           # Reusable components
│   │   ├── layout/                           # Application layout components
│   │   │   ├── footer.tsx                    # Footer component
│   │   │   ├── header.tsx                    # Header component
│   │   │   ├── providers.tsx                 # Context providers
│   │   │   └── scripts.tsx                   # Script loaders/injections
│   │   └── ui/                               # UI widgets and elements
│   │       ├── button.stories.tsx            # Storybook stories for Button
│   │       ├── button.tsx                    # Button component
│   │       └── card.tsx                      # Card component
│   ├── hooks/                                # Custom React hooks
│   └── lib/                                  # Utility libraries
│       ├── env.ts                            # Environment variables
│       └── utils.ts                          # Utility functions
├── biome.json                               # Biome formatter/linter config
├── bun.lock                                 # Bun package lockfile
├── commitlint.config.mjs                    # Commitlint configuration
├── components.json                          # List of shadcn/ui components in project
├── lefthook.yml                             # Lefthook git hooks config
├── next-env.d.ts                            # Next.js type definitions
├── next.config.ts                           # Next.js configuration
├── package.json                             # Project manifest
├── postcss.config.mjs                       # PostCSS configuration
├── tsconfig.json                            # TypeScript configuration
└── README.md                                # This file