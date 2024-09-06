import {
  reactExtension,
  Text,
  BlockStack,
  InlineStack,
  Card,
  Spinner,
  Image,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Badge,
  BlockSpacer,
  View,
  List,
  ListItem,
  Tag,
  Button,
  Link,
  Modal,
  TextBlock,
  Style,
} from "@shopify/ui-extensions-react/checkout";
export default reactExtension(
  "customer-account.order-index.block.render",
  () => <Extension />
);

function Extension() {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { ui } = useApi();

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const apiUrl = "https://middleware-discountapp.mean3.ae/get-discounts";

      const response = await axios.get(apiUrl, {
        headers: {
          "api-key": "Do2j^jF",
          "shop-name": "store-for-customer-account-test",
          "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
          "shopify-api-token": "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",
          "Content-Type": "application/json",
        },
      });

      const discountData = response.data.data;

      // // Fetch price rule details for each discount
      // const discountDetails = await Promise.all(
      //   discountData.map(async (discount) => {
      //     const priceRule = await fetchPriceRule(discount.price_rule_id);
      //     return {
      //       code: discount.code,
      //       priceRuleDetails: priceRule,
      //     };
      //   })
      // );
      console.log("->>>>>>>>>>>>>>>>>>>>>>>>", discountData);
      setDiscountCodes(discountData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching discounts", error);
    }
  };

  const fetchPriceRule = async (price_rule_id) => {
    try {
      const apiUrl = `https://middleware-discountapp.mean3.ae/get-price_rule/${price_rule_id}`;
      const response = await axios.get(apiUrl, {
        headers: {
          "api-key": "Do2j^jF",
          "shop-name": "store-for-customer-account-test",
          "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
          "shopify-api-token": "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",
          "Content-Type": "application/json",
        },
      });

      return response.data.data.price_rules[0];
    } catch (error) {
      console.error("Error fetching price rule", error.response.data);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <BlockStack
      // inlineAlignment="center"
      background="red"
      padding={"tight"}
      gap="600"
    >
      <Text emphasis="bold" size="large" as="h1">
        Store-wide discounts
      </Text>
      {/* <Grid
        columns={["20%", "fill", "auto"]}
        rows={[300, "auto"]}
        spacing="loose"
      >
        <View border="base" padding="base">
          <Text as="h2" variant="headingMd" fontWeight="bold">
            use{" "}
          </Text>
          <Badge tone="subdued" icon="discount" status="success">
            {discount.code}
          </Badge>
          <Text as="h2" variant="headingMd" fontWeight="bold">
            and avail{" "}
          </Text>
          <Text as="p" fontWeight="regular">
            {discount.priceRuleDetails.value_type === "fixed_amount"
              ? `$${discount.priceRuleDetails.value} off`
              : `${discount.priceRuleDetails.value}% off`}
          </Text>
          <Text as="h2" variant="headingMd" fontWeight="bold">
            discount on collection_name
          </Text>
        </View>
        <View border="base" padding="base">
          fill / 300
        </View>
      </Grid> */}
      {/* <Link
        overlay={
          <Modal id="my-modal" padding title="Return policy">
            <TextBlock>
              We have a 30-day return policy, which means you have 30 days after
              receiving your item to request a return.
            </TextBlock>
            <TextBlock>
              To be eligible for a return, your item must be in the same
              condition that you received it, unworn or unused, with tags, and
              in its original packaging. You’ll also need the receipt or proof
              of purchase.
            </TextBlock>
            <Button onPress={() => ui.overlay.close("my-modal")}>Close</Button>
          </Modal>
        }
      >
        Return policy
      </Link> */}

      <Card roundedAbove="sm" padding="tight">
        {loading ? (
          <Spinner accessibilityLabel="Loading Discounts" size="small" />
        ) : discountCodes.length > 0 ? (
          discountCodes.map((discount, index) => (
            <List key={index}>
              <ListItem>
                <InlineStack
                  spacing="extraTight"
                  gap="400"
                  wrap={false}
                  alignment="center"
                >
                  <View
                    border="none"
                    padding="base"
                    style={{ overflow: "hidden" }}
                  >
                    {" "}
                    <Text as="h2" variant="headingMd" fontWeight="bold">
                      use{" "}
                    </Text>
                    {/* <Tag className="badge" icon="discount">
                      {" "}
                      {discount.code}
                    </Tag> */}
                    <Badge
                      style={{
                        whiteSpace: "normal", // Allow text to wrap
                        overflow: "visible", // Ensure overflow text is visible
                        textOverflow: "clip", // Clip overflow text (default behavior)
                        display: "block", // Ensure block display for wrapping
                        maxWidth: "100%", // Ensure the badge can shrink if needed
                      }}
                      icon="discount"
                      status="success"
                    >
                      {discount.code}
                    </Badge>
                    {discount.priceRuleDetails?.entitled_collection_ids
                      ?.length === 0 &&
                    discount.priceRuleDetails?.entitled_product_ids?.length ===
                      0 &&
                    discount.priceRuleDetails?.value_type === "fixed_amount" ? (
                      <Text
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        as="h2"
                        variant="headingMd"
                        fontWeight="bold"
                      >
                        {" "}
                        and avail -$
                        {Math.abs(
                          Math.round(
                            parseFloat(discount.priceRuleDetails?.value ?? 0)
                          )
                        )}{" "}
                        off an order
                      </Text>
                    ) : discount.priceRuleDetails?.target_type ===
                        "shipping_line" &&
                      discount.priceRuleDetails?.prerequisite_subtotal_range &&
                      !discount.priceRuleDetails
                        ?.prerequisite_shipping_price_range
                        ?.greater_than_or_equal_to ? (
                      <Text
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {" "}
                        and avail Free Shipping over order of $
                        {Math.round(
                          parseFloat(
                            discount.priceRuleDetails
                              ?.prerequisite_subtotal_range
                              ?.greater_than_or_equal_to ?? 0
                          )
                        )}
                      </Text>
                    ) : discount.priceRuleDetails
                        ?.prerequisite_to_entitlement_quantity_ratio
                        ?.prerequisite_quantity > 0 &&
                      discount.priceRuleDetails
                        ?.prerequisite_to_entitlement_quantity_ratio
                        ?.entitled_quantity > 0 ? (
                      <Text
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        as="h2"
                        variant="headingMd"
                        fontWeight="bold"
                      >
                        and get Buy{" "}
                        {
                          discount.priceRuleDetails
                            ?.prerequisite_to_entitlement_quantity_ratio
                            ?.prerequisite_quantity
                        }{" "}
                        Get{" "}
                        {
                          discount.priceRuleDetails
                            ?.prerequisite_to_entitlement_quantity_ratio
                            ?.entitled_quantity
                        }{" "}
                        free offer
                      </Text>
                    ) : discount.priceRuleDetails?.prerequisite_product_ids ||
                      discount.priceRuleDetails?.entitled_product_ids ? (
                      <>
                        <Text
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          as="h2"
                          variant="headingMd"
                          fontWeight="bold"
                        >
                          {" "}
                          and avail{" "}
                        </Text>
                        <Text
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          as="p"
                          fontWeight="regular"
                        >
                          {discount.priceRuleDetails?.value_type !==
                            "percentage" && "$"}
                          {Math.abs(
                            Math.round(
                              parseFloat(discount.priceRuleDetails?.value ?? 0)
                            )
                          )}
                          {discount.priceRuleDetails?.value_type !==
                            "fixed_amount" && "%"}{" "}
                          off{" "}
                        </Text>
                        <Text
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          as="h2"
                          variant="headingMd"
                          fontWeight="bold"
                        >
                          {discount.priceRuleDetails?.prerequisite_product_ids
                            ?.length > 0 ||
                          discount.priceRuleDetails?.entitled_product_ids
                            ?.length > 0
                            ? "Specific Product"
                            : discount.priceRuleDetails
                                ?.prerequisite_collection_ids?.length > 0
                            ? "Specific Collection"
                            : "Discount format or type needs to adjust????"}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </InlineStack>
              </ListItem>
            </List>
          ))
        ) : (
          <Text>No discounts available</Text>
        )}
      </Card>
    </BlockStack>
  );
}
<style jsx>{`
  .badge {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    .badge {
      font-size: 0.8rem;
    }

    InlineStack {
      flex-direction: column;
      align-items: flex-start;
    }

    Text {
      font-size: 0.9rem;
    }
  }

  @media (min-width: 601px) and (max-width: 900px) {
    .badge {
      font-size: 1rem;
    }

    InlineStack {
      flex-direction: row;
    }

    Text {
      font-size: 1.1rem;
    }
  }
`}</style>;
