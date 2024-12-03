// @ts-nocheck
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import DiscountSchema from "./mongoSchema.js";
// const morgan = require("morgan");
// const apicache = require("apicache");

dotenv.config();
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
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

app.get("/api/shop/data", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    // Fetch shop data
    const data = await client.query({
      data: {
        query: `
          query {
            shop {
              name
              email
              currencyCode
            }
          }
        `,
      },
    });

    res.status(200).send(data.body.data.shop);
  } catch (error) {
    console.error("Error getting shop data:", error);
    res.status(500).send({ message: "Failed to fetch shop data" });
  }
});

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});
//get all discounts
app.get("/api/priceRules/all", async (_req, res) => {
  const countData = await shopify.api.rest.PriceRule.all({
    session: res.locals.shopify.session,
  });
  // console.log("data.............", countData.data);

  const priceRuleIds = countData.data.reduce((acc, rule) => {
    if (rule.title.startsWith("CC_")) {
      acc.push(rule.id);
    }
    return acc;
  }, []);
  const allDiscountPromises = priceRuleIds.map(
    async (id) =>
      await shopify.api.rest.DiscountCode.all({
        session: res.locals.shopify.session,
        price_rule_id: id,
      })
  );
  console.log("rules....", allDiscountPromises);

  // Wait for all requests to finish
  const allDiscountResponses = await Promise.all(allDiscountPromises);
  res.status(200).send(countData);
});

app.get("/api/products/all", async (_req, res) => {
  const productsData = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(productsData);
});
app.get("/api/customers/all", async (_req, res) => {
  const customersData = await shopify.api.rest.Customer.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(customersData);
});
app.get("/api/countries", async (_req, res) => {
  const countriesData = await shopify.api.rest.Country.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countriesData);
});

// operation migration from middleware.

app.get("/api/get-collections", async (req, res) => {
  try {
    const { page, limit } = req.query;
    const session = res.locals.shopify.session;
    let allCollections = [];

    const smartCollectionData = await shopify.api.rest.SmartCollection.all({
      session: res.locals.shopify.session,
    });
    const customCollectionData = await shopify.api.rest.CustomCollection.all({
      session: res.locals.shopify.session,
    });

    allCollections = [
      ...customCollectionData.data,
      ...smartCollectionData.data,
    ];

    console.log("data recieved and sent to client", allCollections);
    // Response
    res.status(200).send({
      status: true,
      data: allCollections,
      message: `All Collections Retreived Successfully`,
    });
  } catch (error) {
    console.log("Error fetching collections:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch collections",
      error: error.message,
    });
  }
});

