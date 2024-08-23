// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use("/myApp/*", authentication);

async function authentication(req, res, next) {
  let shop = req.query.shop;
  if (!shop) {
    return res.status(400).json({ message: "Shop parameter is required" });
  }
  let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
  const stg = await shopify.api.session.customAppSession(shop);
  console.log("abc->>>>>>", shop, stg.shop);
  if (shop === stg.shop) {
    next();
  } else {
    res.send("send not authorized");
  }
}

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );
// app.use(
//   cors({
//     origin: ["https://store-for-customer-account-test.myshopify.com"],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Custom-Header"],
//   })
// );
// app.options("*", cors()); // Enable preflight for all routes

// app.use((req, res, next) => {
//   res.set({
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "*",
//     "Access-Control-Allow-Headers":
//       "'Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token'",
//   });

//   next();
// });
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/myApp/get-discounts", async (req, res) => {
  try {
    let discountValues = req.body;
    console.log("data recieved from client side", discountValues);

    res.status(200).json(discountValues);

    return;

    const apiUrl =
      "https://store-for-customer-account-test.myshopify.com/admin/api/2024-07/price_rules/1202709266572/discount_codes.json";

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${apiPassword}:${apiKey}`)}`, // Base64 encode the credentials
      },
    });

    const data = await response.json();
    console.log("data recieved from api discounts at backend", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Failed to fetch discounts data" });
  }
});
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
