# Swolemates

## Deployment

Deployed on Vercel, connected to the GitHub repo, auto-deploys on every push to
`main`. Env var `ANTHROPIC_API_KEY` is configured in Vercel.

**Commit and push = ship to production.** The app is installed on Naif's iPhone
from the Vercel URL, so a push changes what's on his phone. Treat pushing to
`main` as a release, not a save point: get confirmation before pushing anything
not explicitly asked for, and prefer committing locally over pushing when work is
unfinished.

Nothing about this setup is visible from the working copy — there's no `.vercel`
directory (the project was linked through the Vercel dashboard, not the CLI) and
the GitHub deployments API returns nothing. Don't infer from that that the app
isn't deployed.
