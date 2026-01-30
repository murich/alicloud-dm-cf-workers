# Quick Installation Guide

## For Existing Projects

### Step 1: Install Dependencies

```bash
npm install @alicloud/dm20151123 patch-package --save-dev
```

### Step 2: Download and Copy Patch

```bash
# Create patches directory
mkdir -p patches

# Download patch
curl -o patches/@darabonba+typescript+1.0.3.patch \
  https://raw.githubusercontent.com/murich/alicloud-dm-cf-workers/main/patches/@darabonba+typescript+1.0.3.patch
```

### Step 3: Add Postinstall Script

Add to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### Step 4: Apply Patch

```bash
npm install
```

You should see:
```
patch-package 8.0.1
Applying patches...
@darabonba/typescript@1.0.3 ✔
```

### Step 5: Configure Wrangler

Update `wrangler.toml`:

```toml
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]
```

## For New Projects

Clone the example:

```bash
git clone https://github.com/murich/alicloud-dm-cf-workers.git
cd alicloud-dm-cf-workers/example
npm install
```

Set credentials:

```bash
wrangler secret put ALICLOUD_ACCESS_KEY_ID
wrangler secret put ALICLOUD_ACCESS_KEY_SECRET
```

Run:

```bash
npm run dev
```

## Verification

Test that the patch is working:

```javascript
import * as DM from '@alicloud/dm20151123';

export default {
  async fetch(request, env) {
    const Client = DM.default.default;
    const client = new Client({
      accessKeyId: env.ALICLOUD_ACCESS_KEY_ID,
      accessKeySecret: env.ALICLOUD_ACCESS_KEY_SECRET,
      endpoint: 'dm.ap-southeast-1.aliyuncs.com',
      regionId: 'ap-southeast-1'
    });

    // This should work without errors
    const result = await client.descAccountSummary({});

    return new Response('Patch working!');
  }
};
```

## Troubleshooting

### Patch Not Applied

Check if patch file exists:
```bash
ls -la patches/
```

Run install manually:
```bash
npx patch-package
```

### Import Errors

Use correct import:
```javascript
import * as DM from '@alicloud/dm20151123';
const Client = DM.default.default;  // Note: double .default
```

### Authentication Errors

1. Check credentials are set
2. Verify sender email in Alicloud console
3. Use correct regional endpoint

## Need Help?

- [GitHub Issues](https://github.com/murich/alicloud-dm-cf-workers/issues)
- [Example Worker](./example/)
- [Full README](./README.md)