app.get("/api/get-discounts", async (req, res) => {
  try {
    const { page, limit } = req.query;
    let prevPage = null,
      forwardPage = null,
      pgInfo = null,
      link = null;
    if (!limit) limit = 50;
    let priceRules;
    if (page) {
      console.log("check page", page);

      priceRules = await shopify.api.rest.PriceRule.all({
        session: res.locals.shopify.session,
        limit,
        page_info: page, // Provide pageInfo for pagination
      });
      // priceRules.pageInfo=page;

      // pgInfo = priceRules.pageInfo;
    } else {
      // pgInfo = priceRules.pageInfo;
      priceRules = await shopify.api.rest.PriceRule.all({
        session: res.locals.shopify.session,
        limit,
      });
    }
    pgInfo = priceRules.pageInfo;

    // priceRules.pageInfo
    let filteredPriceRules = [];

    for (const rule of priceRules.data) {
      if (rule.title.startsWith("CC_")) {
        filteredPriceRules.push({
          code: rule.title,
          usage_count: rule.usage_count,
          priceRuleDetails: {
            id: rule.id,
            value_type: rule.value_type,
            value: rule.value,
            customer_selection: rule.customer_selection,
            target_type: rule.target_type,
            target_selection: rule.target_selection,
            allocation_method: rule.allocation_method,
            allocation_limit: rule.allocation_limit,
            usage_limit: rule.usage_limit,
            starts_at: rule.starts_at,
            ends_at: rule.ends_at,
            created_at: rule.created_at,
            updated_at: rule.updated_at,
            entitled_product_ids: rule.entitled_product_ids,
            entitled_variant_ids: rule.entitled_variant_ids,
            entitled_collection_ids: rule.entitled_collection_ids,
            entitled_country_ids: rule.entitled_country_ids,
            prerequisite_product_ids: rule.prerequisite_product_ids,
            prerequisite_variant_ids: rule.prerequisite_variant_ids,
            prerequisite_collection_ids: rule.prerequisite_collection_ids,
            customer_segment_prerequisite_ids:
              rule.customer_segment_prerequisite_ids,
            prerequisite_customer_ids: rule.prerequisite_customer_ids,
            prerequisite_subtotal_range: rule.prerequisite_subtotal_range,
            prerequisite_quantity_range: rule.prerequisite_quantity_range,
            prerequisite_shipping_price_range:
              rule.prerequisite_shipping_price_range,
            prerequisite_to_entitlement_quantity_ratio:
              rule.prerequisite_to_entitlement_quantity_ratio,
            prerequisite_to_entitlement_purchase:
              rule.prerequisite_to_entitlement_purchase,
            title: rule.title,
            admin_graphql_api_id: rule.admin_graphql_api_id,
          },
        });
      }
    }

    const occurrences = priceRules?.headers?.link?.match(/page_info/g);

    // Check if 'page_info' appears more than once
    if (occurrences && occurrences.length > 1) {
      console.log("forward and backward block");
      prevPage = priceRules?.headers?.link?.split("&page_info=")[1];
      prevPage = prevPage?.split(">")[0];
      forwardPage = priceRules.headers.link?.split(`rel="previous",`)[1];
      forwardPage = forwardPage?.split("&page_info=")[1];
      forwardPage = forwardPage?.split(">")[0];
    } else {
      console.log("only forward block");
      forwardPage = priceRules?.headers?.link?.split("&page_info=")[1];
      forwardPage = forwardPage?.split(">")[0];
    }

    link = {
      prevPage,
      forwardPage,
      pgInfo,
    };

    // console.log("data recieved and sent to client", filteredPriceRules);
    // Response
    res.status(200).send({
      status: true,
      data: filteredPriceRules,
      message: `Discounts Retrieved Successfully`,
      error: "",
      page: link,
    });
  } catch (error) {
    console.log("Error fetching price rules:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch collections",
      error: error.message,
    });
  }
});

app.get("/api/prod", async (_req, res) => {
  const prodData = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(prodData);
});

app.get("/api/collection", async (_req, res) => {
  const smartCollectionData = await shopify.api.rest.SmartCollection.all({
    session: res.locals.shopify.session,
  });
  const customCollectionData = await shopify.api.rest.CustomCollection.all({
    session: res.locals.shopify.session,
  });
  const allCollections = [
    ...smartCollectionData.data,
    ...customCollectionData.data,
  ];
  // console.log("server side", smartCollectionData);
  res.status(200).send(allCollections);
});

app.get("/api/get-price_rule/:id", async (req, res) => {
  try {
    // console.log("price rule id", req.params.id);
    const priceRuleId = req.params.id; // Note: Query parameter instead of path parameter
    if (!priceRuleId) {
      return res.status(400).send({
        status: false,
        data: null,
        message: "Missing Price Rule Id in the Parameters of the Request",
      });
    }
    // Session is built by the OAuth process

    const response = await shopify.api.rest.PriceRule.find({
      session: res.locals.shopify.session,
      id: priceRuleId,
    });

    console.log("price rule recieved and sent to client", response);
    // Response
    res.status(200).send({
      status: true,
      data: response,
      message: `price rule Retreived Successfully`,
    });
  } catch (error) {
    console.log("Error fetching collections:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch collections",
      error: error.message,
    });
  }
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

app.post("/api/create-automatic-discount", async (req, res) => {
  try {
    // const productsData = await shopify.api.rest.Product.all({
    //   session: res.locals.shopify.session,
    // });

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    //DISCOUNT TYPE : ORDER DISCOUNT
    const data = await client.query({
      data: {
        query: `mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
          discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
            automaticDiscountNode {
              id
              automaticDiscount {
                ... on DiscountAutomaticBasic {
                  startsAt
                  endsAt
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                        currencyCode
                      }
                    }
                  }
                  customerGets {
                    value {
                      ... on DiscountAmount {
                        amount {
                          amount
                          currencyCode
                        }
                        appliesOnEachItem
                      }
                    }
                    items {
                      ... on AllDiscountItems {
                        allItems
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              code
              message
            }
          }
        }`,
        variables: {
          automaticBasicDiscount: {
            title: "$50 off all orders over $200 during the summer of 2024",
            startsAt: "2024-09-12T00:00:00Z",
            endsAt: "2024-09-13T00:00:00Z",
            minimumRequirement: {
              subtotal: {
                greaterThanOrEqualToSubtotal: 200,
              },
            },
            customerGets: {
              value: {
                discountAmount: {
                  amount: 50,
                  appliesOnEachItem: false,
                },
              },
              items: {
                all: true,
              },
            },
          },
        },
      },
    });

    console.log("Discount created:", data);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).send({ message: "Failed to create discount" });
  }
});

