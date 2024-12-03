import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Page,
  LegacyStack,
  Box,
  Modal,
  Form,
  FormLayout,
  TextField as PolarisTextField,
  Button,
  DataTable,
  Select,
  ChoiceList,
  Autocomplete,
  TextField,
  Icon,
  Tag,
  Toast,
  Badge,
  Card,
  Link,
  Text,
  HorizontalStack,
  SkeletonPage,
  Layout,
  LegacyCard,
  SkeletonBodyText,
  TextContainer,
  SkeletonDisplayText,
  AppProvider,
  Frame,
  VerticalStack,
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import {
  AlertMinor,
  ChevronLeftMinor,
  ChevronRightMinor,
  CircleAlertMajor,
  CircleCancelMajor,
  DiscountsMajor,
  ExitMajor,
  SearchMajor,
} from "@shopify/polaris-icons";

import axios from "axios";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import { useLocale, useNavigate } from "@shopify/app-bridge-react";
export function ProductsCard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiscountTitle, setNewDiscountTitle] = useState("");
  const [newDiscountAmount, setNewDiscountAmount] = useState("");
  const [newDiscountExpiry, setNewDiscountExpiry] = useState("");
  const [newDiscountCode, setNewDiscountCode] = useState("");
  const [newDiscountType, setNewDiscountType] = useState("");
  const [entitledProductIds, setEntitledProductIds] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [filterDiscounts, setfilterDiscounts] = useState([]);
  const [targetType, setTargetType] = useState("line_item");
  const [targetSelection, setTargetSelection] = useState("all");
  const [allocationMethod, setAllocationMethod] = useState("across");
  const [valueType, setValueType] = useState("fixed_amount");
  const [productIds, setProductIds] = useState([]);
  const [ProductOptions, setProductOptions] = useState([]);
  const [prodIds, setProdIds] = useState([]);
  const [value, setValue] = useState("");
  const [shippingDiscountValue, setShippingDiscountValue] = useState("");
  const [shippingError, setShippingError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [expiryError, setExpiryError] = useState(false);
  const [valueError, setValueError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [customerSelection, setCustomerSelection] = useState("all");
  const [customerSelectionError, setCustomerSelectionError] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [discountCodeType, setDiscountCodeType] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [
    prerequisiteToEntitlementQuantityRatio,
    setPrerequisiteToEntitlementQuantityRatio,
  ] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoad, setIsLoad] = useState(false);

  const [modalLoader, setModalLoader] = useState(false);
  const fetch = useAuthenticatedFetch();

  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = active ? (
    <Toast content="Discount deleted successfully" onDismiss={toggleActive} />
  ) : null;

  const targetTypeOptions = [
    { label: "Line Item", value: "line_item" },
    { label: "Shipping Line", value: "shipping_line" },
  ];

  const targetSelectionOptions = [
    { label: "All", value: "all" },
    { label: "Specific Products", value: "specific_products" },
  ];

  const allocationMethodOptions = [
    { label: "Across All Items", value: "across" },
    { label: "To Each Item", value: "each" },
  ];

  const valueTypeOptions = [
    { label: "Fixed Amount", value: "fixed_amount" },
    { label: "Percentage", value: "percentage" },
  ];
  // const deselectedOptions = useMemo(
  //   () => [
  //     { value: "rustic", label: "Rustic" },
  //     { value: "antique", label: "Antique" },
  //     { value: "vinyl", label: "Vinyl" },
  //     { value: "vintage", label: "Vintage" },
  //     { value: "refurbished", label: "Refurbished" },
  //   ],
  //   []
  // );
  const deselectedOptions = useMemo(
    () =>
      ProductOptions.map((product) => ({
        value: product.value,
        label: product.label,
      })),
    [ProductOptions]
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);
  const [page, setPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [optionsModal, setOptionsModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const columns = [
    "Discount Code",
    "Value Type",
    "Value",
    "Target Type",
    "Target Selection",

  ];

  const filteredDiscounts = discounts.filter((discount) =>
    discount?.title?.toLowerCase().includes(filterValue.toLowerCase())
  );


  const fetchDiscounts = async (isPaginate = null) => {
    try {
      setIsLoad(true);
      let apiUrl = "api/get-discounts?limit=50";
      if (isPaginate) {
        apiUrl += `&page=${isPaginate}`;
      } else {
        apiUrl = "api/get-discounts?limit=50";
      }

      const response = await fetch(apiUrl, {
        method: "GET",
      })
        .then((data) => {
          return data.json();
        })
        .catch((error) => {
          // setIsLoading(false);
          console.log("Fetched collections There was an error:", error);
          return error;
        });

      setDiscounts(response.data);
      setfilterDiscounts(response.data);
      setPrevPage(response?.page?.pgInfo?.prevPage?.query.page_info);
      setNextPage(response?.page?.pgInfo?.nextPage?.query.page_info);
      setIsLoad(false);
    } catch (error) {
      setIsLoad(false);
      console.error("Error fetching discounts:", error);
    }
  };
  useEffect(() => {
    fetchDiscounts();
    handleFetchPopulate();
  }, []);
  useEffect(() => {
    fetchDiscounts();
  }, [toastVisible]);


  const handleOptionsModal = (id) => {
    setOptionsModal(true);
    setSelectedDiscountId(id);
  };
  const rows = filterDiscounts.map((discount) => [
    <Link
      monochrome
      removeUnderline
      // url="https://www.example.com"
      // key="emerald-silk-gown"
      onClick={() => handleOptionsModal(discount.priceRuleDetails?.id)}
    >
      {discount.code}
    </Link>,
    discount.priceRuleDetails?.value_type === "fixed_amount"
      ? "Fixed Amount"
      : "Percentage",
    Math.abs(Number(discount.priceRuleDetails?.value)),
    discount.priceRuleDetails?.target_type === "shipping_line"
      ? "Shipping Line"
      : "Line Item",
    discount.priceRuleDetails?.target_selection === "all" ? "All" : "Entitled",
  ]);

  const triggerPaginate = () => {

    if (nextPage === null) {
      fetchDiscounts(null);
    } else {
      fetchDiscounts(nextPage);
    }
  };
  const triggerPaginateBack = () => {

    if (prevPage === null) {
      fetchDiscounts(null);
    } else {
      fetchDiscounts(prevPage);
    }
  };

  useEffect(() => {
    if (state?.status === true) {
      setToastVisible(true);
      fetchDiscounts();
    }
  }, [state?.status]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setToastVisible(false);
    }, 4000);

    // Cleanup the timeout if the component unmounts before the timeout completes
    return () => clearTimeout(timer);
  }, [toastVisible]);



  //original fetcher products
  const handleFetchPopulate = async () => {
    setIsLoading(true);

    await fetch("api/products/all", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Assuming the response is in JSON format
      })
      .then((data) => {
        // You can now use the 'data' variable to access your fetched products
        // Mapping the products data to the desired format
        const formattedProducts = data.data.map((product) => ({
          label: product.title,
          value: product.id,
        }));
        // const deselectedOptions = useMemo(() => formattedProducts, []);
        setProductOptions(formattedProducts);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("There was an error fetching the products:", error);
      });
  };

  const handleDeleteDiscount = async () => {
    if (confirmDelete) {
      try {
        setDeleteLoader(true);
        await fetch(`api/delete-discount?id=${selectedDiscountId}`, {
          method: "DELETE",
        })
          .then((data) => {
            setOptionsModal(false);
            setConfirmDelete(false);
            setDeleteLoader(false);
            fetchDiscounts();
            toggleActive();
          })
          .catch((error) => {
            setDeleteLoader(false);
            setOptionsModal(false);
            setConfirmDelete(false);
            console.log("Fetched collections There was an error:", error);
          });
      } catch (error) { }
    } else {
      setOptionsModal(false);
      setConfirmDelete(false);
    }
  };




  const handleFilterDiscount = (value) => {
    setFilterValue(value);

    if (value === "") {
      // If input is cleared, reset the filtered discounts to the full list
      setfilterDiscounts(discounts);
    } else {
      // Filter the full list of discounts based on the current input value
      const filtered = discounts.filter((discount) =>
        discount.code.toLowerCase().includes(value.toLowerCase())
      );
      setfilterDiscounts(filtered);
    }
  };

  return (
    <Page title="" fullWidth>
      <AppProvider>
        <Frame topBar={false} navigation={false}>
          {isLoad ? (
            <SkeletonPage primaryAction>
              <Layout>
                <Layout.Section>
                  <LegacyCard sectioned>
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                    <SkeletonBodyText />
                  </LegacyCard>
                </Layout.Section>
              </Layout>
            </SkeletonPage>
          ) : (
            <>
              <LegacyStack vertical spacing="loose">
                <Text alignment="start" variant="heading3xl" as="h2">
                  All Discounts
                </Text>
                <LegacyStack vertical spacing="loose">
                  {toastVisible && (
                    <LegacyStack spacing="loose">
                      <Badge status="success" size="medium">
                        Discount Successfully Created
                      </Badge>
                    </LegacyStack>
                  )}

                  <LegacyStack alignment="trailing" distribution="equalSpacing">
                    <PolarisTextField
                      label="Filter discounts"
                      value={filterValue}
                      onChange={handleFilterDiscount}
                      placeholder="Search by title"
                      autoComplete="off"
                    />
                    <Button
                      // onClick={() => navigate("/AddDiscount")}
                      onClick={() => setIsModalOpen(true)}
                    >
                      Create Discount
                    </Button>
                  </LegacyStack>
                </LegacyStack>

                {filteredDiscounts.length === 0 && discounts.length === 0 ? (
                  <>
                    <div style={{ marginTop: 80 }} />
                    <VerticalStack
                      gap={"10"}
                      align="center"
                      inlineAlign="center"
                    >
                      <div
                        style={{
                          transform: "scale(3)",
                          display: "inline-flex",
                        }}
                      >
                        <Icon source={CircleAlertMajor} />
                      </div>
                      <Text alignment="center" variant="headingMd" as="h6">
                        Manage discounts and promotions
                        <Text variant="headingXs" as="h6">
                          Add discount codes that apply at checkout.
                        </Text>
                        <Text variant="headingXs" as="h6">
                          You can also use discounts with <a href="https://help.shopify.com/en/manual/products/details/product-pricing/sale-pricing" target="_blank" rel="see more details about sales">Compare at prices.</a>


                        </Text>
                        <button
                          // loading={modalLoader}
                          onClick={() =>
                            navigate("/AddDiscount")
                          }
                          primary
                          style={{
                            marginTop: "10px",
                            backgroundColor: "black",
                            color: "white",
                            borderRadius: "8px", // Adjust the radius as needed
                            height: "26px", // Adjust the height as needed
                            padding: "0 14px", // Adjust padding as needed
                            fontWeight: "bold", // Optional, for text styling
                            fontSize: "12px",
                            cursor: "default", // Default cursor
                          }}
                        >
                          + Add Discount
                        </button>
                      </Text>

                    </VerticalStack>
                  </>
                ) : (
                  <LegacyStack distribution="fill">
                    <Box width="100%" id="discount-section">
                      <Box padding="0" width="100%">
                        <div style={{ overflowX: "auto" }}>
                          <DataTable
                            columnContentTypes={[
                              "text",
                              "text",
                              "text",
                              "text",
                              "text",
                              "text",
                              "text",
                            ]}
                            headings={columns}
                            rows={rows}
                            verticalAlign="middle"
                          />
                        </div>
                      </Box>
                    </Box>
                  </LegacyStack>
                )}
              </LegacyStack>
              <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select discount type"
                secondaryActions={[
                  {
                    content: "Cancel",
                    onAction: () => setIsModalOpen(false),
                  },
                ]}
              >
                {/* <Modal.Section> */}
                {[
                  {
                    id: 1,
                    name: "Amount off products",
                    description:
                      "Discount specific products or collections of products.",
                    tagValue: "Product discount",
                    nav: "AddDiscount",
                  },
                  {
                    id: 2,
                    name: "Buy X get Y",
                    description:
                      "Discount products based on customer's purchase.",
                    tagValue: "Product discount",
                    nav: "AddDiscountBuyXGetYFree",
                  },
                  {
                    id: 3,
                    name: "Amount off order",
                    description: "Discount the total order amount.",
                    tagValue: "Order discount",
                    nav: "AddDiscountOrder",
                  },
                  {
                    id: 4,
                    name: "Free shipping",
                    description: "Offer free shipping on an order.",
                    tagValue: "Shipping discount",
                    nav: "AddDiscountShipping",
                  },
                ].map((discount) => (
                  // main card
                  <button
                    onMouseEnter={(e) => {
                      // e.currentTarget.style.backgroundColor = "rgba(74, 74, 74, 0.2)"; // Change background on hover
                      e.currentTarget.style.cursor = "pointer"; // Change cursor to pointer on hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"; // Reset background on mouse leave
                      e.currentTarget.style.cursor = "default"; // Reset cursor on mouse leave
                    }}
                    onClick={() => navigate(`/${discount.nav}`)}
                    style={{
                      backgroundColor: "transparent",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 10,
                      marginBottom: 10,
                      borderTop: 0,
                      borderLeft: 0,
                      borderRight: 0,
                      borderBottom: discount.id === 4 ? 0 : "1px solid #676F7A", // Add borderBottom
                      // marginRight: "-20px", // Extends the border to the left
                      // marginRight: -39, // Extends the border to the right
                      // paddingLeft: "20px", // Optional: Adds padding so content stays aligned
                      // paddingRight: "-80px",
                      paddingBottom: 12,
                      padding: 10,
                      flexWrap: "wrap",
                      overflow: "hidden", // Hides the scrollbar
                      gap: "5px",
                    }}
                    key={discount.id}
                  >
                    <div>
                      {/* Adjust width here */}
                      <Text alignment="start" variant="headingSm" as="h6">
                        {discount.name}
                      </Text>
                      <div style={{ marginTop: 5 }}>
                        <Text color="subdued" variant="headingXs" as="h6">
                          {discount.description}
                        </Text>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Badge>{discount.tagValue}</Badge>
                      <Icon color="subdued" source={ChevronRightMinor} />
                    </div>
                  </button>
                ))}
                {/* </Modal.Section> */}
              </Modal>
              <Modal
                open={optionsModal}
                onClose={() => {
                  setOptionsModal(false);
                  setConfirmDelete(false);
                }}
                title={
                  confirmDelete ? "Cofirm Delete" : "Select Discount Option"
                }

                secondaryActions={[
                  {
                    content: confirmDelete ? "Confirm" : "Cancel",
                    onAction: () => handleDeleteDiscount(),
                    loading: deleteLoader,
                  },
                ]}
              >
                {confirmDelete ? (
                  <div style={{ marginLeft: 20 }}>
                    {/* Adjust width here */}
                    <Text alignment="start" variant="headingSm" as="h3">
                      Are you sure, you're willing to delete this discount?
                    </Text>
                  </div>
                ) : (
                  <>
                    {" "}
                    {[
                      {
                        id: 1,
                        name: "Edit Discount",
                        description:
                          "Change discount details such as name, description, and discount type.",
                        tagValue: "Change Discount",
                        nav: "AddDiscount",
                      },
                      {
                        id: 2,
                        name: "Delete Discount",
                        description:
                          "This will permenantly delete the discount.do it with caution.",
                        tagValue: "Remove Discount",
                        change: true,
                      },
                    ].map((discount) => (
                      // main card
                      <button
                        onMouseEnter={(e) => {
                          // e.currentTarget.style.backgroundColor = "rgba(74, 74, 74, 0.2)"; // Change background on hover
                          e.currentTarget.style.cursor = "pointer"; // Change cursor to pointer on hover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"; // Reset background on mouse leave
                          e.currentTarget.style.cursor = "default"; // Reset cursor on mouse leave
                        }}
                        onClick={() =>
                          discount.change === true
                            ? setConfirmDelete(true)
                            : navigate(`/${discount.nav}`, { state: { id: selectedDiscountId } })
                        }
                        style={{
                          backgroundColor: "transparent",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 10,
                          marginBottom: 10,
                          borderTop: 0,
                          borderLeft: 0,
                          borderRight: 0,
                          borderBottom:
                            discount.id === 4 ? 0 : "1px solid #676F7A", // Add borderBottom
                          // marginRight: "-20px", // Extends the border to the left
                          // marginRight: -39, // Extends the border to the right
                          // paddingLeft: "20px", // Optional: Adds padding so content stays aligned
                          // paddingRight: "-80px",
                          paddingBottom: 12,
                          padding: 10,
                          flexWrap: "wrap",
                          overflow: "hidden", // Hides the scrollbar
                          gap: "5px",
                        }}
                        key={discount.id}
                      >
                        <div>
                          {/* Adjust width here */}
                          <Text alignment="start" variant="headingSm" as="h6">
                            {discount.name}
                          </Text>
                          <div style={{ marginTop: 5 }}>
                            <Text color="subdued" variant="headingXs" as="h6">
                              {discount.description}
                            </Text>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Badge>{discount.tagValue}</Badge>
                          <Icon color="subdued" source={ChevronRightMinor} />
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </Modal>
              {filteredDiscounts.length === 48 || discounts.length === 48 && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    justifyContent: "center",
                  }}
                >
                  <div>
                    <button
                      onClick={triggerPaginateBack}
                      kind="tertiary"
                      appearance="accent"
                    // style={{
                    //   backgroundColor: Style.default("transparent").when(
                    //     { hover: true },
                    //     "gray"
                    //   ),
                    // }}
                    >
                      <Icon source={ChevronLeftMinor} />
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={triggerPaginate}
                    // kind={Style.default("tertiary").when({ hover: true }, "primary")}
                    // kind={Style.default("tertiary").when({ hover: true }, "primary")}
                    // appearance={Style.default("accent").when(
                    //   { hover: true },
                    //   "critical"
                    // )}
                    >
                      <Icon source={ChevronRightMinor} />
                    </button>
                  </div>
                </div>
              )}

              <div style={{ margin: "20px" }}>
                {/* <Button onClick={toggleActive}>Show Toast</Button> */}
                {toastMarkup}
              </div>
            </>
          )}
        </Frame>
      </AppProvider>
    </Page>
  );
}
