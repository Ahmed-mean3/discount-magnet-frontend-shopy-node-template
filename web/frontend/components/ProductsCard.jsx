import React, { useState, useEffect } from "react";
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
} from "@shopify/polaris";
import axios from "axios";
export function ProductsCard() {
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
  const [
    prerequisiteToEntitlementQuantityRatio,
    setPrerequisiteToEntitlementQuantityRatio,
  ] = useState([]);

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
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get(
          "https://middleware-discountapp.mean3.ae/get-discounts",
          {
            headers: {
              "api-key": "Do2j^jF",
              "shop-name": "store-for-customer-account-test",
              "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
              "shopify-api-token": "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",
            },
          }
        );

        console.log("data success", response);
        // return;

        const discountDetails = await Promise.all(
          response?.data?.data.map(async (discount) => {
            const priceRule = await fetchPriceRule(discount.price_rule_id);
            return {
              code: discount.code,
              priceRuleDetails: priceRule,
            };
          })
        );

        // const details = response?.data?.data.map(async (discount) => {
        //   const priceRule = await fetchPriceRule(discount.price_rule_id);
        //   return {
        //     code: discount.code,
        //     priceRuleDetails: priceRule,
        //   };
        // })

        console.log("data main->>>>>>", discountDetails);
        //  return;
        setDiscounts(discountDetails);
      } catch (error) {
        console.error("Error fetching discounts:", error);
      }
    };

    fetchDiscounts();
  }, []);

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

  const handleCreateDiscount = async () => {
    try {
      let isValid = true;

      if (!newDiscountTitle.startsWith("ccc") || !newDiscountTitle) {
        setTitleError(true);
        isValid = false;
      } else {
        setTitleError(false);
      }

      if (!newDiscountAmount) {
        setAmountError(true);
        isValid = false;
      } else {
        setAmountError(false);
      }

      if (!newDiscountExpiry) {
        setExpiryError(true);
        isValid = false;
      } else {
        setExpiryError(false);
      }

      if (!newDiscountCode) {
        setCodeError(true);
        isValid = false;
      } else {
        setCodeError(false);
      }

      if (!newDiscountType) {
        setTypeError(true);
        isValid = false;
      } else {
        setTypeError(false);
      }

      if (targetType === "shipping_line" && valueType !== "percentage") {
        setValueError(true);
        isValid = false;
      } else if (
        valueType === "percentage" &&
        (!value || value <= 0 || value > 100)
      ) {
        setValueError(true);
        isValid = false;
      } else if (valueType === "fixed_amount" && (!value || value <= 0)) {
        setValueError(true);
        isValid = false;
      } else {
        setValueError(false);
      }

      if (
        customerSelection === "specific_customers" &&
        !entitledProductIds.length
      ) {
        setCustomerSelectionError(true);
        isValid = false;
      } else {
        setCustomerSelectionError(false);
      }
      console.log("dynamic->>>>>>", targetSelection);
      if (true) {
        const newDiscount = {
          price_rule: {
            title: newDiscountTitle,
            target_type: targetType,
            target_selection: "entitled",
            allocation_method: allocationMethod,
            value_type: valueType,
            value,
            customer_selection: customerSelection,
            entitled_product_ids: [7933380296844],
            starts_at: startsAt,
            end_at: endAt,
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
        return;
        const updatedDiscounts = [...discounts, newDiscount];
        setDiscounts(updatedDiscounts);

        localStorage.setItem("discounts", JSON.stringify(updatedDiscounts));

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
        setIsModalOpen(false);
        document.getElementById("discount-section").scrollIntoView();
      }
    } catch (error) {
      console.log("error", error.response.data.message);
    }
  };

  const filteredValueTypeOptions =
    targetType === "shipping_line"
      ? [{ label: "Percentage", value: "percentage" }]
      : valueTypeOptions;

  return (
    <Page title="Discounts" fullWidth>
      <LegacyStack distribution="equalSpacing">
        <PolarisTextField
          label="Filter discounts"
          value={filterValue}
          onChange={(value) => setFilterValue(value)}
          placeholder="Search by title"
          autoComplete="off"
        />
        <Button onClick={() => setIsModalOpen(true)}>Create Discount</Button>
      </LegacyStack>

      <Box padding="0" width="100%" id="discount-section">
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

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Discount"
        primaryAction={{
          content: "Create",
          onAction: handleCreateDiscount,
        }}
      >
        <Modal.Section>
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormLayout>
              <PolarisTextField
                label="title"
                value={newDiscountTitle}
                onChange={(value) => setNewDiscountTitle(value)}
                error={titleError ? "Title should start with 'ccc'." : ""}
              />
              <Select
                label="target_type"
                options={targetTypeOptions}
                value={targetType}
                onChange={(value) => setTargetType(value)}
              />
              <Select
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
              />
              <Select
                label="value_type"
                options={filteredValueTypeOptions}
                value={valueType}
                onChange={(value) => setValueType(value)}
              />
              <PolarisTextField
                label="value"
                type="number"
                value={value}
                onChange={(value) => setValue(value)}
                error={valueError ? "Value is required." : ""}
              />
              {targetType === "shipping_line" && (
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
              />
              <PolarisTextField
                label="entitled_product_ids"
                placeholder="Enter product IDs separated by commas"
                value={entitledProductIds}
                onChange={(value) => setEntitledProductIds(value)}
                error={
                  customerSelectionError &&
                  "At least one product ID is required."
                }
              />
              <PolarisTextField
                label="starts_at"
                type="date"
                value={startsAt}
                onChange={(value) => setStartsAt(value)}
              />
              <PolarisTextField
                label="end_at"
                type="date"
                value={endAt}
                onChange={(value) => setEndAt(value)}
              />
              <PolarisTextField
                label="discount_code"
                value={newDiscountCode}
                onChange={(value) => setNewDiscountCode(value)}
                error={codeError ? "Discount code is required." : ""}
              />
              <Select
                label="discount_type"
                options={discountTypeOptions}
                value={newDiscountType}
                onChange={(value) => setNewDiscountType(value)}
                error={typeError ? "Discount type is required." : ""}
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
