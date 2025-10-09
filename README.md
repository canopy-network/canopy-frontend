# Canopy Superapp Frontend 

A comprehensive blockchain superapp platform for launching, managing, and trading chains with integrated DeFi features.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Key Dependencies

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library built on Radix UI primitives
- **Lucide React** - Icon library
- **Recharts** - Charting library for data visualization
- **React Hook Form** - Form state management
- **Zustand** - State management
- **next-themes** - Theme management (dark/light mode)

## Project Structure

```
canopy-superapp-design-exploration/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Global layout with navigation
│   ├── page.tsx           # Home/Dashboard page
│   ├── amm/               # AMM feature pages
│   ├── explorer/          # Chain explorer pages
│   ├── graduation/        # Chain graduation pages
│   ├── orderbook/         # Orderbook trading pages
│   └── wallet/            # Wallet pages
│
├── components/            # React components organized by feature
│   ├── layout/           # Layout components (sidebar, etc.)
│   ├── navigation/       # Navigation components
│   ├── launchpad/        # Launchpad feature components
│   ├── amm/              # AMM feature components
│   ├── explorer/         # Explorer feature components
│   ├── graduation/       # Graduation feature components
│   ├── orderbook/        # Orderbook feature components
│   ├── wallet/           # Wallet feature components
│   └── ui/               # shadcn/ui base components
│
├── types/                # TypeScript type definitions
│   ├── index.ts          # General types
│   └── launchpad.ts      # Launchpad specific types
│
├── lib/                  # Utility functions
└── public/              # Static assets
```

### Media Handling

Media assets are stored in AWS S3, with URLs saved to the database for later retrival. The S3 bucket contains three folders: `branding`, `media`, and `papers`.

**File Naming Convention:**
- All files are identified using the chain's ticker name in uppercase (e.g., `ATOM`, `OSMO`)

**Folder Specifications:**

**Papers:**
- Format: PDF only
- Contains whitepapers and technical documentation
- Maximum file size: 3MB

**Branding:**
- Formats: SVG, PNG, WebP, JPEG, GIF
- Maximum resolution: 1200×1200 pixels
- Maximum file size: 3MB

**Media:**
- Formats: SVG, PNG, WebP, JPEG, GIF
- Maximum file size: 3MB
- Supports multiple images per chain, numbered sequentially (e.g., `ATOM_1.png`, `ATOM_2.png`)


### Architecture TL;DR

- **Feature-based organization**: Each feature (Launchpad, AMM, Explorer, etc.) has its own components folder
- **Global layout**: Navigation and layout components are defined in the global `app/layout.tsx`
- **Type safety**: All type annotations and interfaces are centralized in the `types/` folder
- **Component library**: UI components from shadcn/ui provide a consistent design system