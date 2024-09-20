import { Button, TextField as PolarisTextField, Text } from "@shopify/polaris";
import React from "react";

function DiscountCodeUI({
  handleRandomCodeGenerate,
  newDiscountCode,
  setNewDiscountCode,
  codeError,
  topLeftBannerName = "Amount off products",
  topRightBannerName = "Product discount",
}) {
  return (
    <div
      style={{
        marginBottom: 5,
        padding: 10,
        borderColor: "#FFFFFF",
        borderRadius: "10px",
        width: "100%",
        height: "40%",
        backgroundColor: "#FFFFFF",
        border: "1px solid #FFFFFF",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          // gap: "120px",
          // position: "absolute",
          // top: -15,
          // left: "0",
          // right: "0",
          // padding: "32px 32px", // Match the outer box padding
          // paddingRight: "12px",
          // paddingLeft: "12px",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "black",
          }}
        >
          {topLeftBannerName}
        </span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "gray" }}>
          {topRightBannerName}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: -20, // Adjust spacing as needed
        }}
      >
        <Button
          onClick={handleRandomCodeGenerate}
          plain
          style={{
            color: "blue", // Set the text color to blue
            backgroundColor: "transparent", // Make background transparent
            border: "none", // Remove default border
            fontWeight: "bold", // Set font weight to bold
          }}
        >
          <Text fontWeight="medium">Generate random code</Text>
        </Button>
      </div>
      <PolarisTextField
        label="Discount Code"
        value={newDiscountCode}
        onChange={(value) => setNewDiscountCode(value)}
        error={codeError ? "Discount code is required." : ""}
      />
      <div style={{ color: "gray", fontWeight: "500", fontSize: "13px" }}>
        Customer must enter this code at checkout
      </div>
    </div>
  );
}

export default DiscountCodeUI;
