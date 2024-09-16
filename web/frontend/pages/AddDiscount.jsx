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
  TextContainer,
  VerticalStack,
  RadioButton,
  Stack,
  List,
  Checkbox,
  Spinner,
  LegacyCard,
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import {
  ArrowLeftMinor,
  SearchMajor,
  SearchMinor,
} from "@shopify/polaris-icons";

import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import DatePickerMain from "../components/DatePicker";
import { check } from "prettier";
import { createApp } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
// import { useNavigate } from "@shopify/app-bridge-react";

export default function AddDiscount() {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutomatic, setIsAutomatic] = useState(false);
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
  const [appliesTo, setAppliesTo] = useState("specific_product");
  const [productIds, setProductIds] = useState([]);
  const [ProductOptions, setProductOptions] = useState([]);
  const [prodIds, setProdIds] = useState([]);
  const [customerIds, setCustomerIds] = useState([]);
  const [value, setValue] = useState("");
  const [shippingDiscountValue, setShippingDiscountValue] = useState("");
  const [shippingError, setShippingError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [expiryError, setExpiryError] = useState(false);
  const [valueError, setValueError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [codeStartDateError, setCodeStartDateError] = useState(false);
  const [customerSelection, setCustomerSelection] = useState("all");
  const [customerSelectionError, setCustomerSelectionError] = useState(false);
  const [productIdsError, setProductIdsError] = useState(false);
  const [startsAtTime, setStartsAtTime] = useState(formatTime(new Date()));
  const [endAtTime, setEndAtTime] = useState(formatTime(new Date()));
  const [discountCodeType, setDiscountCodeType] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [CollectionOptions, setCollectionOptions] = useState([]);

  const [
    prerequisiteToEntitlementQuantityRatio,
    setPrerequisiteToEntitlementQuantityRatio,
  ] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");

  const handleMethodChange = (value) => {
    setSelectedMethod(value);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [modalLoader, setModalLoader] = useState(false);
  const [usageLimitchecked, setUsageLimitchecked] = useState(false);
  const [usageLimitValue, setUsageLimitValue] = useState(0);
  const [minPurchaseReq, setMinPurchaseReq] = useState(0);
  const [minQuantityReq, setMinQuantityReq] = useState(0);
  const [usageLimitCodeError, setUsageLimitCodeError] = useState(0);
  const [minPurchaseReqError, setMinPurchaseReqError] = useState(false);
  const [minQuantityReqError, setMinQuantityReqError] = useState(false);
  const [oneUserPerCustomerchecked, setOneUserPerCustomerchecked] =
    useState(false);
  const fetch = useAuthenticatedFetch();
  const [minRequirementSelected, setMinRequirementSelected] = useState("NMR");
  const [selected, setSelected] = useState("all");
  const [checkselected, setCheckSelected] = useState("all");
  const [minRequirementCheckselected, setMinRequirementCheckSelected] =
    useState("NMR");
  console.log("check selected", checkselected);
  const [textFieldValue, setTextFieldValue] = useState("");
  const handleTextFieldChange = useCallback(
    (value) => setTextFieldValue(value),
    []
  );

  const renderChildren = useCallback(
    (selected) =>
      selected &&
      (minRequirementCheckselected === "MPA" ||
        minRequirementCheckselected === "MQI") ? (
        <>
          <div style={{ width: "20%" }}>
            <PolarisTextField
              prefix={minRequirementCheckselected === "MQI" ? "" : "$"}
              type="number"
              label=""
              value={
                minRequirementCheckselected === "MPA"
                  ? minPurchaseReq
                  : minQuantityReq
              }
              onChange={(value) => {
                const parsedValue = parseInt(value, 10); // Parse value to integer

                // Prevent negative values
                if (parsedValue >= 0 || value === "") {
                  minRequirementCheckselected === "MPA"
                    ? setMinPurchaseReq(value)
                    : setMinQuantityReq(value);
                }
              }}
              error={
                minRequirementCheckselected === "MPA" && minPurchaseReqError
                  ? "Minimum purchase value required."
                  : minRequirementCheckselected === "MQI" && minQuantityReqError
                  ? "Minimum quantity value is required"
                  : ""
              }
            />
          </div>
          <div
            style={{
              // marginLeft: 25,
              marginTop: 5,
              fontSize: "13px",
              color: "gray",
              fontWeight: "500",
            }}
          >
            Applies only to selected products.
          </div>
        </>
      ) : null,
    [
      minPurchaseReq,
      minQuantityReq,
      minRequirementCheckselected,
      minPurchaseReqError,
      minQuantityReqError,
    ]
  );
  // useEffect(() => {
  //   if (minRequirementCheckselected === "MPA") {
  //     setMinQuantityReq(0);
  //   } else if (minRequirementCheckselected === "MQI") {
  //     setMinPurchaseReq(0);
  //   }
  // }, [minRequirementCheckselected, minQuantityReq, minPurchaseReq]);
  // const _renderChildren = useCallback(
  //   (_selected) =>
  //     _selected ? (
  //       <>
  //         <div style={{ marginLeft: 27, width: "20%" }}>
  //           <PolarisTextField
  //             type="number"
  //             label=""
  //             value={minQuantityReq}
  //             onChange={(value) => setMinQuantityReq(value)}
  //             error={
  //               minQuantityReqError ? "Minimum quantity value is required" : ""
  //             }
  //           />
  //         </div>
  //         <div
  //           style={{
  //             marginLeft: 25,
  //             marginTop: 5,
  //             fontSize: "13px",
  //             color: "gray",
  //             fontWeight: "500",
  //           }}
  //         >
  //           Applies only to selected products.
  //         </div>
  //       </>
  //     ) : null,
  //   [minQuantityReq]
  // );
  const handleChangeCustomerSelection = useCallback((value) => {
    {
      const [_selected] = value;
      setCheckSelected(_selected);
      setSelected(value);
    }
  }, []);
  const handleChangeMinRequirementSelection = useCallback((value) => {
    {
      const [_selected] = value;
      setMinRequirementCheckSelected(_selected);
      setMinRequirementSelected(value);
    }
  }, []);
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleChangeUsageLimitChecked = (checked) => {
    setUsageLimitchecked((prev) => !prev);
  };
  const handleChangeoneUserPerCustomerChecked = (checked) => {
    setOneUserPerCustomerchecked((prev) => !prev);
  };
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
  const AppliesToOptions = [
    { label: "Specific Collection", value: "specific_collection" },
    { label: "Specific Product", value: "specific_product" },
  ];
  const [selectedTags, setSelectedTags] = useState([]);

  const [_selectedTags, set_SelectedTags] = useState([]);
  const [checked, setChecked] = useState(false);
  const [CustomerIdsError, setCustomerIdsError] = useState(false);
  const handleChangeCheckbox = useCallback(
    (newChecked) => setChecked(newChecked),
    []
  );
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
  const defaultListStyle = {
    marginTop: "10px",
    marginBottom: "20px",
    fontSize: "12px",
    color: "gray",
    fontWeight: "500",
    marginLeft: "2px",
  };

  const bulletStyle = {
    display: "inline-block",
    // width: "1em",
    textAlign: "center",
    marginRight: "0.5em",
    fontSize: "1.2em", // Increase font size for a thicker appearance
    color: "black",
    fontWeight: "bold", // Make the bullet bolder
  };
  // [appliesTo === "specific_collection" ? CollectionOptions : ProductOptions];
  // const deselectedOptions = useMemo(
  //   () =>
  //     appliesTo === "specific_collection"
  //       ? CollectionOptions.map((collection) => ({
  //           value: collection.value,
  //           label: collection.label,
  //         }))
  //       : ProductOptions.map((product) => ({
  //           value: product.value,
  //           label: product.label,
  //         })),
  //   [appliesTo, CollectionOptions, ProductOptions] // depend on appliesTo and options
  // );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [_selectedOptions, set_SelectedOptions] = useState([]);
  const [CustomerOptions, setCustomerOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [_inputValue, set_InputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [_options, set_Options] = useState([]);

  // const queryParams = new URLSearchParams(window.location.search);
  // const host = queryParams.get("host");

  // const app = createApp({
  //   apiKey: process.env.SHOPIFY_API_KEY,
  //   shopOrigin: queryParams.get("shop"), // Extracts shop parameter
  //   host: host,
  // });

  // getSessionToken(app).then((token) => {
  //   // Token contains user information
  //   const decodedToken = JSON.parse(atob(token.split(".")[1]));
  //   console.log("tang taran", decodedToken); // Contains user ID, email, etc.
  // });
  useEffect(() => {
    const updatedOptions =
      appliesTo === "specific_collection"
        ? CollectionOptions.map((collection) => ({
            value: collection.value,
            label: collection.label,
          }))
        : ProductOptions.map((product) => ({
            value: product.value,
            label: product.label,
          }));

    setOptions(updatedOptions);
  }, [appliesTo, CollectionOptions, ProductOptions]);
  useEffect(() => {
    const updatedOptions =
      CustomerOptions.length > 0
        ? CustomerOptions.map((collection) => ({
            value: collection.value,
            label: collection.label,
          }))
        : [
            { value: 1, label: "Rustic" },
            { value: 2, label: "Antique" },
            { value: 3, label: "Vinyl" },
            { value: 4, label: "Vintage" },
            { value: 5, label: "Refurbished" },
          ];

    set_Options(updatedOptions);
  }, [appliesTo, CustomerOptions]);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensures two-digit month
    const day = date.getDate().toString().padStart(2, "0"); // Ensures two-digit day
    return `${year}-${month}-${day}`;
  }
  function modifyDate(dateString) {
    // Parse the given date string into a Date object
    let date = new Date(dateString);

    // Decrement the month by 1 (Date object handles the year rollover if needed)
    date.setMonth(date.getMonth() - 1);

    // Increment the day by 1
    date.setDate(date.getDate() + 1);

    // Extract the updated year, month, and day, ensuring proper formatting
    const year = date.getFullYear();
    const month = (date.getMonth() + 2).toString().padStart(2, "0"); // Ensures two-digit month
    const day = date.getDate().toString().padStart(2, "0"); // Ensure two-digit day

    // Return the formatted date string
    return `${year}-${month}-${day}`;
  }
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedDateEnd, setSelectedDateEnd] = useState(
    modifyDate(new Date())
  );

  const handleDateChange = (newDate, isReturn = false, incr = false) => {
    //apply below if incr is true
    //newDate.setDate(newDate.getDate() + 1)

    if (incr) {
      newDate.setDate(newDate.getDate() + 1);
    }
    newDate.setMonth(newDate.getMonth() + 2);

    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, "0"); // +1 to convert to 1-based month

    const day = newDate.getDate().toString().padStart(2, "0"); // Ensures two-digit day
    console.log("Selected Date:", `${year}-${month}-${day}`);

    if (isReturn) {
      return `${year}-${month}-${day}`;
    } else {
      setSelectedDate(`${year}-${month}-${day}`);
    }
  };
  console.log("Selected Date 2:", selectedDate);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(handleDateChange(new Date(), true));
    }
  }, []);
  // // Example usage:
  // const newDate = modifyDate("2024-08-05");
  // console.log(newDate); // Output: 2024-07-06

  const handleDateChangeEnd = (newDate) => {
    // Get the year, month (zero-based index, so add 1), and day
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, "0"); // Ensures two-digit month
    const day = newDate.getDate().toString().padStart(2, "0"); // Ensures two-digit day
    console.log("Selected Date end:", `${year}-${month}-${day}`);
    setSelectedDateEnd(`${year}-${month}-${day}`);
  };
  console.log(options, "000000000000000000000000");
  const _updateText = useCallback(
    (value) => {
      set_InputValue(value);

      if (value === "") {
        set_Options(
          CustomerOptions.length > 0
            ? CustomerOptions.map((collection) => ({
                value: collection.value,
                label: collection.label,
              }))
            : [
                { value: 1, label: "Rustic" },
                { value: 2, label: "Antique" },
                { value: 3, label: "Vinyl" },
                { value: 4, label: "Vintage" },
                { value: 5, label: "Refurbished" },
              ]
        );
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = _options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      console.log("matching out..", resultOptions);
      set_Options(resultOptions);
    },
    [options]
  );
  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(
          appliesTo === "specific_collection"
            ? CollectionOptions.map((collection) => ({
                value: collection.value,
                label: collection.label,
              }))
            : ProductOptions.map((product) => ({
                value: product.value,
                label: product.label,
              }))
        );
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      console.log("matching out..", resultOptions);
      setOptions(resultOptions);
    },
    [options]
  );
  console.log("selection side", selectedOptions);
  function formatTime(date, isSecond = false) {
    // Get hours and minutes
    let hours = isSecond ? date.getHours() + 1 : date.getHours();
    const minutes = date.getMinutes();

    // Format hours and minutes to always be two digits
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Return formatted time string
    return `${formattedHours}:${formattedMinutes}`;
  }
  const updateSelection = useCallback(
    (selected) => {
      if (prodIds.length > 0) {
        setProductIdsError(false);
      }
      setSelectedOptions(selected);

      setProdIds((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          if (!selected.includes(item)) {
            updatedSet.delete(item);
          }
        });

        // Add all currently selected items to the Set
        selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array and return it
        return Array.from(updatedSet);
      });

      const selectedValue = selected.map((selectedItem) => {
        // Find the option that matches the selected item's value
        const matchedOption = options.find(
          (option) => option.value === selectedItem
        );

        // If a match is found, capitalize the first word of the label and return it
        if (matchedOption) {
          const label = matchedOption.label;
          return label.charAt(0).toUpperCase() + label.slice(1);
        }

        return null; // Return null if no match is found
      });
      setSelectedTags(selectedValue);
    },
    [options]
  );
  const _updateSelection = useCallback(
    (selected) => {
      // console.log("selected", selected);
      // return;
      if (customerIds.length > 0) {
        setCustomerIdsError(false);
      }
      set_SelectedOptions(selected);

      setCustomerIds((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          if (!selected.includes(item)) {
            updatedSet.delete(item);
          }
        });

        // Add all currently selected items to the Set
        selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array and return it
        return Array.from(updatedSet);
      });

      const selectedValue = selected.map((selectedItem) => {
        // Find the option that matches the selected item's value
        const matchedOption = _options.find(
          (option) => option.value === selectedItem
        );

        // If a match is found, capitalize the first word of the label and return it
        if (matchedOption) {
          const label = matchedOption.label;
          return label.charAt(0).toUpperCase() + label.slice(1);
        }

        return null; // Return null if no match is found
      });
      set_SelectedTags(selectedValue);
    },
    [options]
  );
  console.log("selected product->>>>>>", selectedTags);

  const discountTypeOptions = [
    { label: "Amount off products", value: "amount_off_products" },
    { label: "Free shipping", value: "free_shipping" },
  ];

  const customerSelectionOptions = [
    { label: "All", value: "all" },
    { label: "Specific Customers", value: "specific_customers" },
  ];
  const [items, setItems] = useState(["Amount off products", "Code"]);
  const [items_two, setItems_two] = useState([
    "Can't combine with other discounts",
  ]);

  const addItem = (newItem) => {
    setItems([...items, newItem]);
  };
  const addItem_two = (newItem) => {
    setItems_two([...items, newItem]);
  };

  // useEffect(() => {
  //   const savedDiscounts = JSON.parse(localStorage.getItem("discounts")) || [];
  //   setDiscounts(savedDiscounts);
  // }, []);

  console.log("data", discounts);
  const filteredDiscounts = discounts.filter((discount) =>
    discount?.title?.toLowerCase().includes(filterValue.toLowerCase())
  );
  const handleFetchCollectionPopulate = async () => {
    // setIsLoading(true);
    const apiUrl = `https://middleware-discountapp.mean3.ae/get-collections?limit=50`;

    await axios
      .get(apiUrl, {
        headers: {
          "api-key": "Do2j^jF",
          "shop-name": "store-for-customer-account-test",
          "shopify-api-key": "185e5520a93d7e0433e4ca3555f01b99",
          "shopify-api-token": "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",
          "Content-Type": "application/json",
        },
      })

      .then((data) => {
        // console.log(data.data); // This will log the fetched products
        // You can now use the 'data' variable to access your fetched products
        // Mapping the products data to the desired format
        const formattedCollection = data.data.data.map((collection) => ({
          label: collection.title,
          value: collection.id,
        }));
        console.log("Fetched collections:", formattedCollection); // Debugging line
        // const deselectedOptions = useMemo(() => formattedCollection, []);
        // console.log(formattedCollection);
        setCollectionOptions(formattedCollection);
        // setIsLoading(false);
      })
      .catch((error) => {
        // setIsLoading(false);
        console.log("There was an error fetching the products:", error);
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
  const fetchPriceRule = async (price_rule_id) => {
    try {
      const apiUrl = `https://middleware-discountapp.mean3.ae/get-price_rule/${price_rule_id}`;
      const response = await axios.get(apiUrl, {
        headers: {
          "api-key": "Do2j^jF",
          "shop-name": "habitt-international-mean3",
          "shopify-api-key": "f5ece1e1e96b8066cca83712b0fd365c",
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

  useEffect(() => {
    // fetchDiscounts();
    handleFetchCustomers();
    handleFetchPopulate();
    handleFetchCollectionPopulate();
  }, []);
  useEffect(() => {
    // fetchDiscounts();
    if (appliesTo === "specific_collection") {
      handleFetchCollectionPopulate();
    } else {
      handleFetchPopulate();
    }
  }, [appliesTo]);
  // useEffect(() => {
  //   fetchDiscounts();
  // }, [toastVisible]);
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

  function extractDate(dateString) {
    // console.log(dateString, "check date string?");
    // return;
    // Split the string by space to get date components
    const dateParts = `${dateString}`.split(" ");

    // Extract the first four parts (Day, Month, Date, Year)
    const extractedDate = dateParts.slice(0, 4).join(" ");

    return extractedDate;
  }
  const createDiscount = async () => {
    const productIds = ["9526024536366", "9526024306990"]; // Example product ID
    const discountTitle = "Automatic Discount from graphql 20%";
    const startsAt = "2024-09-11T00:00:00Z";
    const endsAt = "2024-09-12T00:00:00Z";
    const discountValue = 15; // Discount percentage

    try {
      const response = await fetch("/api/create-automatic-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountTitle,
          startsAt,
          endsAt,
          discountValue,
          productIds,
        }),
      });

      const data = await response.json();
      console.log("Discount created:", data);
    } catch (error) {
      console.error("Error creating discount:", error);
    }
  };

  const handleCreateDiscount = async () => {
    let isValid = false;
    // // const data = { status: true };

    // // // document.getElementById("discount-section").scrollIntoView();
    // // navigate("/", { state: data });
    // setModalLoader(true);

    // return;
    // setModalLoader(true);

    try {
      setModalLoader(true);
      // return;
      isValid = true;

      // if (!newDiscountTitle.startsWith("ccc") || !newDiscountTitle) {
      //   setTitleError(true);
      //   isValid = false;
      // } else {
      //   setTitleError(false);
      // }

      // if (!newDiscountAmount) {
      //   setAmountError(true);
      //   setModalLoader(false);

      //   isValid = false;
      // } else {
      //   setAmountError(false);
      //   setModalLoader(false);
      // }

      // if (!newDiscountExpiry) {
      //   setExpiryError(true);
      //   // setModalLoader(false);

      //   isValid = false;
      // } else {
      //   setExpiryError(false);
      //   // setModalLoader(false);
      // }

      if (!newDiscountCode) {
        setCodeError(true);

        isValid = false;

        // const newLocal = (isValid = false);
      } else {
        setCodeError(false);
      }

      // if (!newDiscountType) {
      //   setTypeError(true);
      //   isValid = false;
      // } else {
      //   setTypeError(false);
      // }

      // if (valueType !== "percentage" && ) {
      //   // setValueError(true);
      //   // isValid = false;
      //   // console.log("smao");
      // } else

      if (valueType === "percentage" && (!value || value > 0 || value < -100)) {
        setValueError(true);
        isValid = false;
      } else if (valueType === "fixed_amount" && (!value || value >= 0)) {
        setValueError(true);

        isValid = false;
      } else {
        setValueError(false);
        isValid = true;
      }
      if (!selectedDate) {
        console.log("entring");
        setCodeStartDateError(true);

        isValid = false;

        // return;
      } else {
        isValid = true;
        setCodeStartDateError(false);
      }
      if (prodIds.length === 0) {
        setProductIdsError(true);

        isValid = false;
        // return;
      } else {
        setProductIdsError(false);

        isValid = true;
      }
      // if (productIds.length === 0) {
      //   isValid = false;
      //   console.log("chec king......");
      // }
      // if (
      //   customerSelection === "specific_customers" &&
      //   !entitledProductIds.length
      // ) {
      //   setCustomerSelectionError(true);
      //   isValid = false;
      // } else {
      //   setCustomerSelectionError(false);
      // }
      // console.log(
      //   "dynamics->>>>>>",
      //   prodIds,
      //   valueType,
      //   newDiscountCode,
      //   startsAtTime,
      //   value,
      //   "check sab h sai isValid?",
      //   isValid,
      //   "new date",
      //   new Date().toDateString(),
      //   "selected date",
      //   extractDate(selectedDate)
      // );

      if (usageLimitchecked && !usageLimitValue) {
        isValid = false;
        setUsageLimitCodeError(true);
      } else {
        setUsageLimitCodeError(false);
        isValid = true;
      }

      if (!value) {
        setValueError(true);
        isValid = false;
      } else {
        setValueError(false);
        isValid = true;
      }

      if (minRequirementCheckselected === "MPA" && !minPurchaseReq) {
        setMinPurchaseReqError(true);
        isValid = false;
      } else {
        setMinPurchaseReqError(false);
      }
      if (minRequirementCheckselected === "MQI" && !minQuantityReq) {
        setMinQuantityReqError(true);
        isValid = false;
      } else {
        setMinQuantityReqError(false);
      }

      if (
        (checkselected === "SC" || checkselected === "SCS") &&
        customerIds.length === 0
      ) {
        setCustomerIdsError(true);
        isValid = false;
      } else {
        isValid = true;
        setCustomerIdsError(false);
      }

      if (!isValid) {
        setModalLoader(false);
        return;
      }

      // return;
      const newDiscount = {
        price_rule: {
          title: newDiscountCode,
          target_type: "line_item",
          target_selection:
            minRequirementCheckselected === "MPA" ||
            minRequirementCheckselected === "MQI"
              ? "entitled"
              : "across",
          allocation_method:
            minRequirementCheckselected === "MPA" ||
            minRequirementCheckselected === "MQI"
              ? "each"
              : "across",
          value_type: valueType,
          value: value,
          customer_selection:
            checkselected === "SC" || checkselected === "SCS"
              ? "prerequisite"
              : "all",
          [appliesTo === "specific_collection"
            ? "entitled_collection_ids"
            : "entitled_product_ids"]: prodIds,
          starts_at:
            extractDate(selectedDate) === new Date().toDateString()
              ? handleDateChange(new Date(), true)
              : selectedDate + "T" + startsAtTime + ":00",
          end_at: checked
            ? handleDateChange(new Date(), true, true) +
              ":" +
              formatTime(new Date(), true)
            : selectedDateEnd && endAtTime
            ? selectedDateEnd + ":" + endAtTime
            : null,
          // Conditionally add the "prerequisite_customer_ids" key only if the condition is true
          ...(checkselected === "SC" || checkselected === "SCS"
            ? { prerequisite_customer_ids: customerIds } // Add this key-value pair if condition is true
            : {}),
          usage_limit: usageLimitValue,
          once_per_customer: oneUserPerCustomerchecked
            ? oneUserPerCustomerchecked
            : false,

          ...(minRequirementCheckselected === "MPA" &&
            minPurchaseReq && {
              prerequisite_subtotal_range: {
                greater_than_or_equal_to: minPurchaseReq,
              },
              prerequisite_product_ids: prodIds, // Add item prerequisites (either products or collections)
            }),
          ...(minRequirementCheckselected === "MQI" &&
            minQuantityReq && {
              prerequisite_to_entitlement_quantity_ratio: {
                prerequisite_quantity: minQuantityReq,
                entitled_quantity: 1,
              },
              prerequisite_product_ids: prodIds, // Add item prerequisites (either products or collections)
            }),
        },
        discount_code: newDiscountCode,
        discount_type: "product",
      };
      console.log(
        "payloardCheckup...",
        newDiscount,
        "default end date if true it is->",
        checked,
        "selected end date if true if is->"
      );
      // return;
      // return;
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
      setProdIds([]);
      setSelectedTags([]);
      setShippingDiscountValue("");
      setCustomerSelection("all");
      setStartsAt("");
      setEndAt("");
      setDiscountCodeType("");
      setPrerequisiteToEntitlementQuantityRatio([]);
      setShippingError(false);
      setCodeStartDateError(false);
      setProductIdsError(false);
      setTitleError(false);
      setAmountError(false);
      setExpiryError(false);
      setCodeError(false);
      setTypeError(false);
      setValueError(false);
      setCustomerSelectionError(false);
      setIsModalOpen(false);
      setSelectedDate();
      startsAtTime();
      setEndAtTime();
      setSelectedDateEnd();
      setProdIds([]);
      // toggleActive();
      // toastMarkup("Discount Added Successfull");
      const data = { status: true };

      // navigate("/", { state: data });
      // setToastVisible(true);
      // fetchDiscounts();

      // document.getElementById("discount-section").scrollIntoView();
      navigate("/", { state: data });
    } catch (error) {
      // setModalLoader(false);
      // <Toast
      //   content={`${error.response.data.message}`}
      //   onDismiss={toggleActive}
      // />;

      console.log("error", error);
    } finally {
      // return;

      if (!isValid) {
        setModalLoader(false);
        return;
      }
      const data = { status: true };
      setSelectedDate(formatDate(new Date()));
      setSelectedDateEnd(modifyDate(new Date()));
      setStartsAtTime(formatTime(new Date()));
      setEndAtTime(formatTime(new Date()));
      setShippingError(false);
      setCodeStartDateError(false);
      setProductIdsError(false);
      setTitleError(false);
      setAmountError(false);
      setExpiryError(false);
      setCodeError(false);
      setTypeError(false);
      setValueError(false);
      setSelectedTags([]);
      setValue("");
      setProdIds([]);
      setSelectedTags([]);
      setProductIdsError(false);
      setCustomerIds(false);
      setAppliesTo("specific_product");
      setUsageLimitchecked(false);
      setUsageLimitValue(0);
      // Ensure loader is turned off
      setModalLoader(false);
      navigate("/", { state: data });
    }
  };
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
  const filteredAppliesToOptions =
    targetType === "shipping_line"
      ? [{ label: "Percentage", value: "percentage" }]
      : AppliesToOptions;

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
        console.log("Fetched Products:", data); // Debugging line

        const formattedProducts = data.data.map((product) => ({
          label: product.title,
          value: product.id,
        }));
        // console.log("Fetched Products:", formattedProducts); // Debugging line
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
  const handleFetchCustomers = async () => {
    setIsLoading(true);

    await fetch("api/customers/all", { method: "GET" })
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
        console.log("Fetched customers:", data.data); // Debugging line

        const formattedCustomers = data.data.map((customers) => ({
          label: customers.email,
          value: customers.id,
        }));
        // console.log("Fetched Products:", formattedProducts); // Debugging line
        // const deselectedOptions = useMemo(() => formattedProducts, []);
        // console.log(formattedProducts);

        // return;
        setCustomerOptions(formattedCustomers);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("There was an error fetching the customers:", error);
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

  function titleCase(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join("");
  }

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label=""
      value={inputValue}
      prefix={<Icon source={SearchMinor} tone="base" />}
      // placeholder="Vintage, cotton, summer"
      // verticalContent={verticalContentMarkup}
      // placeholder="Autmn,Skat Board"
      autoComplete="off"
      placeholder={`Specific ${
        appliesTo === "specific_collection" ? "collections" : "products"
      }`}
    />
  );
  const _textField = (
    <Autocomplete.TextField
      labelHidden
      placeholder="Search customers"
      onChange={_updateText}
      value={_inputValue}
      autoComplete="off"
      prefix={<Icon source={SearchMinor} tone="base" />}
      style={{ width: "100%" }} // This makes the TextField 100% width of its container
    />
  );
  const _removeTag = useCallback(
    (tag) => () => {
      // console.log("matched option->>>>>>", _options, tag);
      // return;
      // Find the option that matches the selected item's value
      const matchedOption = _options.filter((option) =>
        option.label.toLowerCase() === tag.toLowerCase() ? option.value : null
      );
      // console.log("checkup", matchedOption);
      // return;
      setCustomerIds((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          // console.log("tagass", matchedOption?.value === item);
          matchedOption.forEach((_item) => {
            if (_item.value === item) {
              updatedSet.delete(item);
            }
          });
        });

        // // Add all currently selected items to the Set
        // selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array and return it
        return Array.from(updatedSet);
      });
      // return;
      set_SelectedOptions((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          // console.log("problem", matchedOption.value, item);
          matchedOption.forEach((_item) => {
            if (_item.value === item) {
              updatedSet.delete(item);
            }
          });
        });

        // // Add all currently selected items to the Set
        // selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array and return it
        return Array.from(updatedSet);
      });
      // return;
      set_SelectedTags((previousTags) =>
        previousTags.filter((previousTag) => previousTag !== tag)
      );
    },
    []
  );
  const removeTag = useCallback(
    (tag) => () => {
      // console.log("matched option->>>>>>", tag);
      // return;
      // Find the option that matches the selected item's value
      const matchedOption = options.filter((option) =>
        option.label === tag.toLowerCase() ? option.value : null
      );
      // console.log("checkup", matchedOption);
      // return;
      setProdIds((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          // console.log("tagass", matchedOption?.value === item);
          matchedOption.forEach((_item) => {
            if (_item.value === item) {
              updatedSet.delete(item);
            }
          });
        });

        // // Add all currently selected items to the Set
        // selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array and return it
        return Array.from(updatedSet);
      });
      // return;
      setSelectedOptions((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          // console.log("problem", matchedOption.value, item);
          matchedOption.forEach((_item) => {
            if (_item.value === item) {
              updatedSet.delete(item);
            }
          });
        });

        // // Add all currently selected items to the Set
        // selected.forEach((item) => updatedSet.add(item));

        // Convert the Set back to an array and return it
        return Array.from(updatedSet);
      });
      // return;
      setSelectedTags((previousTags) =>
        previousTags.filter((previousTag) => previousTag !== tag)
      );
    },
    []
  );
  console.log("katjas", _options);
  const tagMarkup = selectedTags.map((option) => (
    <LegacyCard key={option}>
      <Tag onRemove={removeTag(option)}>{option}</Tag>
    </LegacyCard>
  ));
  const _tagMarkup = _selectedTags.map((option) => (
    <LegacyCard key={option}>
      <Tag onRemove={_removeTag(option)}>{option}</Tag>
    </LegacyCard>
  ));

  const handleRandomCodeGenerate = () => {
    const length = 10; // Length of the random part
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Allowed characters for the random part

    // Generate the random part
    let randomPart = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomPart += characters[randomIndex];
    }

    // Create the final discount code
    const discountCode = `${randomPart}`;

    // Set the discount code state
    setNewDiscountCode(discountCode);
  };
  // console.log(
  //   "checkingggg.......",
  //   checkselected === "SC" &&
  //     selectedOptions.length > 0 &&
  //     selectedTags.length > 0
  // );
  return (
    <Page
      backAction={{ content: "Settings", url: "/" }}
      title="Create Discount"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: "20px",
        }}
      >
        {/* main */}
        <div
          style={{
            width: "70%",
            // flex: 1,
            // backgroundColor: "black",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            // flexWrap: "wrap", // Ensures the items can wrap if needed
            // marginBottom: 40,
            // marginTop: 40,
          }}
        >
          {/* first card */}
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
                Amount off products
              </span>
              <span
                style={{ fontSize: "14px", fontWeight: "500", color: "gray" }}
              >
                Product discount
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

          {/* second card */}
          <div
            style={{
              marginBottom: 5,

              padding: 10,
              borderColor: "#FFFFFF",
              borderRadius: "10px",
              width: "100%",
              height: "90%",
              // flex: 1,

              // paddingBottom: 860,
              backgroundColor: "#FFFFFF",
              border: "1px solid #FFFFFF",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
              position: "relative",
              marginBottom: -110,
            }}
          >
            {/* <div
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
          </div> */}

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-end",
                flexWrap: "nowrap",
                gap: "2%",
              }}
            >
              <div style={{ width: "70%" }}>
                <Select
                  label={
                    <span style={{ fontWeight: "500" }}>Discount Value</span>
                  }
                  options={filteredValueTypeOptions}
                  value={valueType}
                  onChange={(value) => setValueType(value)}
                />
              </div>
              <div style={{ width: "30%", borderRadius: "20%" }}>
                {/* <PolarisTextField
                label="Discount Value "
                type="number"
                value={value}
                onChange={handleChange}
                error={valueError ? "Invalid Value" : ""}
              /> */}

                <PolarisTextField
                  suffix={valueType !== "fixed_amount" && "%"}
                  prefix={valueType === "fixed_amount" && "$"}
                  // prefix="%"
                  // label="Discount Code"
                  type="number"
                  value={value}
                  onChange={handleChange}
                  error={valueError ? "Invalid Value" : ""}
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                marginBottom: 30,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-end",
                flexWrap: "nowrap",
                gap: "2%",
              }}
            >
              <div style={{ width: "70%" }}>
                <Select
                  label={
                    <span
                      style={{
                        fontWeight: "500",
                        fontSize: "13px",
                        color: "#353535",
                      }}
                    >
                      Applies to
                    </span>
                  }
                  options={filteredAppliesToOptions}
                  value={appliesTo}
                  onChange={(value) => {
                    // setCollectionOptions([]);
                    // setProductOptions([]);
                    setAppliesTo(value);

                    if (appliesTo === "specific_collection") {
                      setProductOptions([]);
                    } else {
                      setCollectionOptions([]);
                    }
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 15 }}>
              <FormLayout condensed>
                <Autocomplete
                  allowMultiple
                  options={options}
                  selected={selectedOptions}
                  onSelect={updateSelection}
                  textField={textField}
                  prefix={<Icon source={SearchMinor} />}
                />
                {productIdsError && (
                  <Text as="p" color="critical">
                    Select atleast a product
                  </Text>
                )}
              </FormLayout>
              {/* <PolarisTextField
              prefix={<Icon source={SearchMinor} />}
              placeholder={`Specific ${
                appliesTo === "specific_collection" ? "collections" : "products"
              }`}
              // label={<span style={{ fontWeight: "500" }}>Discount Value</span>}
              // suffix={valueType !== "fixed_amount" && "%"}
              // prefix={valueType === "fixed_amount" && "$"}
              // prefix="%"
              // label="Discount Code"
              value={newDiscountCode}
              onChange={(value) => setNewDiscountCode(value)}
              error={codeError ? "Discount code is required." : ""}
            /> */}
            </div>
            {/* <div style={{ color: "gray", fontWeight: "500", fontSize: "13px" }}>
            Customer must enter this code at checkout
          </div> */}
            <div style={{ marginBottom: 5, marginTop: 5 }}>
              <LegacyStack spacing="tight">{tagMarkup}</LegacyStack>
            </div>
          </div>
          {/* third card */}
          <div
            style={{
              marginBottom: 5,

              padding: 10,
              borderColor: "#FFFFFF",
              borderRadius: "10px",
              width: "100%",
              height: "90%",
              // flex: 1,

              // paddingBottom: 860,
              backgroundColor: "#FFFFFF",
              border: "1px solid #FFFFFF",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
              position: "relative",
              marginTop: 110,
              marginBottom: -110,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "black",
                marginBottom: 5,
              }}
            >
              Minimum purchase required
            </div>
            <div
              style={{
                // display: "flex",
                // justifyContent: "flex-start",
                // gap: "10px",
                width: "100%",
                marginTop: 10,
              }}
            >
              <ChoiceList
                // title="Company name"
                variant="group"
                choices={[
                  { label: "No minimum requirements", value: "NMR" },
                  {
                    label: "Minimum purhcase amount",
                    value: "MPA",
                    renderChildren,
                  },
                  {
                    label: "Minimum quantity of items",
                    value: "MQI",
                    renderChildren,
                  },
                ]}
                selected={minRequirementSelected}
                onChange={handleChangeMinRequirementSelection}
              />
            </div>
          </div>
          {/* fourth card */}
          <div
            style={{
              marginBottom: 5,

              marginTop: 110,
              // marginTop: 110,
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
                fontSize: "14px",
                fontWeight: "500",
                color: "black",
                marginBottom: 5,
              }}
            >
              Customer eligibility
            </div>
            <div
              style={{
                // display: "flex",
                // justifyContent: "flex-start",
                // gap: "10px",
                width: "100%",
                marginTop: 10,
              }}
            >
              <ChoiceList
                // title="Company name"
                variant="group"
                choices={[
                  { label: "All customers", value: "all" },
                  // { label: "Specific customer segments", value: "SCS" },
                  { label: "Specific customers", value: "SC" },
                ]}
                selected={selected}
                onChange={handleChangeCustomerSelection}
              />
              <div style={{ marginTop: 20 }} />
              {checkselected === "SC" && (
                <FormLayout condensed>
                  <Autocomplete
                    allowMultiple
                    options={_options}
                    selected={_selectedOptions}
                    onSelect={_updateSelection}
                    textField={_textField}
                    prefix={<Icon source={SearchMinor} />}
                  />
                  {CustomerIdsError && (
                    <Text as="p" color="critical">
                      Select atleast a customer
                    </Text>
                  )}
                </FormLayout>
              )}
            </div>
            <div style={{ marginBottom: 5, marginTop: 15 }}>
              <LegacyStack spacing="tight">{_tagMarkup}</LegacyStack>
            </div>
          </div>
          {/* fifth card */}
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
              Maximum discount uses
            </div>
            <div>
              <Checkbox
                label="Limit number of times this discount can be used in total"
                checked={usageLimitchecked}
                onChange={handleChangeUsageLimitChecked}
              />
              {usageLimitchecked && (
                <div style={{ marginLeft: 27, width: "20%" }}>
                  <PolarisTextField
                    type="number"
                    label=""
                    value={usageLimitValue}
                    onChange={(value) => setUsageLimitValue(value)}
                    error={
                      usageLimitCodeError ? "usage limit value required." : ""
                    }
                  />
                </div>
              )}
            </div>
            <div>
              <Checkbox
                label="Limit to one user per customer"
                checked={oneUserPerCustomerchecked}
                onChange={handleChangeoneUserPerCustomerChecked}
              />
            </div>
          </div>
          {/* sixth card */}
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
                fontSize: "14px",
                fontWeight: "500",
                color: "black",
                marginBottom: 5,
              }}
            >
              Active dates
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "10px",
                width: "100%",
              }}
            >
              <FormLayout condensed style={{ flexGrow: 1, width: "100%" }}>
                <PolarisTextField
                  label="Select a start date"
                  type="date"
                  value={selectedDate}
                  onChange={(value) => {
                    setSelectedDate(value);
                  }}
                />
                {codeStartDateError && (
                  <Text as="p" color="critical">
                    Start Date is required.
                  </Text>
                )}
              </FormLayout>

              <PolarisTextField
                label="Start time"
                type="time"
                value={startsAtTime}
                onChange={(value) => {
                  setStartsAtTime(`${value}:00`);
                }}
                style={{ flexGrow: 1, width: "100%" }} // Increases width
              />
            </div>

            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <Checkbox
                label={<span style={{ fontWeight: "500" }}>Set end date</span>}
                checked={checked}
                onChange={handleChangeCheckbox}
              />
            </div>
            {checked && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "flex-start",
                  justifyItems: "center",
                  gap: "10px",
                }}
              >
                {/* <DatePickerMain
                label="Select an end date"
                initialDate={modifyDate(selectedDateEnd)}
                onDateChange={handleDateChangeEnd}
              /> */}

                <FormLayout condensed style={{ flexGrow: 1, width: "100%" }}>
                  <PolarisTextField
                    label="Select a start date"
                    type="date"
                    value={selectedDateEnd}
                    onChange={(value) => {
                      setSelectedDateEnd(value);
                    }}
                  />
                </FormLayout>
                <PolarisTextField
                  label="End time"
                  type="time"
                  value={endAtTime}
                  onChange={(value) => {
                    setEndAtTime(`${value}:00`);
                  }}
                  // error={codeStartDateError ? "Start Date is required." : ""}
                />
              </div>
            )}
          </div>
        </div>
        {/* summary card */}
        <div
          style={{
            width: "30%",
            height: "40%",
            // flex: 1,
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #FFFFFF",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
            // position: "fixed",
            // alignContent: "flex-end",
            // alignSelf: "self-end", // Ensure it stays at the top
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Summary
          </span>

          <div
            style={{
              marginTop: 10,
              marginBottom: 20,
              fontSize: "12px",
              color: "gray",
              fontWeight: "500",
            }}
          >
            {newDiscountCode ? newDiscountCode : "No discount code yet"}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Type and method
          </span>
          <div style={defaultListStyle}>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {items.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={bulletStyle}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* <button onClick={() => addItem("New Point")}>Add Point</button> */}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Details
          </span>
          <div style={defaultListStyle}>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {items_two.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={bulletStyle}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* <button onClick={() => addItem_two("New Point")}>Add Point</button> */}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Performance
          </span>
          <div
            style={{
              marginTop: 10,
              marginBottom: 10,
              fontSize: "12px",
              color: "gray",
              fontWeight: "500",
            }}
          >
            Discount is not active yet
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 15,
          marginBottom: 15,
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        {!modalLoader && (
          <button
            // loading={modalLoader}
            onClick={() => navigate("/")}
            primary
            style={{
              // borderColor: "transparent",
              backgroundColor: "white",
              color: "black",
              borderRadius: "8px", // Adjust the radius as needed
              height: "26px", // Adjust the height as needed
              padding: "0 14px", // Adjust padding as needed
              fontWeight: "bold", // Optional, for text styling
              fontSize: "12px",
              borderColor: "#FFFFFF",
              cursor: "default", // Default cursor
              border: "1px solid #FFFFFF",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect          }}
            }}
          >
            Discard
          </button>
        )}
        <button
          // loading={modalLoader}
          onClick={() =>
            isAutomatic ? createDiscount() : handleCreateDiscount()
          }
          primary
          style={{
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
          {modalLoader ? (
            <Spinner
              color="white"
              accessibilityLabel="Small spinner example"
              size="small"
            />
          ) : (
            "Create Discount"
          )}
        </button>
      </div>
    </Page>
  );
}
