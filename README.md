# PromptCraft AI
An intelligent, full-stack web application designed for modern AI-powered workflows, providing a centralized platform for generating, managing, and storing AI prompts and their multimedia outputs.

Live Demo: https://promptcraft-fusion.netlify.app/

## Overview
PromptCraft AI is a sophisticated tool built to solve a critical challenge in the age of generative AI: the management of the creative process. As AI models become more powerful, the art of crafting the perfect prompt—and tracking its results—becomes paramount. This application provides a seamless, secure, and user-centric environment for prompt engineering, moving beyond simple text notes to a rich, interactive vault.

The platform features a real-time prompt optimization engine powered by the Google Gemini API, secure user authentication via Supabase, and a personal "Vault" where users can save prompts and link them directly to their multimedia outputs, such as images, videos, or documents.

## Key Features
- **AI-Powered Prompt Generation:** Leverages the Google Gemini API to intelligently refine and expand user ideas into powerful, model-specific prompts.
- **Secure User Authentication:** Full authentication system built with Supabase, including email/password sign-up and secure session management.
- **Personal Prompt Vault:** A private, user-specific database to save, search, and categorize every generated prompt.
- **Multimedia Output Storage:** Users can upload and link a prompt's result (images, videos, etc.) directly to the prompt that created it, creating a complete record of their creative workflow.
- **Modern, Responsive UI:** A sleek, professional user interface built with React, TypeScript, and Tailwind CSS, featuring a collapsible sidebar and a "glassmorphism" design aesthetic.
- **Serverless Backend:** The entire backend is powered by secure, scalable Supabase Edge Functions, ensuring a robust and modern architecture.

## Technology Stack
This project is built with a modern, full-stack, serverless architecture:

### Frontend:
- **Vite:** High-performance tooling for modern web development.
- **React:** A declarative library for building user interfaces.
- **TypeScript:** Strongly typed programming language that builds on JavaScript.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **shadcn/ui:** Re-usable components built using Radix UI and Tailwind CSS.

### Backend & Infrastructure:
- **Supabase:** The open-source Firebase alternative.
- **Authentication:** Secure user management and row-level security.
- **Postgres Database:** For storing user data and prompts.
- **Storage:** For handling multimedia file uploads.
- **Edge Functions:** Deno-based serverless functions for secure backend logic.

### AI Integration:
- **Google Gemini API:** Powering the intelligent prompt generation engine.

## Local Development Setup
To run this project on your local machine, please follow these steps.

### Prerequisites:
- Node.js (v18 or higher)
- Supabase CLI

1. **Clone the Repository**
   ```
   git clone <YOUR_GIT_REPOSITORY_URL>
   cd promptcraft-fusion
   ```
2. **Install Dependencies**
   ```
   npm install
   ```
3. **Set Up Environment Variables**
   Create a new file named `.env.local` in the root of your project.
   
   You will need to get your project-specific keys from your Supabase Dashboard (Settings > API).
   
   Add the following variables to your `.env.local` file:
   ```
   VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
   ```
4. **Run the Development Server**
   ```
   npm run dev
   ```