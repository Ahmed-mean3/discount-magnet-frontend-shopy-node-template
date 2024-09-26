import {
  reactExtension,
  Text,
  BlockStack,
  InlineStack,
  Card,
  Spinner,
  Image,
  useApi,
  useAuthenticatedAccountCustomer,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
  Divider,
  InlineSpacer,
  ScrollView,
  Icon,
  Grid,
  TextField,
} from "@shopify/ui-extensions-react/checkout";
import copy from "copy-to-clipboard";
export default reactExtension(
  "customer-account.order-index.block.render",
  () => <Extension />
);

function Extension() {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [userDiscountProducts, setUserDiscountProducts] = useState([]);
  const [userDiscountCollection, setUserDiscountCollection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [page, setPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const api = useApi();
  const { id } = useAuthenticatedAccountCustomer();
  const fetchData = async () => {
    const response = await api.fetch("api/prod");
    const json = await response.json();
    console.log("checkup", json);
  };
  console.log("customerrrr", id);
  // Function to filter discounts based on customers array
  // Function to filter discounts based on customers array
  function filterDiscountsByCustomer(discounts) {
    return discounts.filter((discount) => {
      const { prerequisite_customer_ids, customer_segment_prerequisite_ids } =
        discount.priceRuleDetails;

      // Convert customerId to a number for correct comparison
      const _id = Number(id);
      // If both arrays are null or empty, automatically add the discount
      const hasNoPrerequisites =
        (!prerequisite_customer_ids ||
          prerequisite_customer_ids.length === 0) &&
        (!customer_segment_prerequisite_ids ||
          customer_segment_prerequisite_ids.length === 0);

      if (hasNoPrerequisites) {
        return true;
      }

      // Check if the customer id matches any of the prerequisite IDs or segment IDs
      const matchesPrerequisiteCustomer =
        prerequisite_customer_ids?.includes(_id);
      const matchesPrerequisiteSegment =
        customer_segment_prerequisite_ids?.includes(_id);

      // Add the discount if the id matches either condition
      return matchesPrerequisiteCustomer || matchesPrerequisiteSegment;
    });
  }

  const fetchDiscounts = async (isPaginate = null) => {
    try {
      setLoading(true);
      let apiUrl =
        "https://middleware-discountapp.mean3.ae/get-discounts?limit=12";
      if (isPaginate) {
        apiUrl += `&page=${isPaginate}`;
      } else {
        apiUrl =
          "https://middleware-discountapp.mean3.ae/get-discounts?limit=12";
      }
      console.log(
        "check function gets accurate page info?",
        apiUrl,
        "check state forward",
        page,
        "check state backward",
        prevPage
      );
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
      setPrevPage(response.data.page.prevPage);
      setPage(response.data.page.forwardPage);
      const customers = await fetchCustomers();
      console.log("mathin", customers);

      const matched = filterDiscountsByCustomer(discountData);
      console.log("mathingggg....", matched);
      setDiscountCodes(matched);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching discounts", error);
    }
  };
  const fetchCustomers = async (isPaginate = null) => {
    try {
      let apiUrl = "https://middleware-discountapp.mean3.ae/get-customers";
      // if (isPaginate) {
      //   apiUrl += `&page=${isPaginate}`;
      // } else {
      //   apiUrl = "https://middleware-discountapp.mean3.ae/get-customers";
      // }
      // console.log(
      //   "check function gets accurate page info?",
      //   apiUrl,
      //   "check state forward",
      //   page,
      //   "check state backward",
      //   prevPage
      // );
      const response = await axios.get(apiUrl, {
        headers: {
          "api-key": "Do2j^jF",
          "shop-name": "store-for-customer-account-test",
          "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
          "shopify-api-token": "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",
          "Content-Type": "application/json",
        },
      });

      const customersData = response.data.data;

      return customersData;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching discounts", error);
    }
  };
  const triggerPaginate = () => {
    // apiUrl = `${apiUrl}&page_info=${page}`;
    // console.log("url check", apiUrl);
    if (page === null) {
      fetchDiscounts(null);
    } else {
      fetchDiscounts(page);
    }
  };
  const triggerPaginateBack = () => {
    // apiUrl = `${apiUrl}&page_info=${page}`;
    // console.log("url check", apiUrl);
    if (prevPage === null) {
      fetchDiscounts(null);
    } else {
      fetchDiscounts(prevPage);
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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchCollectionProducts = async (_collection) => {
    const allCollectionData = []; // Initialize an array to hold all collection data

    for (let i = 0; i < _collection.length; i++) {
      console.log("Processing collection ID:", _collection[i]);

      const apiUrl = `https://middleware-discountapp.mean3.ae/get-products?isCollection=${_collection[i]}`;

      try {
        const response = await axios.get(apiUrl, {
          headers: {
            "api-key": "Do2j^jF",
            "shop-name": "store-for-customer-account-test",
            "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
            "shopify-api-token": "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",
            "Content-Type": "application/json",
          },
        });

        const collectionData = response.data.data.collection;

        if (collectionData) {
          allCollectionData.push(collectionData); // Add collectionData to the array
        }
        console.log("vals", allCollectionData);

        await delay(1000); // Wait for 1 second before making the next API call
      } catch (error) {
        console.error(
          `Error fetching products for collection ID: ${_collection[i]}`,
          error
        );
      }
    }

    // Update state with the accumulated array after the loop
    setUserDiscountCollection(allCollectionData);
  };

  const handleGetDiscountDetails = async (input) => {
    const isCollection = input.entitled_product_ids.length > 0 ? false : true;
    let apiUrl = "https://middleware-discountapp.mean3.ae/get-products";

    try {
      if (isCollection) {
        // // console.log("ids seamlessly getted", input.entitled_collection_ids);
        // for (input.entitled_collection_ids in _collection) {
        //   console.log("ids seamlessly getted", _collection);
        //   apiUrl = `https://middleware-discountapp.mean3.ae/get-products?isCollection=${_collection}`;
        //   const response = await axios.get(apiUrl, {
        //     headers: {
        //       "api-key": "Do2j^jF",
        //       "shop-name": "store-for-customer-account-test",
        //       "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
        //       "shopify-api-token": "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",
        //       "Content-Type": "application/json",
        //     },
        //   });

        //   const collectionData = response.data.data.collection;
        //   setUserDiscountProducts([...userDiscountProducts, collectionData]);
        // }
        await fetchCollectionProducts(input.entitled_collection_ids);
      } else {
        const response = await axios.get(apiUrl, {
          headers: {
            "api-key": "Do2j^jF",
            "shop-name": "store-for-customer-account-test",
            "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
            "shopify-api-token": "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",
            "Content-Type": "application/json",
          },
        });
        const productsData = response.data.data.products;

        // console.log("fetched products", productsData);
        // setUserDiscountProducts(productsData);

        const data = productsData.filter((product) =>
          input.entitled_product_ids.includes(product.id)
        );
        setUserDiscountProducts(data);
      }

      // setUserDiscountProducts(productsData);
      // console.log("check of match", filterProducts);
    } catch (error) {
      // setLoading(false);
      console.error("Error getting products", error);
    }
  };
  const handleCopy = async (textToCopy) => {
    if (!navigator.clipboard) {
      console.error("Clipboard API is not supported.");
      return;
    }

    try {
      // console.log("copied", textToCopy);
      // return;
      await navigator.clipboard.writeText(textToCopy);
      // setShowToast(true);
      console.log("copied");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    // fetchShowDetails();
    fetchData();
    fetchDiscounts();
  }, []);
  console.log("detail", discountCodes);
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
      <Grid
        inlineAlignment="center"
        columns={["auto", "auto", "auto", "auto"]}
        // rows={[300, 300]}
        spacing="loose"
      >
        {/* <Box roundedAbove="sm" padding="tight"> */}
        {loading ? (
          <Spinner accessibilityLabel="Loading Discounts" size="small" />
        ) : discountCodes.length > 0 ? (
          discountCodes.map((discount, index) => (
            <Card roundedAbove="sm" key={index}>
              <View border="none" padding="base" style={{ overflow: "hidden" }}>
                <BlockStack spacing="base">
                  {" "}
                  {/* Base spacing between elements */}
                  {/* Heading */}
                  <InlineStack blockAlignment="center">
                    <Text emphasis="bold">{discount.code}</Text>
                    <Button
                      onPress={() => navigator.clipboard.writeText("abc")}
                      inlineAlignment="start"
                      kind="tertiary"
                      appearance="accent"
                    >
                      <Icon
                        source="note"
                        accessibilityLabel="Copy to clipboard"
                      />
                    </Button>
                  </InlineStack>
                  {/* Spacer between the heading and list */}
                  {/* <BlockSpacer spacing="tight" /> */}
                  {/* Type and method section */}
                  <Text emphasis="bold">Type and method</Text>
                  <List spacing="tight">
                    {" "}
                    {/* Adjust spacing between list items */}
                    <ListItem>
                      {discount.priceRuleDetails?.target_type ===
                      "shipping_line"
                        ? "Free Shipping"
                        : discount.priceRuleDetails
                            ?.prerequisite_to_entitlement_quantity_ratio
                            ?.prerequisite_quantity > 0 &&
                          discount.priceRuleDetails
                            ?.prerequisite_to_entitlement_quantity_ratio
                            ?.entitled_quantity > 0
                        ? "BuyXGetY Free"
                        : "Amount off products"}
                    </ListItem>
                    <ListItem>Code</ListItem>
                  </List>
                  {/* Spacer between sections */}
                  {/* <BlockSpacer spacing="tight" /> */}
                  {/* Details section */}
                  <Text emphasis="bold">Details</Text>
                  <List spacing="tight">
                    {/* Adjust list item spacing here too */}
                    <ListItem>For Online Store</ListItem>
                    <ListItem>
                      <Button
                        inlineAlignment="start"
                        onPress={() =>
                          handleGetDiscountDetails(discount.priceRuleDetails)
                        }
                        overlay={
                          <Modal
                            id="my-modal"
                            padding
                            title={`Discount Associated ${
                              discount.priceRuleDetails.entitled_product_ids
                                .length > 0
                                ? "Products"
                                : "Collections"
                            }`}
                          >
                            {discount.priceRuleDetails.entitled_product_ids
                              .length > 0 //add seperate collection ui after saving into sepereate state of api calls data.
                              ? userDiscountProducts.map((product) => (
                                  <>
                                    <View
                                      padding="base"
                                      border="base"
                                      borderRadius="large"
                                    >
                                      <InlineStack
                                        blockAlignment="center"
                                        spacing="tight"
                                      >
                                        <Image
                                          borderRadius="large"
                                          source={
                                            product.image
                                              ? `${product.image.src}?width=50&height=50`
                                              : "https://via.placeholder.com/50x50?text=No Image"
                                          }
                                          fit="contain"
                                        />
                                        <BlockStack
                                          display="inline"
                                          // flexDirection="column"
                                          spacing="extraTight"
                                          // padding="loose"
                                        >
                                          <Text emphasis="bold">
                                            {product.title}
                                          </Text>
                                          <Text
                                            emphasis="bold"
                                            appearance="success"
                                          >
                                            ${product?.variants[0]?.price}
                                          </Text>
                                        </BlockStack>
                                      </InlineStack>
                                    </View>
                                    <InlineSpacer spacing="loose" />
                                  </>
                                ))
                              : userDiscountCollection.map((collection) => (
                                  <View
                                    key={collection.id}
                                    padding="base"
                                    border="base"
                                    borderRadius="large"
                                  >
                                    <InlineStack
                                      blockAlignment="center"
                                      spacing="tight"
                                    >
                                      <Image
                                        borderRadius="large"
                                        source={
                                          collection.image
                                            ? `${collection.image.src}?width=50&height=50`
                                            : "https://via.placeholder.com/50x50?text=No Image"
                                        }
                                        fit="contain"
                                      />
                                      <BlockStack
                                        display="inline"
                                        // flexDirection="column"
                                        spacing="extraTight"
                                        // padding="loose"
                                      >
                                        <Text emphasis="bold">
                                          {collection.title}
                                        </Text>
                                        <Text
                                          emphasis="bold"
                                          appearance="subdued"
                                        >
                                          {collection.products_count} products
                                        </Text>
                                      </BlockStack>
                                    </InlineStack>
                                  </View>
                                ))}
                          </Modal>
                        }
                        kind="tertiary"
                        appearance="accent"
                      >
                        {discount.priceRuleDetails?.entitled_collection_ids
                          ?.length === 0 &&
                        discount.priceRuleDetails?.entitled_product_ids
                          ?.length === 0 &&
                        (discount.priceRuleDetails?.value_type ===
                          "fixed_amount" ||
                          discount.priceRuleDetails?.value_type ===
                            "percentage") ? (
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
                            avail{" "}
                            {discount.priceRuleDetails?.value_type !==
                              "percentage" && "$"}
                            {Math.abs(
                              Math.round(
                                parseFloat(
                                  discount.priceRuleDetails?.value ?? 0
                                )
                              )
                            )}
                            {discount.priceRuleDetails?.value_type !==
                              "fixed_amount" && "%"}{" "}
                            off an order
                          </Text>
                        ) : discount.priceRuleDetails?.target_type ===
                            "shipping_line" &&
                          discount.priceRuleDetails
                            ?.prerequisite_subtotal_range &&
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
                            Minimum purchase of $
                            {Math.round(
                              parseFloat(
                                discount.priceRuleDetails
                                  ?.prerequisite_subtotal_range
                                  ?.greater_than_or_equal_to ?? 0
                              )
                            )}
                          </Text>
                        ) : discount.priceRuleDetails?.target_type ===
                            "shipping_line" &&
                          !discount.priceRuleDetails.prerequisite_subtotal_range
                            ?.greater_than_or_equal_to ? (
                          `No minimum purchase requirement`
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
                        ) : discount.priceRuleDetails
                            ?.prerequisite_product_ids ||
                          (discount.priceRuleDetails?.entitled_product_ids &&
                            discount.priceRuleDetails?.target_type !==
                              "shipping_line") ? (
                          <Text
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            as="p"
                            fontWeight="regular"
                          >
                            {!(
                              discount.priceRuleDetails?.target_type ===
                                "shipping_line" &&
                              !discount.priceRuleDetails
                                .prerequisite_subtotal_range
                                ?.greater_than_or_equal_to
                            ) && "Avail off"}
                            {discount.priceRuleDetails?.value_type !==
                              "percentage" &&
                            !(
                              discount.priceRuleDetails?.target_type ===
                                "shipping_line" &&
                              !discount.priceRuleDetails
                                .prerequisite_subtotal_range
                                ?.greater_than_or_equal_to
                            )
                              ? " $"
                              : " "}
                            {!(
                              discount.priceRuleDetails?.target_type ===
                                "shipping_line" &&
                              !discount.priceRuleDetails
                                .prerequisite_subtotal_range
                                ?.greater_than_or_equal_to
                            ) &&
                              Math.abs(
                                Math.round(
                                  parseFloat(
                                    discount.priceRuleDetails?.value ?? 0
                                  )
                                )
                              )}
                            {!(
                              discount.priceRuleDetails?.target_type ===
                                "shipping_line" &&
                              !discount.priceRuleDetails
                                .prerequisite_subtotal_range
                                ?.greater_than_or_equal_to
                            ) &&
                              discount.priceRuleDetails?.value_type !==
                                "fixed_amount" &&
                              "%"}{" "}
                            {!(
                              discount.priceRuleDetails?.target_type ===
                                "shipping_line" &&
                              !discount.priceRuleDetails
                                .prerequisite_subtotal_range
                                ?.greater_than_or_equal_to
                            ) && `Avail off${" "}`}
                            {discount.priceRuleDetails?.prerequisite_product_ids
                              ?.length > 0 ||
                            discount.priceRuleDetails?.entitled_product_ids
                              ?.length > 0
                              ? `${
                                  discount.priceRuleDetails
                                    ?.entitled_product_ids?.length
                                } Product${
                                  discount.priceRuleDetails
                                    ?.entitled_product_ids?.length !== 1
                                    ? "s"
                                    : ""
                                }`
                              : discount.priceRuleDetails
                                  ?.entitled_collection_ids?.length > 0
                              ? ` ${
                                  discount.priceRuleDetails
                                    ?.entitled_collection_ids?.length
                                } Collection${
                                  discount.priceRuleDetails
                                    ?.entitled_collection_ids?.length !== 1
                                    ? "s"
                                    : ""
                                }`
                              : "Discount format or type needs to adjust????"}
                          </Text>
                        ) : null}
                      </Button>
                    </ListItem>
                  </List>
                </BlockStack>
              </View>
            </Card>
          ))
        ) : (
          <Text>No discounts available</Text>
        )}
      </Grid>

      {/* </Box> */}
      {/* Pagination bars */}
      <View inlineAlignment="center">
        <InlineStack>
          <Button
            onPress={triggerPaginateBack}
            kind="tertiary"
            appearance="accent"
            style={{
              backgroundColor: Style.default("transparent").when(
                { hover: true },
                "gray"
              ),
            }}
          >
            <Icon source="chevronLeft" />
          </Button>
          <Button
            onPress={triggerPaginate}
            // kind={Style.default("tertiary").when({ hover: true }, "primary")}
            kind={Style.default("tertiary").when({ hover: true }, "primary")}
            appearance={Style.default("accent").when(
              { hover: true },
              "critical"
            )}
          >
            <Icon source="chevronRight" />
          </Button>
        </InlineStack>
      </View>
    </BlockStack>
  );
}
