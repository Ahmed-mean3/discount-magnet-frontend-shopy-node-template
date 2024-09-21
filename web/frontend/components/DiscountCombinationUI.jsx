import {
  Button,
  Checkbox,
  TextField as PolarisTextField,
  Text,
} from "@shopify/polaris";
import React from "react";

function DiscountCombinationUI({
  isProductDiscount,
  isOrderDiscount,
  isShippingDiscount,
  handleChangeisOrderDiscount,
  handleChangeisProductDiscount,
  handleChangeisShippingDiscount,
  showProductDiscount = true,
  showOrderDiscount = true,
  showShippingDiscount = true,
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
          fontSize: "14px",
          fontWeight: "500",
          color: "black",
          marginBottom: 10,
        }}
      >
        Combinations
      </div>

      <div
        style={{
          fontSize: "13px",
          // fontWeight: "500",
          color: "black",
          marginBottom: 10,
        }}
      >
        The Shipping discount can be combined with
      </div>
      {showProductDiscount && (
        <div>
          <Checkbox
            label="Product discounts"
            checked={isProductDiscount}
            onChange={handleChangeisProductDiscount}
          />
        </div>
      )}
      {showOrderDiscount && (
        <div>
          <Checkbox
            label="Order discounts"
            checked={isOrderDiscount}
            onChange={handleChangeisOrderDiscount}
          />
        </div>
      )}
      {showShippingDiscount && (
        <div>
          <Checkbox
            label="Shipping discounts"
            checked={isShippingDiscount}
            onChange={handleChangeisShippingDiscount}
          />
        </div>
      )}
    </div>
  );
}

export default DiscountCombinationUI;
