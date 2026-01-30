import * as DM from '@alicloud/dm20151123';

export default {
  async fetch(request, env, ctx) {
    try {
      // Get the Client class (note: .default.default due to CommonJS exports)
      const Client = DM.default.default;

      // Create client instance
      const client = new Client({
        accessKeyId: env.ALICLOUD_ACCESS_KEY_ID,
        accessKeySecret: env.ALICLOUD_ACCESS_KEY_SECRET,
        endpoint: 'dm.ap-southeast-1.aliyuncs.com', // Singapore endpoint
        regionId: 'ap-southeast-1'
      });

      // Parse request
      const url = new URL(request.url);
      const action = url.searchParams.get('action') || 'info';

      // Handle different actions
      switch (action) {
        case 'info':
          return await handleAccountInfo(client);

        case 'send':
          return await handleSendEmail(client, url);

        default:
          return new Response(JSON.stringify({
            error: 'Unknown action',
            availableActions: ['info', 'send']
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack,
        name: error.name
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleAccountInfo(client) {
  const DescAccountSummaryRequest = DM.default.DescAccountSummaryRequest;
  const result = await client.descAccountSummary(
    new DescAccountSummaryRequest({})
  );

  return new Response(JSON.stringify({
    success: true,
    data: result
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleSendEmail(client, url) {
  const to = url.searchParams.get('to');
  const subject = url.searchParams.get('subject') || 'Test Email';
  const body = url.searchParams.get('body') || 'Hello from Cloudflare Workers!';
  const from = url.searchParams.get('from');

  if (!to || !from) {
    return new Response(JSON.stringify({
      error: 'Missing required parameters: to, from'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const SingleSendMailRequest = DM.default.SingleSendMailRequest;
  const result = await client.singleSendMail(
    new SingleSendMailRequest({
      accountName: from,
      addressType: 1,
      replyToAddress: true,
      toAddress: to,
      subject: subject,
      htmlBody: `<html><body><p>${body}</p></body></html>`
    })
  );

  return new Response(JSON.stringify({
    success: true,
    data: result
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
