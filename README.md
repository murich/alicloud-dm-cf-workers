# Alicloud Direct Mail SDK for Cloudflare Workers

A patch that makes `@alicloud/dm20151123` (Aliyun Direct Mail SDK) work in Cloudflare Workers by replacing Node.js `httpx` with the native `fetch()` API.

## Why This Patch?

The official `@alicloud/dm20151123` SDK uses Node.js-specific HTTP modules (`httpx` → `https.request()`) which don't work in Cloudflare Workers, even with `nodejs_compat` flag. This patch replaces the HTTP layer with Cloudflare's native `fetch()` API.

## ✅ What Works

- ✅ Full Alicloud Direct Mail API support
- ✅ Native Cloudflare Workers `fetch()` API
- ✅ Request timeouts with AbortController
- ✅ Proper response handling and error parsing
- ✅ All SDK methods (send email, batch send, etc.)

## Installation

### 1. Install Dependencies

```bash
npm install @alicloud/dm20151123 patch-package
```

### 2. Copy Patch File

Copy the `patches/@darabonba+typescript+1.0.3.patch` file from this repository to your project's `patches/` directory.

Or clone this repo and copy:

```bash
git clone https://github.com/murich/alicloud-dm-cf-workers.git
cp alicloud-dm-cf-workers/patches/* your-project/patches/
```

### 3. Add Postinstall Script

In your `package.json`:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### 4. Run Install

```bash
npm install
```

The patch will be automatically applied!

## Usage

### Basic Example

```javascript
import * as DM from '@alicloud/dm20151123';

export default {
  async fetch(request, env, ctx) {
    // Get the Client class
    const Client = DM.default.default;

    // Create client instance
    const client = new Client({
      accessKeyId: env.ALICLOUD_ACCESS_KEY_ID,
      accessKeySecret: env.ALICLOUD_ACCESS_KEY_SECRET,
      endpoint: 'dm.ap-southeast-1.aliyuncs.com',
      regionId: 'ap-southeast-1'
    });

    // Send email
    const SingleSendMailRequest = DM.default.SingleSendMailRequest;
    const result = await client.singleSendMail(
      new SingleSendMailRequest({
        accountName: 'noreply@yourdomain.com',
        addressType: 1,
        replyToAddress: true,
        toAddress: 'recipient@example.com',
        subject: 'Hello from Cloudflare Workers',
        htmlBody: '<h1>Hello World!</h1>'
      })
    );

    return new Response(JSON.stringify(result));
  }
};
```

## Wrangler Configuration

Add to your `wrangler.toml`:

```toml
name = "your-worker"
main = "src/index.js"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[vars]
# Add your credentials as environment variables
```

**Note**: `nodejs_compat` is required for Buffer support.

## Available Endpoints

Alicloud Direct Mail has regional endpoints. Use the one closest to your users:

- **Singapore**: `dm.ap-southeast-1.aliyuncs.com`
- **Sydney**: `dm.ap-southeast-2.aliyuncs.com`
- **Hong Kong**: `dm.ap-east-1.aliyuncs.com`
- **Hangzhou**: `dm.cn-hangzhou.aliyuncs.com`
- **Others**: See [Alicloud DM Endpoints](https://www.alibabacloud.com/help/en/directmail/latest/endpoints)

## API Methods

All standard Alicloud Direct Mail methods are supported:

- `singleSendMail()` - Send single email
- `batchSendMail()` - Send batch emails
- `createMailAddress()` - Create sender address
- `descAccountSummary()` - Get account info
- And many more...

See [Alicloud Direct Mail API Reference](https://www.alibabacloud.com/help/en/directmail/latest/api-dm-2015-11-23-singlesendmail)

## What Changed?

The patch modifies `@darabonba/typescript` package:

1. **Added `FetchResponse` class**: Adapts `fetch()` Response to SDK expectations
2. **Replaced `doAction()` function**: Uses `fetch()` instead of `httpx.request()`
3. **Mock Readable Stream**: Implements Node.js EventEmitter pattern for response body
4. **Timeout Handling**: Uses AbortController for request timeouts

## Technical Details

### Why Not Use nodejs_compat Alone?

Cloudflare Workers *do* support `https.request()` at runtime (with `nodejs_compat` + `compatibility_date >= 2024-09-23`), but Wrangler's bundler uses `unenv` polyfills during build time, which don't implement `https.request()`. The bundled code never reaches the native runtime implementation.

**This patch solves the issue** by replacing the HTTP layer with `fetch()` before bundling.

### Patch Contents

The patch replaces:
- ❌ `httpx.request(url, options)`
- ✅ `fetch(url, fetchOptions)`

And adds:
- `FetchResponse` class with mock readable stream
- Event emitter implementation (`on`, `once`, `removeListener`)
- Timeout handling with AbortController

### Limitations

- **SSL/TLS options ignored**: `fetch()` doesn't support custom certificates
- **HTTP Agent ignored**: `fetch()` handles connections internally
- **Proxy settings ignored**: Not applicable in Workers environment

These limitations don't affect normal API usage.

## Testing

The patch was tested with:
- ✅ Successful HTTP requests to Alicloud API
- ✅ Proper response parsing
- ✅ Error handling (authentication, validation, etc.)
- ✅ Timeout handling
- ✅ All SDK initialization flows

## Troubleshooting

### Import Issues

The SDK uses CommonJS exports. Import like this:

```javascript
import * as DM from '@alicloud/dm20151123';
const Client = DM.default.default;  // Note: .default.default
const SingleSendMailRequest = DM.default.SingleSendMailRequest;
```

### Authentication Errors

Make sure:
1. Credentials are correct
2. Using the right regional endpoint
3. Sender email is verified in Alicloud console

### Request Timeout

Default timeout is 30 seconds. Customize with runtime options:

```javascript
const runtime = new DM.default.RuntimeOptions({
  timeout: 60000  // 60 seconds
});

await client.singleSendMailWithOptions(request, runtime);
```

## Development

To modify or regenerate the patch:

```bash
# 1. Install dependencies
npm install @alicloud/dm20151123

# 2. Make changes to node_modules/@darabonba/typescript/dist/core.js

# 3. Generate patch
npx patch-package @darabonba/typescript

# 4. Patch file created at patches/@darabonba+typescript+1.0.3.patch
```

## Contributing

Contributions welcome! Please:
1. Test your changes in a real Cloudflare Worker
2. Update documentation if adding features
3. Submit a PR with description of changes

## License

MIT License - See LICENSE file

## Credits

- Original SDK: [@alicloud/dm20151123](https://www.npmjs.com/package/@alicloud/dm20151123)
- Patch approach: [patch-package](https://github.com/ds300/patch-package)

## Support

For issues:
- SDK bugs: [Alicloud Support](https://www.alibabacloud.com/help/en/directmail)
- Patch issues: [GitHub Issues](https://github.com/murich/alicloud-dm-cf-workers/issues)

---

**Made with ❤️ for Cloudflare Workers developers using Alicloud Direct Mail**
