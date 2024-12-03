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
  useShop,
  useCustomer,
  useSessionToken,
  useShippingAddress,

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
  SkeletonImage,
  Banner,
} from "@shopify/ui-extensions-react/checkout";
import copy from "copy-to-clipboard";
export default reactExtension(
  "customer-account.order-index.block.render",
  () => <Extension />
);

function Extension() {
  const api = useApi();
  const { id } = useAuthenticatedAccountCustomer();
  const [discountCodes, setDiscountCodes] = useState([]);
  const [userDiscountProducts, setUserDiscountProducts] = useState([]);
  const [userDiscountCollection, setUserDiscountCollection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noInventory, setNoInventory] = useState([]);
  const [isAddtoCart, setIsAddtoCart] = useState(false);
  const [page, setPage] = useState(1);
  // const [prevPage, setPrevPage] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [shopData, setShopData] = useState();
  const [allCollections, setAllCollections] = useState([]);

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const fetchData = async () => {
    const response = await api.fetch("api/prod");
    const json = await response.json();
    console.log("checkup", json);
  };

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
      // console.log("page nooo", shopData);
      // setLoading(true);
      let apiUrl =
        "https://test-shop-backend.vercel.app/get-discounts?limit=50";
      if (isPaginate) {
        apiUrl += `&page=${isPaginate}`;
      } else {
        apiUrl = "https://test-shop-backend.vercel.app/get-discounts?limit=50";
      }
      const response = await axios.get(apiUrl, {
        headers: {
          "api-key": `${process.env.API_DB_KEY}`,
          "shop-name": `${shopData}`,
          "Content-Type": "application/json",
        },
      });

      const discountData = response.data.data;

      console.log("respon", response.data.data);


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
      setPage((prev) => prev + 1);
      fetchDiscounts(page);
    }
  };
  const triggerPaginateBack = () => {
    // apiUrl = `${apiUrl}&page_info=${page}`;
    // console.log("url check", apiUrl);
    if (page === null) {
      fetchDiscounts(null);
    } else {
      if (page >= 1) {
        setPage((prev) => prev - 1);
        fetchDiscounts(page);
      }
    }
  };

  const handleGetDiscountDetails = async (input) => {
    const isCollection = input.entitled_product_ids.length > 0 ? false : true;

    try {
      if (isCollection) {
        // fetchCollectionProducts(input.entitled_collection_ids);
        if (Array.isArray(input.entitled_collection_ids)) {
          setUserDiscountCollection(
            allCollections.filter((collection) =>
              input.entitled_collection_ids.includes(
                parseInt(collection.node.id.split("Collection/")[1])
              )
            )
          );
        }
      } else {
        api
          .query(
            `query getProducts($first: Int) {
      products(first: $first) {
        edges {
          cursor
          node {
            id
            title
            featuredImage {
          url
        }
        availableForSale
        totalInventory
        priceRange {
          maxVariantPrice {
            amount
          }
          minVariantPrice {
            amount
          }
        }
          }
        }
      }
    }`,
            {
              variables: { first: 100 },
            }
          )
          .then(({ data, errors }) => {
            const productsData = data.products.edges;

            const _data = productsData
              .filter((product) => {
                const productId = parseInt(
                  product.node.id.split("/Product/")[1],
                  10
                );
                console.log(
                  "filtring....",
                  productId,
                  input.entitled_product_ids
                );

                // Filter based on the product ID
                return input.entitled_product_ids.includes(productId);
              })
              .map((product) => product.node); // Extract only the `node` object

            console.log("filtring....", _data);
            setUserDiscountProducts(_data);
          })
          .catch(console.error);
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
  // console.log("userDiscountCollection", userDiscountCollection);

  const handleGetVariant = async (productId) => {
    // console.log('product id', productId)
    return await api
      .query(
        `query ($productId: ID!) {
  product(id: $productId) {
    title
    variants(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
}`,
        {
          variables: {
            productId: productId,
          },
        }
      )
      .then(({ data, errors }) => {
        if (errors) {
          console.log("failed to get variant", errors);
          setIsAddtoCart(false);

        } else {
          console.log("response data:", data); // Log full response
          if (data?.product?.variants?.edges?.length > 0) {
            return data.product.variants.edges[0].node.id;
          } else {
            console.log("No variants found for product:", productId);
            setIsAddtoCart(false);

            return null;
          }
        }
      })
      .catch((error) => {
        setIsAddtoCart(false);

        console.log("error failed to get variant", error);
      });
  };

  const handlePostAddToCart = async (payload, type, discountCode) => {
    console.log('discount code ', discountCode)
    let unAvailable = [];
    let lines = [];
    let input = [];
    const seenIds = new Set(); // Use a single Set for all deduplication

    if (type === "Products") {
      payload.forEach((val) => {
        if (val.availableForSale) {
          // Available products go to input
          input.push(val);
        } else {
          // Unavailable products go to unAvailable
          unAvailable.push(val);
        }
      });
      setNoInventory(unAvailable);
    }

    setIsAddtoCart(true);

    if (type === "Collections") {
      input = payload.map((val) =>
        val.node
      );
    }
    console.log('dj', input, unAvailable)
    // return;
    for (let i = 0; i < input.length; i++) {
      if (type === 'Products') {
        console.log('vairant id getted via products', input[i])
        await delay(1000);
        const variantId = await handleGetVariant(input[i].id);
        console.log('vairant id getted', variantId)
        lines.push({
          quantity: 1,
          merchandiseId: variantId,
        })
      }
      else {

        for (let j = 0; j < input[i]?.products?.edges?.length; j++) {
          await delay(1000); // Add a 1-second delay between each API call

          if (input[i]?.products?.edges[j]?.node?.availableForSale) {
            const variantId = await handleGetVariant(input[i]?.products?.edges[j]?.node?.id);
            lines.push({
              quantity: 1,
              merchandiseId: variantId,
            });
          } else {
            if (!seenIds.has(input[i]?.products?.edges[j]?.node?.id)) {
              seenIds.add(input[i]?.products?.edges[j]?.node?.id);
              unAvailable.push(input[i]?.products?.edges[j]?.node);
            }
          }
        }
        setNoInventory(unAvailable);
      }
    }
    // console.log('user prod', lines, unAvailable);

    // return;
    await api
      .query(
        `mutation CreateCart($input: CartInput) {
  cartCreate(input: $input) {
    cart {
      checkoutUrl
      id
      createdAt
      updatedAt
      discountCodes{
        code
      }
      lines(first: 10) {
        edges {
          node {
            id
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
      buyerIdentity {
        email
        countryCode
        deliveryAddressPreferences {
        __typename
        }
        preferences {
          delivery {
            deliveryMethod
          }
        }
      }
      attributes {
        key
        value
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
        totalDutyAmount {
          amount
          currencyCode
        }
      }
    }
  }
}`,
        {
          variables: {
            input: {
              discountCodes: [`CC_${discountCode}`],
              lines,
              buyerIdentity: {
                email: "ahmed-ansari@mean3.com",
                countryCode: "CA",
                // customerAccessToken: session,
                deliveryAddressPreferences: {
                  oneTimeUse: false,
                  deliveryAddress: {
                    address1: "150 Elgin Street",
                    address2: "8th Floor",
                    city: "Ottawa",
                    province: "Ontario",
                    country: "CA",
                    zip: "K2P 1L4",
                  },
                },
                preferences: {
                  delivery: {
                    deliveryMethod: "PICK_UP",
                  },
                },
              },
              attributes: {
                key: "cart_attribute",
                value: "This is a cart attribute",
              },
            },
          },
        }
      )
      .then(({ data, errors }) => {
        if (errors) {
          console.log("failed to mutate add to cart", errors);
        } else {
          console.log("result to mutate add to cart", data);
          setCheckoutUrl(data?.cartCreate?.cart?.checkoutUrl);
          lines = [];
          unAvailable = [];
        }
      })
      .catch((error) => {
        console.log("error failed to mutate add to cart", error);
      });
    setIsAddtoCart(false);
    // api.ui.overlay.close("my-modal");
  };

  useEffect(() => {
    setLoading(true);
    api
      .query(
        `{
  shop{
    name
    primaryDomain{
      host
      url
    }
  }
}`,
        {
          variables: { first: 100 },
        }
      )
      .then(({ data, errors }) => {
        // setLoading(true);

        setShopData(data?.shop?.primaryDomain?.host);
        if (errors) {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);

        console.log("error fetching shop name", error);
      });

    api
      .query(
        `{
  collections(first: 200) {
    edges {
      node {
      image{
          url
        }
        id
        title
        products(first: 250) {
          edges {
            node {
              id
              title
              availableForSale
            }
          }
        }
      }
    }
  }
}`
      )
      .then(({ data, errors }) => {
        // setLoading(true);
        setAllCollections(data?.collections?.edges);
        if (errors) {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);

        console.log("error fetching shop name", error);
      });
  }, [api.query]);
  console.log("collections getted", allCollections);

  useEffect(() => {
    // fetchShowDetails();
    fetchData();
    if (shopData) {
      fetchDiscounts();
    }
  }, [shopData]);
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
          Array.from({ length: 12 }).map((_, index) => (
            <SkeletonImage key={index} inlineSize={200} blockSize={200} />
          ))
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
                        onPress={() => {
                          setNoInventory([])
                          setCheckoutUrl(null);
                          setIsAddtoCart(false);
                          handleGetDiscountDetails(discount.priceRuleDetails)
                        }

                        }
                        overlay={
                          <Modal
                            id="my-modal"
                            padding
                            title={`Discount Associated ${discount.priceRuleDetails.entitled_product_ids
                              .length > 0
                              ? "Products"
                              : "Collections"
                              }`}
                          >
                            {noInventory.length > 0 && <>
                              <Banner
                                status="warning"
                                title={`Those inventory is out of stock i.e ${noInventory.map(
                                  (item) => item.title
                                )}`}
                              />
                              <BlockSpacer />
                            </>}
                            {discount.priceRuleDetails.entitled_product_ids
                              .length > 0 && userDiscountProducts.length > 0 ? ( //add seperate collection ui after saving into sepereate state of api calls data.
                              userDiscountProducts.map((product) => (
                                <>
                                  <View
                                    padding="base"
                                    border="base"
                                    borderRadius="large"
                                    key={product?.title}
                                  >
                                    <InlineStack
                                      blockAlignment="center"
                                      spacing="tight"
                                    >
                                      <Image
                                        borderRadius="large"
                                        source={
                                          product?.featuredImage
                                            ? `${product?.featuredImage?.url}?width=50&height=50`
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
                                          {product?.title}
                                        </Text>
                                        <Text
                                          emphasis="bold"
                                          appearance="success"
                                        >
                                          $
                                          {product?.priceRange?.maxVariantPrice
                                            ?.amount || "0"}
                                        </Text>
                                      </BlockStack>
                                    </InlineStack>
                                  </View>
                                  <InlineSpacer spacing="loose" />
                                </>
                              ))
                            ) : userDiscountCollection.length > 0 ? (
                              userDiscountCollection.map((collection) => (
                                <>
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
                                          collection.node
                                            ? `${collection.node.image.url}?width=50&height=50`
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
                                          {collection?.node?.title}
                                        </Text>
                                        <Text
                                          emphasis="bold"
                                          appearance="subdued"
                                        >
                                          {
                                            collection?.node?.products?.edges
                                              ?.length
                                          }{" "}
                                          products
                                        </Text>
                                      </BlockStack>
                                    </InlineStack>
                                  </View>
                                  <BlockSpacer />
                                </>
                              ))
                            ) : discount.priceRuleDetails
                              ?.entitled_collection_ids?.length === 0 &&
                              discount.priceRuleDetails?.entitled_product_ids
                                ?.length === 0 &&
                              (discount.priceRuleDetails?.value_type ===
                                "fixed_amount" ||
                                discount.priceRuleDetails?.value_type ===
                                "percentage") ? (
                              <Text emphasis="bold" appearance="decorative">
                                Products added to the cart are discounted based
                                on designated amount off{" "}
                                {discount.priceRuleDetails?.value_type !==
                                  "percentage" && "$"}{" "}
                                {Math.abs(
                                  Math.round(
                                    parseFloat(
                                      discount.priceRuleDetails?.value ?? 0
                                    )
                                  )
                                )}
                                {discount.priceRuleDetails?.value_type !==
                                  "fixed_amount" && "%"}{" "}
                                an order
                              </Text>
                            ) : (
                              <Text emphasis="bold" appearance="warning">
                                No Products available
                              </Text>
                            )}
                            {(userDiscountCollection.length > 0 ||
                              userDiscountProducts.length > 0) && (
                                <>
                                  <BlockSpacer />
                                  <BlockStack
                                    inlineAlignment="end"
                                    alignment="end"
                                  >
                                    {
                                      checkoutUrl ? <Link
                                        to={`${checkoutUrl}`}
                                      >
                                        Go to checkout
                                      </Link> : <Button
                                        loading={isAddtoCart}
                                        kind="primary"
                                        onPress={() => {
                                          handlePostAddToCart(discount.priceRuleDetails.entitled_product_ids
                                            .length > 0
                                            ? userDiscountProducts : userDiscountCollection, discount.priceRuleDetails.entitled_product_ids
                                              .length > 0
                                            ? "Products"
                                            : "Collections", discount.code)
                                        }}
                                      >
                                        Create a cart
                                      </Button>
                                    }

                                  </BlockStack>
                                </>
                              )}
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
                              ? `${discount.priceRuleDetails
                                ?.entitled_product_ids?.length
                              } Product${discount.priceRuleDetails
                                ?.entitled_product_ids?.length !== 1
                                ? "s"
                                : ""
                              }`
                              : discount.priceRuleDetails
                                ?.entitled_collection_ids?.length > 0
                                ? ` ${discount.priceRuleDetails
                                  ?.entitled_collection_ids?.length
                                } Collection${discount.priceRuleDetails
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
          <View inlineAlignment="center">
            <BlockSpacer />
            <Icon alignment="center" size="large" source="warning" />
            <Text>No discounts available</Text>
            <BlockSpacer />
          </View>
        )}
      </Grid>
      {/* </Box> */}
      {/* Pagination bars */}
      {discountCodes.length > 0 && (
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
      )}
    </BlockStack>
  );
}
