# Placement Willingness Tracker

A React application to track student willingness for placement.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment Options

### Option 1: Netlify (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy with one command:
   ```bash
   npm run deploy:netlify
   ```

### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy with one command:
   ```bash
   npm run deploy:vercel
   ```

### Option 3: GitHub Pages

1. Create a GitHub repository for your project.

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/repository-name",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Build for Production

To build the application for production:

```bash
npm run build
```

The build files will be in the `dist` directory, which can be deployed to any static hosting service.
