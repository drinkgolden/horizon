# Pushing Horizon changes to your Shopify store

Follow these steps to push the current `work` branch to a `dev` branch on your Shopify theme repository and obtain a preview link with the Shopify CLI. Replace placeholders with your values where noted.

## 1. Configure the Git remote

If the `origin` remote has not been configured in this environment yet, add it with your repository URL:

```bash
git remote add origin git@github.com:<org>/<repo>.git
# or
# git remote add origin https://github.com/<org>/<repo>.git
```

You can verify the remote configuration at any time with `git remote -v`.

## 2. Push the local branch to `origin/dev`

From the repository root (`/workspace/horizon`), push your current branch to the remote `dev` branch:

```bash
git push origin work:dev
```

If you plan to continue working on the branch locally, set the upstream for convenience:

```bash
git push --set-upstream origin work
```

## 3. Authenticate the Shopify CLI

With current Shopify CLI v3 releases, authentication happens when you run a store command in an interactive terminal. If you are using Node v25+, set a local storage file first:

```bash
export NODE_OPTIONS='--localstorage-file=$HOME/.shopify-localstorage'
shopify theme info --store morg-224.myshopify.com --theme 123456789
```

If you are not authenticated yet, the command opens a browser login flow and stores credentials for later commands.

## 4. Generate a preview link

From the theme directory, run the theme development server:

```bash
shopify theme serve --store morg-224.myshopify.com --theme 123456789
```

The CLI outputs a public preview URL (and a local tunnel URL). Share this link with collaborators to review the latest changes.

### Troubleshooting tips

- If the CLI reports that your account lacks permissions, confirm that the store owner granted you access to the theme.
- If you see `Command login not found`, use a theme command (`theme info`, `theme serve`, etc.) to trigger authentication.
- If you see `Cannot initialize local storage`, export `NODE_OPTIONS='--localstorage-file=$HOME/.shopify-localstorage'` before running Shopify commands.
- When `shopify theme serve` runs, leave the process active; closing it revokes the preview link.
- Use `shopify theme pull` or `shopify theme push` if you need to sync theme files directly with the store instead of relying on Git.
