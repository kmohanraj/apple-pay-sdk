### Apple Pay SDK

#### To Run HTTPS Server for local

```
HTTPS=true npm start
```

#### Backend API Env

```
APPLE_PAY_MERCHANT_IDENTIFIER
APPLE_PAY_DISPLAY_NAME
APPLE_PAY_ENV
APPLE_PAY_CERTIFICATE

```

#### Certificate to String convert

```javascript
const certificatePath = path.resolve(
  "./certificates/Moes-MerchantID-Certificates.pem"
);
console.log("-----certificatePath---local-file", certificatePath);
const certificate = fs.readFileSync(certificatePath, "utf8");
const buff = Buffer.from(certificate).toString("base64");
console.log(buff); // Then copy the string and paste it in your environment variable
```

#### Backend Endpoint for session creation

```typescript
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

export async function POST(request: NextRequest) {
  try {
    const bodyParams = await request.json();
    const bodyData = {
      merchantIdentifier: process.env.APPLE_PAY_MERCHANT_IDENTIFIER,
      displayName: process.env.APPLE_PAY_DISPLAY_NAME,
      initiative: "web",
      initiativeContext: process.env.APPLE_PAY_ENV,
    };
    const certificate = Buffer.from(
      String(process.env.APPLE_PAY_CERTIFICATE),
      "base64"
    ).toString("ascii");
    const agentOptions = new https.Agent({
      cert: certificate,
      key: certificate,
    });
    const appleResponse = await axios(bodyParams.validationURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(bodyData),
      httpsAgent: agentOptions,
    }).catch((err) => err);
    if (appleResponse.status === 200) {
      return NextResponse.json({ data: appleResponse.data });
    } else {
      return NextResponse.json({
        status: appleResponse.status || 400,
        data: appleResponse,
      });
    }
  } catch (err) {
    return NextResponse.json({ status: 500, data: err });
  }
}
```
