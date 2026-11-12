# PayPal Sandbox Checkout

A Next.js App Router application that demonstrates a PayPal Sandbox checkout for a Developer Hoodie. It creates and captures PayPal orders on the server, provides global navigation, and sends customers to explicit success or failure pages after payment.

## Features

- PayPal Sandbox checkout using `@paypal/react-paypal-js`.
- Server-side order creation and capture using `@paypal/paypal-server-sdk`.
- PayPal approval handling with `/success` and `/failed` result pages.
- Navigation for Home, Shop, Checkout, and Orders.
- Tailwind CSS v4 styling with a PayPal-themed navigation bar.
- Sandbox-ready configuration that keeps the PayPal secret server-side.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Developer Hoodie product page and checkout entry point |
| `/shop` | Shop landing page |
| `/checkout` | PayPal checkout page |
| `/orders` | Orders placeholder page |
| `/success` | Completed payment result |
| `/failed` | Failed or unsuccessful payment result |

## Project structure

The Next.js application is in [`paypal-nextjs/`](paypal-nextjs/).

- `app/actions.ts` - Server Actions for creating and capturing orders.
- `lib/paypal/client.ts` - PayPal SDK client configuration.
- `lib/paypal/orders.ts` - PayPal Orders v2 integration.
- `components/PayPalCheckout.tsx` - PayPal checkout button and result routing.
- `components/Navbar.tsx` - Global client-side navigation.
- `app/globals.css` - Global and navigation styles.

## Prerequisites

- Node.js 20 or newer.
- A PayPal Developer account.
- A PayPal Sandbox business account and Sandbox app credentials.
- A PayPal Sandbox personal buyer account for PayPal approval testing.

Create or select a Sandbox app in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox) and copy its Client ID and Secret.

## Configure the application

From the repository root:

```bash
cd paypal-nextjs
copy .env.example .env.local
```

If `.env.example` does not exist in your checkout, create `paypal-nextjs/.env.local` with:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox
```

Never commit `.env.local` or expose `PAYPAL_CLIENT_SECRET` in client-side code.

## Run locally

```bash
cd paypal-nextjs
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available checks:

```bash
npm run lint
npm run build
```

## Payment flow

1. The checkout component calls the `createOrder` Server Action.
2. The server creates a USD 9.99 PayPal order with intent `CAPTURE`.
3. The buyer approves the order in the PayPal Sandbox or with a supported test card.
4. The `onApprove` callback calls the `captureOrder` Server Action.
5. A `COMPLETED` capture redirects to `/success`; other results and exceptions redirect to `/failed`.
6. The capture can be verified in the Sandbox business account transaction history.

These are Next.js Server Actions, not public `/api/*` endpoints. The PayPal Client Secret remains on the server.

## Testing

See [Sandbox purchase testing](#sandbox-purchase-testing) for the PayPal buyer and card scenarios.

## Security notes

- Use Sandbox credentials only while `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox`.
- Keep `PAYPAL_CLIENT_SECRET` private and server-side.
- Do not use real card numbers or real PayPal accounts in Sandbox tests.
- Before production, configure production credentials separately and review PayPal’s production checklist.

## Resources

- [PayPal Sandbox](https://www.sandbox.paypal.com)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox card testing](https://developer.paypal.com/api/rest/sandbox/card-testing/)
- [Next.js documentation](https://nextjs.org/docs)

## Sandbox purchase testing

The project cannot complete a real Sandbox purchase without your credentials and a buyer or card test instrument. Run the app locally, then perform these checks from `/checkout`.

### 1. PayPal buyer approval

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/checkout`.
3. Click the PayPal button.
4. Sign in with a **Personal** Sandbox buyer account at `www.sandbox.paypal.com`.
5. Approve the USD 9.99 payment.
6. Confirm that the browser reaches `/success`.
7. Sign in to the Sandbox **Business** account and verify the captured transaction.

Expected result: the browser reaches `/success`, and the Business account shows a completed capture for USD 9.99.

### 2. Credit or debit card checkout

1. Open `/checkout` with the Sandbox environment enabled.
2. Select the card or guest-checkout option presented by the PayPal checkout UI.
3. Use a PayPal Sandbox test card from the [Sandbox card testing documentation](https://developer.paypal.com/api/rest/sandbox/card-testing/).
4. Use a future expiration date and a valid test CVV for the card brand.
5. Submit the payment without using a real card number.
6. Confirm that the browser reaches `/success` and verify the capture in the Business Sandbox account.

PayPal may hide guest card checkout based on account, region, browser, or merchant settings. If the card option is not displayed, enable the relevant card funding features in the Sandbox app or use the PayPal Sandbox buyer flow instead; do not substitute a real card.

### 3. Failure-path test

Use a documented Sandbox decline test card or a Sandbox mock response to exercise the failure path. The current UI routes any capture exception or non-`COMPLETED` status to `/failed`.

For direct Orders API testing, first obtain a Sandbox access token:

```bash
$env:PAYPAL_ACCESS_TOKEN = (Invoke-RestMethod `
  -Method Post `
  -Uri "https://api-m.sandbox.paypal.com/v1/oauth2/token" `
  -Authentication Basic `
  -Credential (Get-Credential) `
  -Body @{ grant_type = "client_credentials" }).access_token
```

Then capture an approved order with a forced decline response:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER_ID/capture" `
  -Headers @{ `
    Authorization = "Bearer $env:PAYPAL_ACCESS_TOKEN"; `
    "PayPal-Mock-Response" = '{"mock_application_codes":"INSTRUMENT_DECLINED"}' `
  } `
  -ContentType "application/json"
```

A declined capture should not be treated as successful. Verify that the application displays or redirects to `/failed`, and never place production credentials or real payment details in this test.

### Automated local checks

Run these checks before manual Sandbox purchases:

```bash
cd paypal-nextjs
npm ci
npm run lint
npm run build
```

The repository currently has no automated browser-test framework, so the PayPal approval and card purchase steps above remain manual end-to-end checks.
