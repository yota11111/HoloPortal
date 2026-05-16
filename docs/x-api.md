# X API setup

Holo Portal can post a daily digest to X with `npm run post:x`.

The script is safe by default. It prints the post body and exits until `X_POST_ENABLED=true` is set.

## X developer app

1. Create or open an app in the X Developer Portal.
2. Enable user authentication with Read and Write permissions.
3. Regenerate the access token after changing permissions.
4. Save these credentials:
   - API Key
   - API Key Secret
   - Access Token
   - Access Token Secret

## Local `.env`

```bash
SITE_URL=https://holo-portal.com
X_POST_ENABLED=false
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
```

Run a dry run:

```bash
npm run post:x
```

To post for real, set `X_POST_ENABLED=true` and fill all four credentials.

## GitHub Actions secrets

Add these repository secrets:

- `X_POST_ENABLED`: set to `true` only when posting should be live.
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

The scheduled workflow runs once a day. If `X_POST_ENABLED` is missing or not `true`, it only performs a dry run.

## Official references

- Create Post: https://docs.x.com/x-api/posts/create-post
- OAuth 1.0a overview: https://docs.x.com/fundamentals/authentication/oauth-1-0a/overview
