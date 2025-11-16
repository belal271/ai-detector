# Push to GitHub - Quick Guide

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `ai-detector` (or your choice)
3. Description: "AI Detector - Plagiarism and AI Content Detection"
4. Choose Public or Private
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

## Step 2: Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
cd "f:\upwork\ai detector"

# Add the remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-detector.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using SSH

If you have SSH keys set up:

```bash
git remote add origin git@github.com:YOUR_USERNAME/ai-detector.git
git branch -M main
git push -u origin main
```

## Verify

After pushing, refresh your GitHub repository page. You should see all your files!

## Future Updates

To push future changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

