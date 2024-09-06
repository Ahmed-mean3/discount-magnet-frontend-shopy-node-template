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
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { SearchMajor } from "@shopify/polaris-icons";

import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import { useLocale, useNavigate } from "@shopify/app-bridge-react";
export function ProductsCard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log("payload from another page", state?.status);
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiscountTitle, setNewDiscountTitle] = useState("");
  const [newDiscountAmount, setNewDiscountAmount] = useState("");
  const [newDiscountExpiry, setNewDiscountExpiry] = useState("");
  const [newDiscountCode, setNewDiscountCode] = useState("");
  const [newDiscountType, setNewDiscountType] = useState("");
  const [entitledProductIds, setEntitledProductIds] = useState([]);
  const [discounts, setDiscounts] = useState([]);
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
  const [modalLoader, setModalLoader] = useState(false);
  const fetch = useAuthenticatedFetch();

  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = (message) =>
    active ? <Toast content={`${message}`} onDismiss={toggleActive} /> : null;

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
  console.log(deselectedOptions, "000000000000000000000000");
  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.includes(value)
      );
      setOptions(resultOptions);
    },
    [deselectedOptions]
  );
  console.log("selection side", prodIds);

  const updateSelection = useCallback(
    (selected) => {
      setSelectedOptions(selected);

      const selectedValue = selected.map((selectedItem) => {
        // Find the option that matches the selected item's value
        const matchedOption = options.find(
          (option) => option.value === selectedItem
        );

        // Return the label if a match is found
        return matchedOption ? matchedOption.label : null;
      });
      // const { val } = selected;
      console.log("check.", selected[0]);

      // setProdIds((prev) => [...prev, selected[0]]);
      setProdIds((prev) => {
        // Use a Set to keep unique values
        const updatedSet = new Set(prev);

        // Add all selected items to the Set
        selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array
        return Array.from(updatedSet);
      });
      console.log("options", options);
      // const selectedValue = selected.map((selectedItem) => {
      //   const matchedOption = options.filter((option) => {
      //     return option.includes(selectedItem);
      //   });
      //   return matchedOption && matchedOption.label;
      // });
      // Map through selected items to find the matching label from options
      // const selectedValue = selected.map((selectedItem) => {
      //   // Find the option that matches the selected item's value
      //   const matchedOption = options.find(
      //     (option) => option.value === selectedItem
      //   );

      //   // Return the label if a match is found
      //   return matchedOption ? matchedOption.label : null;
      // });

      // console.log("resultant", selectedValue);
      // setSelectedOptions((prev) => [...prev, selectedValue]);
      // setInputValue(selectedValue[0] || "");
    },
    [options]
  );
  const discountTypeOptions = [
    { label: "Amount off products", value: "amount_off_products" },
    { label: "Free shipping", value: "free_shipping" },
  ];

  const customerSelectionOptions = [
    { label: "All", value: "all" },
    { label: "Specific Customers", value: "specific_customers" },
  ];

  // useEffect(() => {
  //   const savedDiscounts = JSON.parse(localStorage.getItem("discounts")) || [];
  //   setDiscounts(savedDiscounts);
  // }, []);

  console.log("data", discounts);
  const filteredDiscounts = discounts.filter((discount) =>
    discount?.title?.toLowerCase().includes(filterValue.toLowerCase())
  );

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
  const fetchDiscounts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/get-discounts", {
        headers: {
          "api-key": "Do2j^jF",
          "shop-name": "store-for-customer-account-test",
          "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
          "shopify-api-token": "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",
        },
      });

      console.log("data success", response);

      // return;

      // const discountDetails = await Promise.all(
      //   response?.data?.data.map(async (discount) => {
      //     const priceRule = await fetchPriceRule(discount.price_rule_id);
      //     return {
      //       code: discount.code,
      //       priceRuleDetails: priceRule,
      //     };
      //   })
      // );

      // const details = response?.data?.data.map(async (discount) => {
      //   const priceRule = await fetchPriceRule(discount.price_rule_id);
      //   return {
      //     code: discount.code,
      //     priceRuleDetails: priceRule,
      //   };
      // })

      console.log("data main->>>>>>", response.data.data);
      //  return;
      setDiscounts(response.data.data);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // const handlePriceRulePopulate = async () => {
  //   // setIsLoading(true);
  //   console.log("chaling");
  //   await fetch("api/priceRules/all", { method: "GET" })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       return response.json(); // Assuming the response is in JSON format
  //     })
  //     .then((data) => {
  //       // console.log(data.data); // This will log the fetched products
  //       // You can now use the 'data' variable to access your fetched products
  //       // Mapping the products data to the desired format
  //       // const formattedProducts = data.data.map((product) => ({
  //       //   label: product.title,
  //       //   value: product.id,
  //       // }));
  //       console.log("Fetched price rules:", data); // Debugging line
  //       // const deselectedOptions = useMemo(() => formattedProducts, []);
  //       // console.log(formattedProducts);
  //       // setProductOptions(formattedProducts);
  //       // setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       // setIsLoading(false);
  //       console.error("There was an error fetching the products:", error);
  //     });

  //   // if (response.ok) {
  //   //   console.log("fetched products......", response.json());
  //   //   // await refetchProductCount();
  //   //   // setToastProps({
  //   //   //   content: t("ProductsCard.productsCreatedToast", {
  //   //   //     count: productsCount,
  //   //   //   }),
  //   //   // });
  //   // } else {
  //   //   console.log("fetched products......", response);

  //   //   setIsLoading(false);
  //   //   // setToastProps({
  //   //   //   content: t("ProductsCard.errorCreatingProductsToast"),
  //   //   //   error: true,
  //   //   // });
  //   // }
  // };
  // useEffect(() => {
  //   handlePriceRulePopulate;
  // }, []);
  useEffect(() => {
    fetchDiscounts();
    handleFetchPopulate();
  }, []);
  useEffect(() => {
    fetchDiscounts();
  }, [toastVisible]);
  const columns = [
    "Discount Code",
    "Value Type",
    "Value",
    "Target Type",
    "Target Selection",
    // "Allocation Method",
    // "Customer Selection",
    // "Entitled Product IDs",
    // "Start Date",
    // "End Date",
    // "Discount Code",
    // "Discount Type",
  ];

  const rows = discounts.map((discount) => [
    discount.code,
    discount.priceRuleDetails?.value_type,
    discount.priceRuleDetails?.value,
    discount.priceRuleDetails?.target_type,
    discount.priceRuleDetails?.target_selection,
    // discount.priceRuleDetails?.allocation_method,
    // discount.priceRuleDetails?.customer_selection,
    // discount.priceRuleDetails.entitled_product_ids,
    // discount.priceRuleDetails?.starts_at,
    // discount.priceRuleDetails?.end_at,
    // discount.discount_code,
    // discount.discount_type,
  ]);
  const handleChange = (event) => {
    const inputValue = event;
    // Convert the value to a negative number
    const negValue = -Math.abs(Number(inputValue));
    setValue(negValue);
  };
  const handleCreateDiscount = async () => {
    try {
      setModalLoader(true);
      let isValid = true;

      // if (!newDiscountTitle.startsWith("ccc") || !newDiscountTitle) {
      //   setTitleError(true);
      //   isValid = false;
      // } else {
      //   setTitleError(false);
      // }

      if (productIds.length === 0) {
        isValid = false;
        console.log("chec king......");
      }
      if (!newDiscountAmount) {
        setAmountError(true);
        setModalLoader(false);

        isValid = false;
      } else {
        setAmountError(false);
        setModalLoader(false);
      }

      if (!newDiscountExpiry) {
        setExpiryError(true);
        // setModalLoader(false);

        isValid = false;
      } else {
        setExpiryError(false);
        // setModalLoader(false);
      }

      if (!newDiscountCode) {
        setCodeError(true);
        setModalLoader(false);

        const newLocal = (isValid = false);
      } else {
        setCodeError(false);
        setModalLoader(false);
      }

      // if (!newDiscountType) {
      //   setTypeError(true);
      //   isValid = false;
      // } else {
      //   setTypeError(false);
      // }

      if (targetType === "shipping_line" && valueType !== "percentage") {
        setValueError(true);
        isValid = false;
        setModalLoader(false);
      } else if (
        valueType === "percentage" &&
        (!value || value > 0 || value < -100)
      ) {
        setValueError(true);
        isValid = false;
      } else if (valueType === "fixed_amount" && (!value || value >= 0)) {
        setValueError(true);
        setModalLoader(false);

        isValid = false;
      } else {
        setValueError(false);
        setModalLoader(false);
      }

      // if (
      //   customerSelection === "specific_customers" &&
      //   !entitledProductIds.length
      // ) {
      //   setCustomerSelectionError(true);
      //   isValid = false;
      // } else {
      //   setCustomerSelectionError(false);
      // }
      console.log("dynamic->>>>>>", targetSelection);
      if (true) {
        console.log("dynamic->>>>>>", productIds);

        // return;
        const newDiscount = {
          price_rule: {
            title: newDiscountCode,
            target_type: "line_item",
            target_selection: "entitled",
            allocation_method: "across",
            value_type: valueType,
            value: value,
            customer_selection: customerSelection,
            entitled_product_ids: prodIds,
            starts_at: startsAt,
            // end_at: endAt,
          },
          discount_code: newDiscountCode,
          discount_type: "product",
        };

        //   const newDiscount = {
        //     "price_rule": {
        //         title:newDiscountTitle,
        //         target_type: targetType,
        //         target_selection:targetSelection,
        //         allocation_method: "across", //3
        //         value_type: valueType,
        //         value,
        //         customer_selection: "all", //2
        //         entitled_product_ids: [  //1
        //           9184246858001
        //         ],
        //         starts_at:startsAt

        //         // end_at:"2024-08-30:00:00:00Z"
        //     },
        //     discount_code: "WINTER_SALE_15%_OFF_244",
        //     discount_type: "product"
        // }

        console.log("dynamic->>>>>>", targetSelection);

        //  return;
        //  console.log('hardcode->>>>>>',_newDiscount)
        const response = await axios.post(
          "https://middleware-discountapp.mean3.ae/add-discount-code",
          newDiscount,
          {
            headers: {
              "api-key": "Do2j^jF",
              "shop-name": "store-for-customer-account-test",
              "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
              "shopify-api-token": "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",
              "Content-Type": "application/json",
            },
          }
        );
        console.log("response", response);
        // return;
        // const updatedDiscounts = [...discounts, newDiscount];
        // setDiscounts(updatedDiscounts);

        // localStorage.setItem("discounts", JSON.stringify(updatedDiscounts));

        setNewDiscountTitle("");
        setNewDiscountAmount("");
        setNewDiscountExpiry("");
        setNewDiscountCode("");
        setNewDiscountType("");
        setEntitledProductIds([]);
        setTargetType("line_item");
        setTargetSelection("all");
        setAllocationMethod("across");
        setValueType("fixed_amount");
        setValue("");
        setShippingDiscountValue("");
        setCustomerSelection("all");
        setStartsAt("");
        setEndAt("");
        setDiscountCodeType("");
        setPrerequisiteToEntitlementQuantityRatio([]);
        setShippingError(false);
        setTitleError(false);
        setAmountError(false);
        setExpiryError(false);
        setCodeError(false);
        setTypeError(false);
        setValueError(false);
        setCustomerSelectionError(false);
        setModalLoader(false);
        setIsModalOpen(false);
        setProdIds([]);
        // toggleActive();
        // toastMarkup("Discount Added Successfull");
        setModalLoader(false);

        setToastVisible(true);
        fetchDiscounts();

        document.getElementById("discount-section").scrollIntoView();
      }
    } catch (error) {
      // setModalLoader(false);
      // <Toast
      //   content={`${error.response.data.message}`}
      //   onDismiss={toggleActive}
      // />;
      setModalLoader(false);

      console.log("error", error.response.data.message);
    }
  };

  useEffect(() => {
    if (state?.status === true) {
      console.log("comes in....");
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

  const filteredValueTypeOptions =
    targetType === "shipping_line"
      ? [{ label: "Percentage", value: "percentage" }]
      : valueTypeOptions;

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
        // console.log(data.data); // This will log the fetched products
        // You can now use the 'data' variable to access your fetched products
        // Mapping the products data to the desired format
        const formattedProducts = data.data.map((product) => ({
          label: product.title,
          value: product.id,
        }));
        console.log("Fetched price rules:", data); // Debugging line
        // const deselectedOptions = useMemo(() => formattedProducts, []);
        // console.log(formattedProducts);
        setProductOptions(formattedProducts);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("There was an error fetching the products:", error);
      });

    // if (response.ok) {
    //   console.log("fetched products......", response.json());
    //   // await refetchProductCount();
    //   // setToastProps({
    //   //   content: t("ProductsCard.productsCreatedToast", {
    //   //     count: productsCount,
    //   //   }),
    //   // });
    // } else {
    //   console.log("fetched products......", response);

    //   setIsLoading(false);
    //   // setToastProps({
    //   //   content: t("ProductsCard.errorCreatingProductsToast"),
    //   //   error: true,
    //   // });
    // }
  };

  //fetch price rules from backend
  // const handleFetchPopulate = async () => {
  //   // setIsLoading(true);

  //   await fetch("api/priceRules/all", { method: "GET" })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       return response.json(); // Assuming the response is in JSON format
  //     })
  //     .then((data) => {
  //       // console.log(data.data); // This will log the fetched products
  //       // You can now use the 'data' variable to access your fetched products
  //       // Mapping the products data to the desired format
  //       // const formattedProducts = data.data.map((product) => ({
  //       //   label: product.title,
  //       //   value: product.id,
  //       // }));
  //       console.log("Fetched price rules:", data); // Debugging line
  //       // const deselectedOptions = useMemo(() => formattedProducts, []);
  //       // console.log(formattedProducts);
  //       // setProductOptions(formattedProducts);
  //       // setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       // setIsLoading(false);
  //       console.error("There was an error fetching the products:", error);
  //     });

  //   // if (response.ok) {
  //   //   console.log("fetched products......", response.json());
  //   //   // await refetchProductCount();
  //   //   // setToastProps({
  //   //   //   content: t("ProductsCard.productsCreatedToast", {
  //   //   //     count: productsCount,
  //   //   //   }),
  //   //   // });
  //   // } else {
  //   //   console.log("fetched products......", response);

  //   //   setIsLoading(false);
  //   //   // setToastProps({
  //   //   //   content: t("ProductsCard.errorCreatingProductsToast"),
  //   //   //   error: true,
  //   //   // });
  //   // }
  // };

  console.log("selected ids", productIds);
  function titleCase(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join("");
  }
  const removeTag = useCallback(
    (tag) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
    },
    [selectedOptions]
  );
  const verticalContentMarkup =
    selectedOptions.length > 0 ? (
      <LegacyStack spacing="extraTight" alignment="center">
        {selectedOptions.map((option) => {
          let tagLabel = "";
          // tagLabel = option.replace("_", " ");
          // tagLabel = titleCase(tagLabel);
          return (
            <Tag key={`option${option}`} onRemove={removeTag(option)}>
              {option}
            </Tag>
          );
        })}
      </LegacyStack>
    ) : null;
  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label="Search and select products"
      value={inputValue}
      prefix={<Icon source={SearchMajor} tone="base" />}
      // placeholder="Vintage, cotton, summer"
      // verticalContent={verticalContentMarkup}
      // placeholder="Autmn,Skat Board"
      autoComplete="off"
    />
  );

  return (
    <Page title="" fullWidth>
      {/* <Box paddingBlockStart="400" width="586px" background="bg-fill-info">
        <Badge status="success" size="medium">
          Active
        </Badge>
      </Box> */}

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
              onChange={(value) => setFilterValue(value)}
              placeholder="Search by title"
              autoComplete="off"
            />
            <Button onClick={() => navigate("/AddDiscount")}>
              Create Discount
            </Button>
          </LegacyStack>
        </LegacyStack>
        <LegacyStack distribution="fill">
          <Box paddingBlock="0" width="100%" id="discount-section">
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
      </LegacyStack>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Discount"
        primaryAction={{
          content: modalLoader ? "loading" : "Create",
          onAction: handleCreateDiscount,
          loading: modalLoader,
        }}
      >
        <Modal.Section>
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormLayout>
              {/* <PolarisTextField
                label="title"
                value={newDiscountTitle}
                onChange={(value) => setNewDiscountTitle(value)}
                error={titleError ? "Title should start with 'ccc'." : ""}
              /> */}
              <PolarisTextField
                label="Discount Code"
                value={newDiscountCode}
                onChange={(value) => setNewDiscountCode(value)}
                error={codeError ? "Discount code is required." : ""}
              />
              {/* <Select
                label="target_type"
                options={targetTypeOptions}
                value={targetType}
                onChange={(value) => setTargetType(value)}
              /> */}
              <Select
                label="Discount Type"
                options={filteredValueTypeOptions}
                value={valueType}
                onChange={(value) => setValueType(value)}
              />
              {/* <PolarisTextField
                label="Discount Value"
                type="number"
                value={value}
                onChange={(value) => setValue(value)}
                error={valueError ? "Invalid value" : ""}
              /> */}
              <PolarisTextField
                label="Discount Value "
                type="number"
                value={value}
                onChange={handleChange}
                error={valueError ? "Invalid Value" : ""}
              />
              <Autocomplete
                allowMultiple
                options={options}
                selected={selectedOptions}
                onSelect={updateSelection}
                textField={textField}
              />
              <PolarisTextField
                label="Start Date"
                type="date"
                value={startsAt}
                onChange={(value) => setStartsAt(value)}
              />
              <PolarisTextField
                label="End Date"
                type="date"
                value={endAt}
                onChange={(value) => setEndAt(value)}
              />
              {/* <Select
                label="target_selection"
                options={targetSelectionOptions}
                value={targetSelection}
                onChange={(value) => setTargetSelection(value)}
              />
              <Select
                label="allocation_method"
                options={allocationMethodOptions}
                value={allocationMethod}
                onChange={(value) => setAllocationMethod(value)}
              /> */}

              {/* {targetType === "shipping_line" && (
                <PolarisTextField
                  label="Shipping Discount Value"
                  type="number"
                  value={shippingDiscountValue}
                  onChange={(value) => setShippingDiscountValue(value)}
                  error={
                    shippingError ? "Shipping discount value is required." : ""
                  }
                />
              )}
              <Select
                label="customer_selection"
                options={customerSelectionOptions}
                value={customerSelection}
                onChange={(value) => setCustomerSelection(value)}
              /> */}

              {/* <ChoiceList
                label="Select Products"
                choices={ProductOptions}
                selected={productIds}
                onChange={(value) => setProductIds(value)}
                allowMultiple
              /> */}
              {/* <Autocomplete
                allowMultiple
                options={ProductOptions} // Ensure this is correctly populated
                selected={productIds}
                onSelect={(value) => setProductIds(value)}
                textField={
                  <TextField
                    label="Select Products"
                    value={inputValue}
                    onChange={updateText}
                    placeholder="Search products"
                  />
                }
              /> */}

              {/* <Select
                label="discount_type"
                options={discountTypeOptions}
                value={newDiscountType}
                onChange={(value) => setNewDiscountType(value)}
                error={typeError ? "Discount type is required." : ""}
              /> */}
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
