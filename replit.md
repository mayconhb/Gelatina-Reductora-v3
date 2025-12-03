# Gelatina Reductora - React PWA

## Overview
Gelatina Reductora is a mobile-first Progressive Web App (PWA) built with React, TypeScript, and Vite. It serves as a health and wellness product showcase with a Spanish interface, offering product catalogs, bonuses, and exclusive locked content. The application integrates with Hotmart for user purchase verification to unlock premium content.

## User Preferences
Not specified.

## System Architecture
The application is structured as a React PWA with a separate Express.js backend.

**Frontend:**
-   **Framework**: React 19.2.0 with TypeScript, built using Vite 6.x.
-   **Styling**: Tailwind CSS v4, locally built with PostCSS.
-   **UI/UX**: Mobile-first responsive design featuring product carousels with drag-to-scroll, a circular profile avatar button in the top-right of the HomeView, and a "Volver" back button in the ProfileView.
-   **Key Features**:
    -   User login and profile management.
    -   Dynamic content access based on Hotmart purchases ("Mis Productos", "Contenidos Exclusivos", "Bonos").
    -   PWA capabilities including installation prompts, service worker for offline support, and local storage for preferences.
    -   Locked premium content with upgrade prompts that open a Hotmart checkout popup.
    -   Analytics Dashboard (admin-only) to track user engagement, product views, and feature usage.
    -   Daily motivational quotes.
    -   Cloud-based storage for user profiles, protocol progress, and weight tracking data using Supabase.
    -   Optimized image loading with `OptimizedImage` component featuring:
        -   In-memory image cache to prevent re-fetching
        -   Skeleton placeholder with gradient animation while loading
        -   Smooth fade-in transition when images are ready
        -   Priority loading for first visible items in carousels
        -   Preload of adjacent images for seamless carousel navigation

**Backend (Express.js):**
-   Handles API requests for user data, product information, and Hotmart webhook processing.
-   Provides endpoints for health checks, user product queries, Hotmart webhooks, and manual purchase additions.
-   Manages analytics data collection and serves dashboard information.

**Product Data:**
-   `api/lib/products.ts` is the single source of truth for all product data, including Hotmart product IDs and offer codes. When adding or modifying products, update only this file. Both the local server and Vercel serverless functions use this file.

**Deployment:**
-   Optimized for Vercel deployment using serverless functions for the API (`/api` folder structure).
-   Replit static site deployment is also supported.

**Security:**
-   Hotmart webhook authentication via `x-hotmart-hottok` header.
-   Analytics dashboard access restricted to a specific admin email.
-   API keys and sensitive information are stored as environment variables.
-   Client-side bundle is free from API key exposure.

## External Dependencies
-   **Hotmart**: For purchase verification, content unlocking, and checkout processing.
-   **Supabase**: PostgreSQL database for storing user data (purchases, profiles, protocol progress, weight entries) and analytics.
-   **Express.js**: Backend server framework.
-   **Vite**: Frontend build tool.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Lucide React**: Icon library.