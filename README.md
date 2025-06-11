# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5213ea60-14d7-49f4-96fb-f75d61394ded

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5213ea60-14d7-49f4-96fb-f75d61394ded) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Mobile App Development

This project supports iOS and Android mobile app development using Capacitor. Platform directories are auto-generated when needed.

### Initial Setup (after cloning)

```sh
# Install dependencies
npm install

# For iOS development (macOS only)
npm run ios

# For Android development  
npm run android:check  # Check environment first
npm run android        # Build and run
```

### Development Workflow

**iOS:**
```sh
npm run ios           # Initial build + simulator, short time after simulator started
```

**Android:**
```sh
# Recommended: Start emulator manually first
emulator -avd Pixel_7 &

npm run android           # Full build + install, short time after emulator started
```

### Platform Auto-Generation

- Platform directories (`ios/`, `android/`) are not committed to git
- Scripts automatically run `npx cap add ios/android` when needed
- Clean, conflict-free development experience

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript  
- React
- shadcn/ui components
- Tailwind CSS
- Capacitor (mobile apps)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5213ea60-14d7-49f4-96fb-f75d61394ded) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
