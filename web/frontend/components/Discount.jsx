import React from "react";
import {
  Page,
  Box,
  Stack,
  TextField as PolarisTextField,
  Select,
} from "@shopify/polaris";

export function DiscountDetails({ discount, onClose }) {
  const targetTypeOptions = [
    { label: "Line Item", value: "line_item" },
    { label: "Shipping Line", value: "shipping_line" },
  ];

  const valueTypeOptions = [
    { label: "Fixed Amount", value: "fixed_amount" },
    { label: "Percentage", value: "percentage" },
  ];

  return (
    <Page
      title="Discount Details"
      primaryAction={{ content: "Close", onAction: onClose }}
    >
      <Box padding="4">
        <Stack vertical>
          <PolarisTextField
            label="Discount Title"
            value={discount.title}
            readOnly
          />
          <PolarisTextField
            label="Discount Amount"
            value={discount.amount}
            readOnly
          />
          <PolarisTextField
            label="Expiry Date"
            type="date"
            value={discount.expiryDate}
            readOnly
          />
          <PolarisTextField
            label="Discount Code"
            value={discount.discountCode}
            readOnly
          />
          <Select
            label="Discount Type"
            options={[
              { label: "Amount off products", value: "amount_off_products" },
              { label: "Free shipping", value: "free_shipping" },
            ]}
            value={discount.type}
            disabled
          />
          <Select
            label="Target Type"
            options={targetTypeOptions}
            value={discount.targetType}
            disabled
          />
          <Select
            label="Target Selection"
            options={[
              { label: "All", value: "all" },
              { label: "Specific Products", value: "specific_products" },
            ]}
            value={discount.targetSelection}
            disabled
          />
          <Select
            label="Allocation Method"
            options={[
              { label: "Across All Items", value: "across" },
              { label: "To Each Item", value: "each" },
            ]}
            value={discount.allocationMethod}
            disabled
          />
          <Select
            label="Value Type"
            options={valueTypeOptions}
            value={discount.valueType}
            disabled
          />
          <PolarisTextField label="Value" value={discount.value} readOnly />
          {discount.targetType === "shipping_line" && (
            <PolarisTextField
              label="Shipping Discount Value"
              value={discount.shippingDiscountValue}
              readOnly
            />
          )}
          <Select
            label="Customer Selection"
            options={[
              { label: "All", value: "all" },
              { label: "Specific Customers", value: "specific_customers" },
            ]}
            value={discount.customerSelection}
            disabled
          />
        </Stack>
      </Box>
    </Page>
  );
}
