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
import spinner from "../assets/spin.gif";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import DatePickerMain from "../components/DatePicker";
import { check } from "prettier";
import { createApp } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import DiscountCodeUI from "../components/DiscountCodeUI";
import DiscountCombinationUI from "../components/DiscountCombinationUI";
// import { useNavigate } from "@shopify/app-bridge-react";

export default function AddDiscountOrder() {
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
  const [countriesIds, setCountriesIds] = useState([]);
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
  const [excludeShippingRates, setExcludeShippingRates] = useState(false);
  const [excludeShippingRatesValue, setExcludeShippingRatesValue] = useState(0);
  const [excludeShippingRatesValueError, setExcludeShippingRatesValueError] =
    useState(false);
  const fetch = useAuthenticatedFetch();
  const [minRequirementSelected, setMinRequirementSelected] = useState("NMR");
  const [selected, setSelected] = useState("all");
  const [customerSelected, setCustomerSelected] = useState("all");
  const [purchaseTypeSelected, setPurchaseTypeSelected] = useState("otp");
  const [subscriptionProductsError, setSubscriptionProductsError] =
    useState(false);
  const [checkselected, setCheckSelected] = useState("all");
  const [checkCustomerSelected, setCheckCustomerSelected] = useState("all");
  const [currencyCode, setCurrencyCode] = useState("");
  const [minRequirementCheckselected, setMinRequirementCheckSelected] =
    useState("NMR");
  console.log("check selected", checkselected);
  const [textFieldValue, setTextFieldValue] = useState("");
  const handleTextFieldChange = useCallback(
    (value) => setTextFieldValue(value),
    []
  );

  useEffect(() => {
    if (minRequirementCheckselected === "MPA") {
      setMinQuantityReq(0);
    } else if (minRequirementCheckselected === "MQI") {
      setMinPurchaseReq(0);
    }
  }, [minRequirementCheckselected, minPurchaseReq, minQuantityReq]);
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
  const handleChangeCountriesSelection = useCallback((value) => {
    {
      const [_selected] = value;
      setCheckSelected(_selected);
      setSelected(value);
    }
  }, []);
  const handleChangeCustomerSelection = useCallback((value) => {
    {
      const [_selected] = value;
      setCheckCustomerSelected(_selected);
      setCustomerSelected(value);
    }
  }, []);
  const handleChangePurhcaseTypeSelection = useCallback((value) => {
    {
      setPurchaseTypeSelected(value);
    }
  }, []);
  const handleChangeMinRequirementSelection = useCallback((value) => {
    {
      const [_selected] = value;
      setMinRequirementCheckSelected(_selected);
      setMinRequirementSelected(value);
    }
  }, []);

  const handleChangeUsageLimitChecked = (checked) => {
    setUsageLimitchecked((prev) => !prev);
    if (!usageLimitchecked) {
      setUsageLimitValue(0);
    }
  };
  const handleChangeIsProductChecked = (checked) => {
    setIsProductDiscount((prev) => !prev);
  };
  const handleChangeIsOrderChecked = (checked) => {
    setIsOrderDiscount((prev) => !prev);
  };
  const handleChangeoneUserPerCustomerChecked = (checked) => {
    setOneUserPerCustomerchecked((prev) => !prev);
  };
  const handleExcludeShippingRates = (checked) => {
    setExcludeShippingRates((prev) => !prev);
    if (!excludeShippingRates) {
      setExcludeShippingRatesValue(0);
      setExcludeShippingRatesValueError(false);
    }
  };
  const valueTypeOptions = [
    { label: "Fixed Amount", value: "fixed_amount" },
    { label: "Percentage", value: "percentage" },
  ];
  const valuePurchaseOptions = [
    { label: "One-time purhcase", value: "otp" },
    // { label: "Specific customer segments", value: "SCS" },
    { label: "Subscription", value: "sub" },
    { label: "Both", value: "both" },
  ];
  const filteredValueTypeOptions =
    targetType === "shipping_line"
      ? [{ label: "Percentage", value: "percentage" }]
      : valueTypeOptions;

  const [selectedTags, setSelectedTags] = useState([]);

  const [_selectedTags, set_SelectedTags] = useState([]);
  const [checked, setChecked] = useState(false);
  const [CustomerOptions, setCustomerOptions] = useState([]);
  const [CountriesIdsError, setCountriesIdsError] = useState(false);
  const [customerIdsError, setCustomerIdsError] = useState(false);
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

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [_selectedOptions, set_SelectedOptions] = useState([]);
  const [CountriesOptions, setCountriesOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [_inputValue, set_InputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [_options, set_Options] = useState([]);
  const [subscriptionProducts, setSubscriptionProducts] = useState([]);
  const [oneTimePurchaseProducts, setOneTimePurchaseProducts] = useState([]);
  const [isProductDiscount, setIsProductDiscount] = useState(false);

  const [isOrderDiscount, setIsOrderDiscount] = useState(false);

  useEffect(() => {
    const updatedOptions = CountriesOptions.map((collection) => ({
      value: collection.value,
      label: collection.label,
    }));

    set_Options(updatedOptions);
  }, [CountriesOptions]);
  useEffect(() => {
    const updatedOptions = CustomerOptions.map((customer) => ({
      value: customer.value,
      label: customer.label,
    }));

    setOptions(updatedOptions);
  }, [CustomerOptions]);
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

  console.log(options, "000000000000000000000000");
  const _updateText = useCallback(
    (value) => {
      set_InputValue(value);

      if (value === "") {
        set_Options(
          CountriesOptions.length > 0
            ? CountriesOptions.map((collection) => ({
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
          CustomerOptions.map((customer) => ({
            value: customer.value,
            label: customer.label,
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
    const formattedTime = convertTo12HourFormat(
      `${formattedHours}:${formattedMinutes}`
    ); // Convert 24-hour to 12-hour

    // Return formatted time string
    return `${formattedHours}:${formattedMinutes}`;
  }
  const updateSelection = useCallback(
    (selected) => {
      if (prodIds.length > 0) {
        setProductIdsError(false);
      }
      setSelectedOptions(selected);

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
        setCountriesIdsError(false);
      }
      set_SelectedOptions(selected);

      setCountriesIds((prev) => {
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
  const [items, setItems] = useState(["Free shipping", "Code"]);
  const [items_two, setItems_two] = useState([
    "Can't combine with other discounts",
  ]);

  const handleFetchCollectionPopulate = async () => {
    await fetch("api/get-collections?limit=50", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Assuming the response is in JSON format
      })
      .then((data) => {
        console.log("checker:", data.data); // This will log the fetched products

        // return;
        // You can now use the 'data' variable to access your fetched products
        // Mapping the products data to the desired format
        const formattedCollection = data.data.map((collection) => ({
          label: collection.title,
          value: collection.id,
        }));
        console.log(
          "Fetched collections now from backend:",
          formattedCollection
        ); // Debugging line
        // const deselectedOptions = useMemo(() => formattedCollection, []);
        // console.log(formattedCollection);
        setCollectionOptions(formattedCollection);
        // setIsLoading(false);
      })
      .catch((error) => {
        // setIsLoading(false);
        console.log("Fetched collections There was an error:", error);
      });
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
  const handleGetShopInfo = async () => {
    // setIsLoading(true);

    await fetch("api/shop/data", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Assuming the response is in JSON format
      })
      .then((data) => {
        console.log("checker shop info:", data); // This will log the fetched products
        setCurrencyCode(data.currencyCode);
      })
      .catch((error) => {
        // setIsLoading(false);
        console.log("error fetching shop info:", error);
      });
  };
  useEffect(() => {
    // fetchDiscounts();
    handleFetchCountries();
    handleFetchCustomers();
    handleFetchPopulate();
    handleGetShopInfo();
    // handleFetchCollectionPopulate();
  }, []);
  useEffect(() => {
    // fetchDiscounts();
    if (appliesTo === "specific_collection") {
      handleFetchCollectionPopulate();
    } else {
      handleFetchPopulate();
    }
  }, [appliesTo]);

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

  function getFormattedTimezoneOffset() {
    const date = new Date();
    const offset = date.getTimezoneOffset(); // Offset in minutes (negative if ahead of UTC, positive if behind)

    // Convert the offset to hours and minutes
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;

    // Determine if it's ahead or behind UTC
    const sign = offset <= 0 ? "+" : "-";

    // Format the result as +HH:MM or -HH:MM
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }

  const handleCreateDiscount = async () => {
    //    setStartsAtTime(formatInitials(startsAtTime))
    //    if(checked){
    //    setEndAtTime(formatInitials(startsAtTime)) ;
    //    }

    // console.log("customer ids", customerIds);
    // return;
    let isValid = false;
    try {
      setModalLoader(true);
      isValid = true;
      if (minRequirementCheckselected === "MPA" && !minPurchaseReq) {
        setMinPurchaseReqError(true);
        isValid = false;
        setModalLoader(false);
        return;
      } else {
        setMinPurchaseReqError(false);
      }
      if (minRequirementCheckselected === "MQI" && !minQuantityReq) {
        setMinQuantityReqError(true);
        isValid = false;
        setModalLoader(false);
        return;
      } else {
        setMinQuantityReqError(false);
      }
      if (
        (checkselected === "SC" || checkselected === "SCS") &&
        countriesIds.length === 0
      ) {
        setCountriesIdsError(true);
        isValid = false;
        setModalLoader(false);
        return;
      } else {
        isValid = true;
        setCountriesIdsError(false);
      }
      if (
        (checkCustomerSelected === "SC" || checkCustomerSelected === "SCS") &&
        customerIds.length === 0
      ) {
        setCustomerIdsError(true);
        isValid = false;
        setModalLoader(false);
        return;
      } else {
        isValid = true;
        setCustomerIdsError(false);
      }

      if (usageLimitchecked && usageLimitValue === 0) {
        isValid = false;
        setUsageLimitCodeError(true);
        setModalLoader(false);
        return;
      } else {
        setUsageLimitCodeError(false);
        isValid = true;
      }
      if (!newDiscountCode) {
        setCodeError(true);

        isValid = false;
        setModalLoader(false);
        return;
        // const newLocal = (isValid = false);
      } else {
        setCodeError(false);
      }

      if (!selectedDate) {
        console.log("entring");
        setCodeStartDateError(true);

        isValid = false;
        setModalLoader(false);
        return;
        // return;
      } else {
        isValid = true;
        setCodeStartDateError(false);
      }
      if (usageLimitchecked && !usageLimitValue) {
        isValid = false;
        setUsageLimitCodeError(true);
        setModalLoader(false);
        return;
      } else {
        setUsageLimitCodeError(false);
        isValid = true;
      }
      if (
        purchaseTypeSelected === "otp" &&
        oneTimePurchaseProducts.length === 0
      ) {
        isValid = false;
        setModalLoader(false);
        return;
      } else {
        isValid = true;
      }

      if (
        purchaseTypeSelected !== "otp" &&
        excludeShippingRates &&
        excludeShippingRatesValue === 0
      ) {
        isValid = false;
        setExcludeShippingRatesValueError(true);
        setModalLoader(false);
        return;
      } else {
        setExcludeShippingRatesValueError(false);
        isValid = true;
      }
      if (purchaseTypeSelected === "sub" && subscriptionProducts.length === 0) {
        isValid = false;
        setSubscriptionProductsError(true);
        setModalLoader(false);
        return;
      } else {
        setSubscriptionProductsError(false);
        isValid = true;
      }

      if (valueType === "percentage" && (!value || value < 1 || value > 100)) {
        setValueError(true);
        isValid = false;
        setModalLoader(false);
        return;
      } else if (valueType === "fixed_amount" && (!value || value < 1)) {
        setValueError(true);
        isValid = false;
        setModalLoader(false);
        return;
      } else {
        setValueError(false);
        isValid = true;
      }
      console.log("isvalid...", startsAtTime, getFormattedTimezoneOffset());

      // return;
      const newDiscount = {
        price_rule: {
          title: newDiscountCode,
          value_type: valueType, // fixed_amount  OR percentage
          value: `-${value}`,
          customer_selection:
            checkCustomerSelected === "SC" || checkCustomerSelected === "SCS"
              ? "prerequisite"
              : "all",
          target_type: "line_item", //line_item: The price rule applies to the cart's line items. OR shipping_line: The price rule applies to the cart's shipping lines.
          target_selection: "all", //all: The price rule applies the discount to all line items in the checkout. OR entitled: The price rule applies the discount to selected entitlements only.
          allocation_method: "across", // each discount applies to single item we choosen OR accross discount applies to all items in the checkout cart.
          starts_at:
            extractDate(selectedDate) === new Date().toDateString()
              ? `${handleDateChange(new Date(), true)}Z`
              : `${selectedDate}T${startsAtTime}:00${getFormattedTimezoneOffset()}`,
          ...(checked && {
            ends_at: checked
              ? `${selectedDateEnd}T${endAtTime}:00${getFormattedTimezoneOffset()}`
              : null,
          }),
          // Make sure entitled_product_ids is an array
          ...(purchaseTypeSelected &&
            purchaseTypeSelected !== "otp" && {
            entitled_product_ids:
              purchaseTypeSelected === "sub"
                ? subscriptionProducts
                : [...oneTimePurchaseProducts, ...subscriptionProducts], // Concatenates the two arrays
          }),

          // Conditionally add prerequisite if minRequirementCheckselected is "MPA"
          ...(minRequirementCheckselected === "MPA" &&
            minPurchaseReq && {
            prerequisite_subtotal_range: {
              greater_than_or_equal_to: minPurchaseReq,
            },
          }),

          // Conditionally add prerequisite if minRequirementCheckselected is "MQI"
          ...(minRequirementCheckselected === "MQI" &&
            minQuantityReq && {
            prerequisite_to_entitlement_quantity_ratio: {
              prerequisite_quantity: minQuantityReq,
              entitled_quantity: 1,
            },
            prerequisite_product_ids: prodIds, // Only add when MQI is selected
          }),
          // Add prerequisite_customer_ids if applicable
          ...(checkCustomerSelected === "SC" ||
            (checkCustomerSelected === "SCS" && customerIds.length > 0)
            ? { prerequisite_customer_ids: customerIds }
            : {}),

          //exclude shipping rates value
          ...(excludeShippingRates &&
            excludeShippingRatesValue > 0 && {
            hasExcludeShippingRatesOver: { value: true },
            excludeShippingRatesOver: {
              value: excludeShippingRatesValue + ".00",
            },
          }),

          usage_limit: usageLimitValue,
          once_per_customer: !!oneUserPerCustomerchecked,
          combinesWithProductDiscounts: isProductDiscount,
          combinesWithOrderDiscounts: isOrderDiscount,
        },
        discount_code: newDiscountCode,
        discount_type: "order",
      };

      console.log("payloardCheckup...", newDiscount);

      console.log("dynamic->>>>>>", targetSelection);

      //  return;
      //  console.log('hardcode->>>>>>',_newDiscount)
      const response = await fetch("/api/add-discount-code", {
        method: "POST",
        body: JSON.stringify(newDiscount),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json(); // Assuming the response is in JSON format
        })
        .then((data) => {
          console.log("checker price rule add:", data); // This will log the fetched products

          return data.data;
          // You can now use the 'data' variable to access your fetched products
          // Mapping the products data to the desired format
          const formattedCollection = data.data.map((collection) => ({
            label: collection.title,
            value: collection.id,
          }));
          console.log(
            "Fetched collections now from backend:",
            formattedCollection
          ); // Debugging line
          // const deselectedOptions = useMemo(() => formattedCollection, []);
          // console.log(formattedCollection);
          setCollectionOptions(formattedCollection);
          // setIsLoading(false);
        })
        .catch((error) => {
          // setIsLoading(false);
          console.log("Fetched collections There was an error:", error);
          return error;
        });
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
      setCustomerIdsError(false);
      setCustomerIds([]);
      setMinRequirementCheckSelected("NMR");
      setMinRequirementSelected("NMR");
      setSelectedTags([]);
      set_SelectedTags([]);
      setShippingDiscountValue("");
      setCustomerSelection("all");
      setStartsAtTime("");
      setEndAtTime("");
      setDiscountCodeType("");
      setPrerequisiteToEntitlementQuantityRatio([]);
      setShippingError(false);
      setCodeStartDateError(false);
      setProductIdsError(false);
      setTitleError(false);
      setMinPurchaseReq(0);
      setMinQuantityReq(0);
      setAmountError(false);
      setExpiryError(false);
      setCodeError(false);
      setTypeError(false);
      setValueError(false);
      setCustomerSelectionError(false);
      setIsModalOpen(false);
      setSelectedDate();
      setStartsAtTime();
      setEndAtTime();
      setSelectedDateEnd();
      setProdIds([]);
      setUsageLimitValue(0);
      setUsageLimitchecked(false);
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
      if (isValid) {
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
        setCustomerIdsError(false);
        setCustomerIds([]);
        setMinRequirementCheckSelected("NMR");
        setMinRequirementSelected("NMR");
        setSelectedTags([]);
        set_SelectedTags([]);
        setShippingDiscountValue("");
        setCustomerSelection("all");
        setStartsAtTime("");
        setEndAtTime("");
        setDiscountCodeType("");
        setPrerequisiteToEntitlementQuantityRatio([]);
        setShippingError(false);
        setCodeStartDateError(false);
        setProductIdsError(false);
        setTitleError(false);
        setMinPurchaseReq(0);
        setMinQuantityReq(0);
        setAmountError(false);
        setExpiryError(false);
        setCodeError(false);
        setTypeError(false);
        setValueError(false);
        setCustomerSelectionError(false);
        setIsModalOpen(false);
        setSelectedDate();
        setStartsAtTime();
        setEndAtTime();
        setSelectedDateEnd();
        setProdIds([]);
        setUsageLimitValue(0);
        setUsageLimitchecked(false);
        // toggleActive();
        // toastMarkup("Discount Added Successfull");
        const data = { status: true };

        // navigate("/", { state: data });
        // setToastVisible(true);
        // fetchDiscounts();

        // document.getElementById("discount-section").scrollIntoView();
        navigate("/", { state: data });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setToastVisible(false);
    }, 4000);

    // Cleanup the timeout if the component unmounts before the timeout completes
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleFetchPopulate = async () => {
    setIsLoading(true);

    await fetch("api/prod", { method: "GET" })
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

        console.log("Fetched products:", data); // Debugging line
        // return;
        // Filter out one-time purchase products (products without subscription tags)
        // Filter out one-time purchase products (products without subscription tags)
        const oneTimeProd = data.data
          .filter((product) => !product.tags.includes("subscription"))
          .map((product) => product.id); // Return only the IDs

        // Filter out subscription-based products (products with the 'subscription' tag)
        const subProd = data.data
          .filter((product) => product.tags.includes("subscription"))
          .map((product) => product.id); // Return only the IDs
        setSubscriptionProducts(subProd);
        setOneTimePurchaseProducts(oneTimeProd);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("There was an error fetching the products:", error);
      });
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
  const handleFetchCountries = async () => {
    setIsLoading(true);

    await fetch("api/countries", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Assuming the response is in JSON format
      })
      .then((data) => {
        const formattedCountries = data.data.map((countries) => ({
          label: countries.name,
          value: countries.id,
        }));

        setCountriesOptions(formattedCountries);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("There was an error fetching the customers:", error);
      });
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
      placeholder="Search customers"
    />
  );
  const _textField = (
    <Autocomplete.TextField
      labelHidden
      placeholder="Search Countries"
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
      setCountriesIds((prev) => {
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

  const handleChange = (event) => {
    const inputValue = event;
    // Convert the value to a negative number
    const val = Math.abs(Number(inputValue));

    if (valueType === "percentage" && val > 100) return;
    setValue(val);
  };

  function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12; // Convert 0 hours to 12 for AM
    return `${adjustedHours}:${minutes} ${period}`;
  }

  return (
    <Page
      backAction={{ content: "Settings", url: "/" }}
      title="Create order discount"
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
          <DiscountCodeUI
            handleRandomCodeGenerate={handleRandomCodeGenerate}
            newDiscountCode={newDiscountCode}
            setNewDiscountCode={setNewDiscountCode}
            codeError={codeError}
            topLeftBannerName="Amount off order"
            topRightBannerName="Order discount"
          />
          {/* second card */}
          <div
            style={{
              // marginBottom: 5,

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
            <span style={{ fontWeight: "500" }}>Discount Value</span>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ width: "70%" }}>
                <Select
                  // label={
                  // }
                  options={filteredValueTypeOptions}
                  value={valueType}
                  onChange={(value) => setValueType(value)}
                />
              </div>
              <div style={{ width: "30%", borderRadius: "20%" }}>
                <PolarisTextField
                  suffix={valueType !== "fixed_amount" && "%"}
                  prefix={
                    valueType === "fixed_amount" &&
                    `${currencyCode === "USD" ? "$" : currencyCode}`
                  }
                  // prefix="%"
                  // label="Discount Code"
                  type="number"
                  value={value}
                  onChange={handleChange}
                  error={valueError ? "Invalid Value" : ""}
                />
              </div>
            </div>
            {/* Purchase type card */}
            <Select
              label={
                <span
                  style={{
                    fontWeight: "500",
                    marginBottom: 4,
                    fontSize: "13px",
                  }}
                >
                  Purchase type
                </span>
              }
              options={valuePurchaseOptions}
              value={purchaseTypeSelected}
              onChange={handleChangePurhcaseTypeSelection}
            />
            {subscriptionProductsError && (
              <div
                style={{
                  color: "red",
                  width: "100%",
                  marginLeft: 1,
                  marginTop: 5,
                }}
              >
                you don't have products that have subscription tags,choose other
                option or add tags to products
              </div>
            )}
          </div>
          {/* third card */}
          <div
            style={{
              // marginBottom: 5,
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
                selected={customerSelected}
                onChange={handleChangeCustomerSelection}
              />
              <div style={{ marginTop: 20 }} />
              {checkCustomerSelected === "SC" && (
                <FormLayout condensed>
                  <Autocomplete
                    allowMultiple
                    options={options}
                    selected={selectedOptions}
                    onSelect={updateSelection}
                    textField={textField}
                    prefix={<Icon source={SearchMinor} />}
                  />
                  {customerIdsError && (
                    <Text as="p" color="critical">
                      Select atleast a customer
                    </Text>
                  )}
                </FormLayout>
              )}
            </div>
            <div style={{ marginBottom: 5, marginTop: 15 }}>
              <LegacyStack spacing="tight">{tagMarkup}</LegacyStack>
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
          {/* <DiscountCombinationUI
            isOrderDiscount={isOrderDiscount}
            isProductDiscount={isProductDiscount}
            handleChangeisOrderDiscount={handleChangeIsOrderChecked}
            handleChangeisProductDiscount={handleChangeIsProductChecked}
            showShippingDiscount={false}
          /> */}
          {/* seventh card */}
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
                // justifyContent: "flex-start",
                gap: "10px",
                width: "100%",
              }}
            >
              <div
                style={{
                  // backgroundColor: "yellow",
                  display: "flex",
                  flexDirection: "row",
                  // flexGrow: 1,
                  // justifyContent: "space-between",
                  width: "100%",
                  gap: "12px",
                }}
              >
                <div
                  style={{ flex: 1, width: "50%" }} // Increases width
                >
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
                </div>
                <div
                  style={{ flex: 1, width: "50%" }} // Increases width
                >
                  <PolarisTextField
                    label="Start time"
                    type="time"
                    value={startsAtTime}
                    onChange={(value) => {
                      setStartsAtTime(value);
                    }}
                    style={{ flexGrow: 1, width: "100%" }} // Increases width
                  />
                </div>
              </div>
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
                  // justifyContent: "flex-start",
                  gap: "10px",
                  width: "100%",
                }}
              >
                {/* <DatePickerMain
                label="Select an end date"
                initialDate={modifyDate(selectedDateEnd)}
                onDateChange={handleDateChangeEnd}
              /> */}

                <div
                  style={{
                    // backgroundColor: "yellow",
                    display: "flex",
                    flexDirection: "row",
                    // flexGrow: 1,
                    // justifyContent: "space-between",
                    width: "100%",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{ flex: 1, width: "50%" }} // Increases width
                  >
                    <PolarisTextField
                      label="Select an end date"
                      type="date"
                      value={selectedDateEnd}
                      onChange={(value) => {
                        setSelectedDateEnd(value);
                      }}
                    />
                  </div>
                  <div
                    style={{ flex: 1, width: "50%" }} // Increases width
                  >
                    <PolarisTextField
                      label="End time"
                      type="time"
                      value={endAtTime}
                      onChange={(value) => {
                        setEndAtTime(value);
                      }}
                    // error={codeStartDateError ? "Start Date is required." : ""}
                    />
                  </div>
                </div>
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
      {/* cancel and save buttons */}
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
            <img
              src={spinner}
              alt="Loading..."
              style={{ width: "20px", height: "20px" }}
            />
          ) : (
            "Create Discount"
          )}
        </button>
      </div>
    </Page>
  );
}

// "{\"title\":{\"type\":\"string\"},\"discountCode\":{\"type\":\"string\"},\"discountType\":{\"type\":\"string\"},\"discountMethod\":{\"type\":\"string\"},\"discountClass\":{\"type\":\"string\"},\"endsAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"hasEndDate\":{\"type\":\"boolean\"},\"oncePerCustomer\":{\"type\":\"boolean\"},\"startsAt\":{\"type\":\"string\",\"format\":\"date-time\"},\"totalUsageLimit\":{\"type\":\"string\"},\"hasUsageLimit\":{\"type\":\"boolean\"},\"customerEligibility\":{\"type\":\"string\"},\"selectedCustomers\":{\"type\":\"array\",\"items\":{}},\"selectedCustomerGroups\":{\"type\":\"array\",\"items\":{}},\"selectedCustomerSegments\":{\"type\":\"array\",\"items\":{}},\"combinesWithProductDiscounts\":{\"type\":\"boolean\"},\"combinesWithOrderDiscounts\":{\"type\":\"boolean\"},\"combinesWithShippingDiscounts\":{\"type\":\"boolean\"},\"appliesTo\":{\"type\":\"string\"},\"selectedCollections\":{\"type\":\"array\",\"items\":{}},\"selectedProductVariantsDescriptors\":{\"type\":\"array\",\"items\":{}},\"percentageDiscountValue\":{\"type\":\"string\"},\"fixedAmountDiscountValue\":{\"type\":\"string\"},\"discountValueType\":{\"type\":\"string\"},\"oncePerOrder\":{\"type\":\"boolean\"},\"minimumRequirement\":{\"type\":\"string\"},\"minimumRequirementQuantity\":{\"type\":\"string\"},\"minimumRequirementSubtotal\":{\"type\":\"string\"},\"freeShippingPurchaseType\":{\"type\":\"string\"},\"recurringPaymentType\":{\"type\":\"string\"},\"purchaseType\":{\"type\":\"string\"},\"multiplePaymentsLimit\":{\"type\":\"string\"},\"bxgyHasAllocationLimit\":{\"type\":\"boolean\"},\"bxgyAllocationLimit\":{\"type\":\"string\"},\"bxgyCustomerBuysValueType\":{\"type\":\"string\"},\"bxgyCustomerBuysType\":{\"type\":\"string\"},\"bxgyCustomerBuysCollections\":{\"type\":\"array\",\"items\":{}},\"bxgyCustomerBuysProducts\":{\"type\":\"array\",\"items\":{}},\"bxgyCustomerBuysQuantity\":{\"type\":\"string\"},\"bxgyCustomerBuysAmount\":{\"type\":\"string\"},\"bxgyCustomerGetsType\":{\"type\":\"string\"},\"bxgyCustomerGetsCollections\":{\"type\":\"array\",\"items\":{}},\"bxgyCustomerGetsProducts\":{\"type\":\"array\",\"items\":{}},\"bxgyCustomerGetsQuantity\":{\"type\":\"string\"},\"bxgyCustomerGetsDiscountType\":{\"type\":\"string\"},\"bxgyCustomerGetsDiscountAmount\":{\"type\":\"string\"},\"bxgyCustomerGetsDiscountPercentage\":{\"type\":\"string\"},\"selectedCountries\":{\"type\":\"array\",\"items\":{}},\"countriesSelectionType\":{\"type\":\"string\"},\"hasExcludeShippingRatesOver\":{\"type\":\"boolean\"},\"excludeShippingRatesOver\":{\"type\":\"string\"},\"channelIds\":{\"type\":\"array\",\"items\":{}},\"metafields\":{\"type\":\"array\",\"items\":{}}}"
// "{\"title\":{\"value\":\"\"},\"discountCode\":{\"value\":\"CWX16TCBKMNP\"},\"discountType\":{\"value\":\"FreeShipping\"},\"discountMethod\":{\"value\":\"Code\"},\"discountClass\":{\"value\":\"SHIPPING\"},\"endsAt\":{\"value\":\"2024-09-20T05:59:46.925Z\"},\"hasEndDate\":{\"value\":false},\"oncePerCustomer\":{\"value\":false},\"startsAt\":{\"value\":\"2024-09-20T05:59:46.925Z\"},\"totalUsageLimit\":{\"value\":\"\"},\"hasUsageLimit\":{\"value\":false},\"customerEligibility\":{\"value\":\"EVERYONE\"},\"selectedCustomers\":{\"value\":[]},\"selectedCustomerGroups\":{\"value\":[]},\"selectedCustomerSegments\":{\"value\":[]},\"f\":{\"value\":false},\"combinesWithOrderDiscounts\":{\"value\":false},\"combinesWithShippingDiscounts\":{\"value\":false},\"appliesTo\":{\"value\":\"ORDER\"},\"selectedCollections\":{\"value\":[]},\"selectedProductVariantsDescriptors\":{\"value\":[]},\"percentageDiscountValue\":{\"value\":\"\"},\"fixedAmountDiscountValue\":{\"value\":\"\"},\"discountValueType\":{\"value\":\"PERCENTAGE\"},\"oncePerOrder\":{\"value\":true},\"minimumRequirement\":{\"value\":\"NONE\"},\"minimumRequirementQuantity\":{\"value\":\"\"},\"minimumRequirementSubtotal\":{\"value\":\"\"},\"freeShippingPurchaseType\":{\"value\":\"ONE_TIME_PURCHASE\"},\"recurringPaymentType\":{\"value\":\"FIRST_PAYMENT\"},\"purchaseType\":{\"value\":\"ONE_TIME_PURCHASE\"},\"multiplePaymentsLimit\":{\"value\":\"\"},\"bxgyHasAllocationLimit\":{\"value\":false},\"bxgyAllocationLimit\":{\"value\":\"\"},\"bxgyCustomerBuysValueType\":{\"value\":\"QUANTITY\"},\"bxgyCustomerBuysType\":{\"value\":\"PRODUCTS\"},\"bxgyCustomerBuysCollections\":{\"value\":[]},\"bxgyCustomerBuysProducts\":{\"value\":[]},\"bxgyCustomerBuysQuantity\":{\"value\":\"\"},\"bxgyCustomerBuysAmount\":{\"value\":\"\"},\"bxgyCustomerGetsType\":{\"value\":\"PRODUCTS\"},\"bxgyCustomerGetsCollections\":{\"value\":[]},\"bxgyCustomerGetsProducts\":{\"value\":[]},\"bxgyCustomerGetsQuantity\":{\"value\":\"\"},\"bxgyCustomerGetsDiscountType\":{\"value\":\"PERCENTAGE\"},\"bxgyCustomerGetsDiscountAmount\":{\"value\":\"\"},\"bxgyCustomerGetsDiscountPercentage\":{\"value\":\"\"},\"selectedCountries\":{\"value\":[]},\"countriesSelectionType\":{\"value\":\"ALL_COUNTRIES\"},\"hasExcludeShippingRatesOver\":{\"value\":true},\"excludeShippingRatesOver\":{\"value\":\"21.00\"},\"channelIds\":{\"value\":[]},\"metafields\":{\"value\":[]}}"
// "{\"title\":{\"value\":\"CC_S9739R00YS\"},\"discountCode\":{\"value\":\"CC_S9739R00YS\"},\"discountType\":{\"value\":\"FreeShipping\"},\"discountMethod\":{\"value\":\"Code\"},\"discountClass\":{\"value\":\"SHIPPING\"},\"endsAt\":{\"value\":\"2024-09-22T03:59:59.999Z\"},\"hasEndDate\":{\"value\":false},\"oncePerCustomer\":{\"value\":false},\"startsAt\":{\"value\":\"2024-09-21T22:07:00.000Z\"},\"totalUsageLimit\":{\"value\":\"\"},\"hasUsageLimit\":{\"value\":false},\"customerEligibility\":{\"value\":\"EVERYONE\"},\"selectedCustomers\":{\"value\":[]},\"selectedCustomerGroups\":{\"value\":[]},\"selectedCustomerSegments\":{\"value\":[]},\"combinesWithProductDiscounts\":{\"value\":false},\"combinesWithOrderDiscounts\":{\"value\":true},\"combinesWithShippingDiscounts\":{\"value\":false},\"appliesTo\":{\"value\":\"ORDER\"},\"selectedCollections\":{\"value\":[]},\"selectedProductVariantsDescriptors\":{\"value\":[]},\"percentageDiscountValue\":{\"value\":\"\"},\"fixedAmountDiscountValue\":{\"value\":\"\"},\"discountValueType\":{\"value\":\"PERCENTAGE\"},\"oncePerOrder\":{\"value\":true},\"minimumRequirement\":{\"value\":\"NONE\"},\"minimumRequirementQuantity\":{\"value\":\"\"},\"minimumRequirementSubtotal\":{\"value\":\"\"},\"freeShippingPurchaseType\":{\"value\":\"ONE_TIME_PURCHASE\"},\"recurringPaymentType\":{\"value\":\"FIRST_PAYMENT\"},\"purchaseType\":{\"value\":\"ONE_TIME_PURCHASE\"},\"multiplePaymentsLimit\":{\"value\":\"\"},\"bxgyHasAllocationLimit\":{\"value\":false},\"bxgyAllocationLimit\":{\"value\":\"\"},\"bxgyCustomerBuysValueType\":{\"value\":\"QUANTITY\"},\"bxgyCustomerBuysType\":{\"value\":\"PRODUCTS\"},\"bxgyCustomerBuysCollections\":{\"value\":[]},\"bxgyCustomerBuysProducts\":{\"value\":[]},\"bxgyCustomerBuysQuantity\":{\"value\":\"\"},\"bxgyCustomerBuysAmount\":{\"value\":\"\"},\"bxgyCustomerGetsType\":{\"value\":\"PRODUCTS\"},\"bxgyCustomerGetsCollections\":{\"value\":[]},\"bxgyCustomerGetsProducts\":{\"value\":[]},\"bxgyCustomerGetsQuantity\":{\"value\":\"\"},\"bxgyCustomerGetsDiscountType\":{\"value\":\"PERCENTAGE\"},\"bxgyCustomerGetsDiscountAmount\":{\"value\":\"\"},\"bxgyCustomerGetsDiscountPercentage\":{\"value\":\"\"},\"selectedCountries\":{\"value\":[]},\"countriesSelectionType\":{\"value\":\"ALL_COUNTRIES\"},\"hasExcludeShippingRatesOver\":{\"value\":false},\"excludeShippingRatesOver\":{\"value\":\"\"},\"channelIds\":{\"value\":[]},\"metafields\":{\"value\":[]}}"