app.post("/api/add-discount-code", async (req, res) => {
  try {
    const { discount_type, price_rule, discount_code } = req.body;

    if (!res.locals.shopify || !res.locals.shopify.session) {
      return res.status(400).send({ message: "Invalid session" });
    }
    if (!discount_type || !price_rule || !discount_code) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    // Validate price_rule fields
    if (!price_rule.title || !price_rule.value_type || !price_rule.value) {
      return res.status(400).send({ message: "Invalid price rule data" });
    }

    let requiredFields;
    switch (discount_type) {
      case "product":
        requiredFields = [
          "title",
          "value_type",
          "value",
          "customer_selection",
          "target_type",
          "target_selection",
          "allocation_method",
          "starts_at",
        ];
        break;
      case "order":
        requiredFields = [
          "title",
          "value_type",
          "value",
          "customer_selection",
          "target_type",
          "target_selection",
          "allocation_method",
          "starts_at",
        ];
        break;
      case "shipping":
        requiredFields = [
          "title",
          "value_type",
          "value",
          "customer_selection",
          "target_type",
          "target_selection",
          "allocation_method",
          "starts_at",
          "prerequisite_shipping_price_range",
        ];
        break;
      default:
        return res.status(400).send({ message: "Invalid discount type" });
    }

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !price_rule[field]);
    if (missingFields.length > 0) {
      return res.status(400).send({
        message: "Validation Error: Missing required fields",
        missingFields: missingFields,
      });
    }
    if (
      discount_type !== "shipping" &&
      discount_type !== "order" &&
      !price_rule.entitled_product_ids &&
      !price_rule.entitled_collection_ids
    ) {
      return res.status(400).send({
        message:
          "at least collection ids or product ids required to create discount",
        missingFields: ["entitled_collection_ids", "entitled_product_ids"],
      });
    }

    if (
      discount_type === "order" &&
      price_rule.target_type === "shipping_line" &&
      price_rule.target_selection === "entitled" &&
      !price_rule.entitled_country_ids
    ) {
      return res.status(400).send({
        message:
          "A list of IDs of shipping countries that will be entitled to the discount. It can be used only with target_type set to shipping_line and target_selection set to entitled",
        missingFields: ["entitled_country_ids"],
      });
    }
    if (
      price_rule.customer_selection === "prerequisite" &&
      !price_rule.prerequisite_customer_ids &&
      !price_rule.customer_segment_prerequisite_ids
    ) {
      return res.status(400).send({
        message:
          "at least prerequisite customer ids or customer_segment prerequisite ids required to create discount",
        missingFields: [
          "prerequisite_customer_ids",
          "customer_segment_prerequisite_ids",
        ],
      });
    }
    if (
      price_rule.customer_selection === "prerequisite" &&
      !price_rule.prerequisite_customer_ids &&
      !price_rule.customer_segment_prerequisite_ids
    ) {
      return res.status(400).send({
        message:
          "at least prerequisite customer ids or customer_segment prerequisite ids required to create discount",
        missingFields: [
          "prerequisite_customer_ids",
          "customer_segment_prerequisite_ids",
        ],
      });
    }

    const priceRule = new shopify.api.rest.PriceRule({
      session: res.locals.shopify.session,
    });

    //  priceRule: {
    priceRule.title = "CC_" + price_rule.title;
    priceRule.value_type = price_rule.value_type;
    priceRule.value = price_rule.value;
    priceRule.customer_selection = price_rule.customer_selection;
    priceRule.target_type = price_rule.target_type;
    priceRule.target_selection = price_rule.target_selection;
    priceRule.allocation_method = price_rule.allocation_method;
    priceRule.starts_at = price_rule.starts_at;
    priceRule.ends_at = price_rule.ends_at || undefined;
    if (discount_type === "product") {
      priceRule.prerequisite_subtotal_range =
        price_rule.prerequisite_subtotal_range || {};
    }
    if (discount_type === "product") {
      priceRule.prerequisite_to_entitlement_quantity_ratio =
        price_rule.prerequisite_to_entitlement_quantity_ratio || {};
    }
    if (discount_type === "product") {
      priceRule.entitled_product_ids = price_rule.entitled_product_ids || [];
      priceRule.entitled_collection_ids =
        price_rule.entitled_collection_ids || [];
      priceRule.prerequisite_product_ids =
        price_rule.prerequisite_product_ids || [];
      priceRule.prerequisite_collection_ids =
        price_rule.prerequisite_collection_ids || [];
    }
    if (
      discount_type === "product" &&
      price_rule.hasOwnProperty("prerequisite_to_entitlement_quantity_ratio")
    )
      if (price_rule.prerequisite_to_entitlement_quantity_ratio) {
        priceRule.prerequisite_to_entitlement_quantity_ratio =
          price_rule.prerequisite_to_entitlement_quantity_ratio;
      }
    if (
      price_rule.customer_selection === "prerequisite" &&
      price_rule.prerequisite_customer_ids
    ) {
      priceRule.prerequisite_customer_ids =
        price_rule.prerequisite_customer_ids || [];
    }
    if (
      price_rule.customer_selection === "prerequisite" &&
      price_rule.customer_segment_prerequisite_ids
    ) {
      priceRule.customer_segment_prerequisite_ids =
        price_rule.customer_segment_prerequisite_ids || [];
    }
    if (
      discount_type === "order" &&
      price_rule.hasOwnProperty("prerequisite_subtotal_range") &&
      price_rule.prerequisite_subtotal_range
    ) {
      priceRule.prerequisite_subtotal_range =
        price_rule.prerequisite_subtotal_range || undefined;
    }
    if (discount_type === "shipping") {
      priceRule.prerequisite_shipping_price_range =
        price_rule.prerequisite_shipping_price_range || undefined;
    }
    if (
      discount_type === "order" &&
      price_rule.target_type === "shipping_line" &&
      price_rule.target_selection === "entitled"
    ) {
      priceRule.entitled_country_ids = price_rule.entitled_country_ids;
    }
    if (discount_type === "order") {
      priceRule.entitled_product_ids = price_rule.entitled_product_ids || [];
      priceRule.prerequisite_shipping_price_range =
        price_rule.prerequisite_shipping_price_range || {};
      // hasExcludeShippingRatesOver=
      //   price_rule.hasExcludeShippingRatesOver || {};
      // excludeShippingRatesOver= price_rule.excludeShippingRatesOver || {},
      priceRule.hasExcludeShippingRatesOver = {
        value: true,
      };
      priceRule.excludeShippingRatesOver = {
        value: "21.00",
      };
    }
    priceRule.allocation_limit = price_rule.allocation_limit || undefined;
    priceRule.usage_limit = price_rule.usage_limit || undefined;
    priceRule.once_per_customer = price_rule.once_per_customer || false;
    priceRule.combinesWithProductDiscounts =
      price_rule.combinesWithProductDiscounts || false;
    priceRule.combinesWithOrderDiscounts = {
      value: price_rule.combinesWithOrderDiscounts || false,
    };
    priceRule.combinesWithShippingDiscounts =
      price_rule.combinesWithShippingDiscounts || false;

    await priceRule.save({
      update: true,
    });
    // const priceRuleData = priceRule;
    // const priceRuleId = savedPriceRule.id;
    // console.log("priceRuleId", priceRuleData);
    // if (!priceRuleId) {
    //   return res
    //     .status(500)
    //     .json({ message: "Failed to retrieve created price rule ID" });
    // }

    const savedDiscountCode = new shopify.api.rest.DiscountCode({
      session: res.locals.shopify.session,
    });

    savedDiscountCode.price_rule_id = priceRule.id;
    savedDiscountCode.code = "CC_" + discount_code;

    await savedDiscountCode.save({
      update: true,
    });
    const discountCodeData = savedDiscountCode.code;

    // if (!discountCodeData) {
    //   return res
    //     .status(500)
    //     .json({ message: "Failed to create discount code" });
    // }

    // Respond to client with both PriceRule and DiscountCode details

    const shopName = res.locals.shopify.session.shop;
    console.log(
      "savedPriceRule",
      discount_type,
      shopName,
      priceRule,
      savedDiscountCode.code
    );

    let DiscountMongoDb = new DiscountSchema({
      discount_type: discount_type,
      price_rule: priceRule,
      discount_code: savedDiscountCode.code,
      shopName,
    });
    await DiscountMongoDb.save();

    res.status(200).send({
      status: true,
      data: {
        priceRule: priceRule.id,
        discountCode: savedDiscountCode.code,
      },
      message: "Discount code created successfully",
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(400).send({ message: "Failed to create discount" });
  }
});

app.put("/api/update-price_rule/:id", async (req, res) => {
  try {
    // console.log("price rule id", req.params.id);
    const priceRuleId = req.params.id; // Note: Query parameter instead of path parameter
    const { discount_type, price_rule, discount_code } = req.body;

    if (!priceRuleId) {
      return res.status(400).send({
        status: false,
        data: null,
        message: "Missing Price Rule Id in the Parameters of the Request",
      });
    }
    // Session is built by the OAuth process

    const response = await shopify.api.rest.PriceRule.find({
      session: res.locals.shopify.session,
    });
    response.id = priceRuleId;
    if (price_rule.title.startsWith("CC_")) {
      response.title = price_rule.title;
    } else {
      response.title = "CC_" + price_rule.title;
    }
    response.value_type = price_rule.value_type;
    response.value = price_rule.value;
    response.customer_selection = price_rule.customer_selection;
    response.target_type = price_rule.target_type;
    response.target_selection = price_rule.target_selection;
    response.allocation_method = price_rule.allocation_method;
    response.starts_at = price_rule.starts_at;
    response.ends_at = price_rule.ends_at || undefined;
    if (discount_type === "product") {
      response.prerequisite_subtotal_range =
        price_rule.prerequisite_subtotal_range || {};
    }
    if (discount_type === "product") {
      response.prerequisite_to_entitlement_quantity_ratio =
        price_rule.prerequisite_to_entitlement_quantity_ratio || {};
    }
    if (discount_type === "product") {
      response.entitled_product_ids = price_rule.entitled_product_ids || [];
      response.entitled_collection_ids =
        price_rule.entitled_collection_ids || [];
      response.prerequisite_product_ids =
        price_rule.prerequisite_product_ids || [];
      response.prerequisite_collection_ids =
        price_rule.prerequisite_collection_ids || [];
    }
    if (
      discount_type === "product" &&
      price_rule.hasOwnProperty("prerequisite_to_entitlement_quantity_ratio")
    )
      if (price_rule.prerequisite_to_entitlement_quantity_ratio) {
        response.prerequisite_to_entitlement_quantity_ratio =
          price_rule.prerequisite_to_entitlement_quantity_ratio;
      }
    if (
      price_rule.customer_selection === "prerequisite" &&
      price_rule.prerequisite_customer_ids
    ) {
      response.prerequisite_customer_ids =
        price_rule.prerequisite_customer_ids || [];
    }
    if (
      price_rule.customer_selection === "prerequisite" &&
      price_rule.customer_segment_prerequisite_ids
    ) {
      response.customer_segment_prerequisite_ids =
        price_rule.customer_segment_prerequisite_ids || [];
    }
    if (
      discount_type === "order" &&
      price_rule.hasOwnProperty("prerequisite_subtotal_range") &&
      price_rule.prerequisite_subtotal_range
    ) {
      response.prerequisite_subtotal_range =
        price_rule.prerequisite_subtotal_range || undefined;
    }
    if (discount_type === "shipping") {
      response.prerequisite_shipping_price_range =
        price_rule.prerequisite_shipping_price_range || undefined;
    }
    if (
      discount_type === "order" &&
      price_rule.target_type === "shipping_line" &&
      price_rule.target_selection === "entitled"
    ) {
      response.entitled_country_ids = price_rule.entitled_country_ids;
    }
    if (discount_type === "order") {
      response.entitled_product_ids = price_rule.entitled_product_ids || [];
      response.prerequisite_shipping_price_range =
        price_rule.prerequisite_shipping_price_range || {};
      // hasExcludeShippingRatesOver=
      //   price_rule.hasExcludeShippingRatesOver || {};
      // excludeShippingRatesOver= price_rule.excludeShippingRatesOver || {},
      response.hasExcludeShippingRatesOver = {
        value: true,
      };
      response.excludeShippingRatesOver = {
        value: "21.00",
      };
    }
    response.allocation_limit = price_rule.allocation_limit || undefined;
    response.usage_limit = price_rule.usage_limit || undefined;
    response.once_per_customer = price_rule.once_per_customer || false;
    response.combinesWithProductDiscounts =
      price_rule.combinesWithProductDiscounts || false;
    response.combinesWithOrderDiscounts = {
      value: price_rule.combinesWithOrderDiscounts || false,
    };
    response.combinesWithShippingDiscounts =
      price_rule.combinesWithShippingDiscounts || false;

    await response.save({
      update: true,
    });

    //get discount code id

    const discount_code_data = await shopify.api.rest.DiscountCode.all({
      session: res.locals.shopify.session,
      price_rule_id: priceRuleId,
    });

    //update discount data (from private db)

    const result = await DiscountSchema.findOneAndUpdate(
      { discount_code: discount_code }, // Query filter
      { discount_type, price_rule: response, discount_code }, // Update data
      { new: true } // Options
    );

    // update discount code (from shopify db)
    const savedDiscountCode = new shopify.api.rest.DiscountCode({
      session: res.locals.shopify.session,
    });

    savedDiscountCode.price_rule_id = priceRuleId;
    savedDiscountCode.id = discount_code_data.data[0].id;
    if (discount_code.startsWith("CC_")) {
      savedDiscountCode.code = discount_code;
    } else {
      savedDiscountCode.code = "CC_" + discount_code;
    }

    await savedDiscountCode.save({
      update: true,
    });

    console.log("price rule updated and sent to client", result);
    // Response
    res.status(200).send({
      status: true,
      data: { savedDiscountCode, response, result },
      message: `price rule updated Successfully`,
    });
  } catch (error) {
    console.log("Error update price rule:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update price rule",
      error: error.message,
    });
  }
});

app.delete("/api/delete-discount", async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).send({ message: "Id not given in params" });
    }

    const price_rule = await shopify.api.rest.DiscountCode.all({
      session: res.locals.shopify.session,
      price_rule_id: id,
    });

    const result = await DiscountSchema.findOneAndDelete({
      discount_code: price_rule.data[0].code,
    });
    await shopify.api.rest.PriceRule.delete({
      session: res.locals.shopify.session,
      id: id,
    });

    console.log("success delete");
    res.status(200).send({ message: "Discount deleted successfully" });
  } catch (error) {
    console.log("cannot delete", error);
    res
      .status(400)
      .send({ message: "Can't delete discount", error: error.message });
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

console.log("env", process.env.MONGO_URI);
mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then(() => {
    app.listen(process.env.PORT || PORT, () => {
      console.log(
        `Database Connected Successfully and server is listening on this port ${
          process.env.PORT || PORT
        }`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
