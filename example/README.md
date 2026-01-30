# Alicloud Direct Mail Example Worker

This is a complete example showing how to use the Alicloud DM SDK in Cloudflare Workers.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Copy Patch

Copy the patch file from the parent directory:

```bash
cp ../patches/@darabonba+typescript+1.0.3.patch patches/
```

Or download from the repository:

```bash
mkdir -p patches
curl -o patches/@darabonba+typescript+1.0.3.patch https://raw.githubusercontent.com/murich/alicloud-dm-cf-workers/main/patches/@darabonba+typescript+1.0.3.patch
```

### 3. Reinstall to Apply Patch

```bash
npm install
```

### 4. Configure Credentials

Set your Alicloud credentials as secrets:

```bash
wrangler secret put ALICLOUD_ACCESS_KEY_ID
wrangler secret put ALICLOUD_ACCESS_KEY_SECRET
```

## Development

Start local development server:

```bash
npm run dev
```

## Usage

### Get Account Info

```bash
curl http://localhost:8787?action=info
```

### Send Email

```bash
curl "http://localhost:8787?action=send&from=noreply@yourdomain.com&to=recipient@example.com&subject=Hello&body=Test%20message"
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## API Endpoints

- `/?action=info` - Get account summary
- `/?action=send&from=...&to=...&subject=...&body=...` - Send email

## Notes

- Make sure your sender email is verified in Alicloud console
- Use the correct regional endpoint in `wrangler.toml`
- Singapore endpoint: `dm.ap-southeast-1.aliyuncs.com`
