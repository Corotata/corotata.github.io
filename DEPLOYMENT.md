# Deployment Guide & Data Strategy

## 1. Automatic Deployment (GitHub Actions)

We have configured a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will automatically build and deploy your website to GitHub Pages whenever you push changes to the `main` branch.

### Setup Steps

1.  **Push Code**: Ensure your code is pushed to your GitHub repository.
2.  **Enable GitHub Pages**:
    *   Go to your repository on GitHub.
    *   Click **Settings** > **Pages**.
    *   Under **Build and deployment**, select **Source** as **GitHub Actions**.
    *   (The workflow will automatically run on your next push).
3.  **Verify**:
    *   Go to the **Actions** tab in your repository to see the build progress.
    *   Once green, your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Important Note on Repository Structure
The current configuration assumes your `package.json` is in the root of the repository (or that you pushed the `Web` folder content as the root).
*   If your repo has a folder structure like `MyRepo/Web/...`, you may need to move `.github` to `MyRepo/.github` and update the paths in `deploy.yml`.

---

## 2. Data Fetching Strategy: API vs. JSON

You asked: *"Is it better to fetch App Store data in real-time (API) or download it as JSON and bundle it?"*

Here is the comparison:

### Option A: Real-time API (Current Approach)
*   **How it works**: When a user opens your site, their browser asks the iTunes API for the latest data.
*   **Pros**:
    *   **Always Fresh**: Users see the exact star count and reviews as of *right now*.
    *   **Zero Maintenance**: You don't need to do anything when you get a new review.
*   **Cons**:
    *   **Slower**: The user has to wait for the API to respond (usually 0.5s - 1s).
    *   **Unreliable**: If the iTunes API is down or slow, your data might not show.
    *   **Rate Limits**: If 10,000 people visit your site at once, Apple might block the requests.

### Option B: Bundled JSON (Pre-fetching)
*   **How it works**: You run a script (e.g., `npm run update-data`) on your computer. It downloads the data and saves it to `src/data/apps.json`. Then you build and deploy the site.
*   **Pros**:
    *   **Extremely Fast**: The data is already there. Zero waiting time for the user.
    *   **Reliable**: Never fails because it doesn't depend on Apple's server at runtime.
    *   **Offline Friendly**: Works even if the user has a flaky internet connection.
*   **Cons**:
    *   **Not Real-time**: If you get a new review today, it won't show up until you run the script and re-deploy the site.

### Recommendation
For a **Portfolio**, **Option B (Bundled JSON)** is usually better because:
1.  **Speed is King**: You want your portfolio to load instantly to impress visitors.
2.  **Stability**: You don't want your showcase to look broken just because Apple's API is acting up.
3.  **Updates**: You probably don't need *minute-by-minute* updates on reviews. Updating once a week or month is usually enough.

**If you want to switch to Option B, I can write a script for you to "download and save" the data.**
