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
// import { useNavigate } from "@shopify/app-bridge-react";

export default function AddDiscount() {
  const navigate = useNavigate();
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
  const [appliesTo, setAppliesTo] = useState("specific_product");
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
  const [codeStartDateError, setCodeStartDateError] = useState(false);
  const [customerSelection, setCustomerSelection] = useState("all");
  const [customerSelectionError, setCustomerSelectionError] = useState(false);
  const [productIdsError, setProductIdsError] = useState(false);
  const [startsAtTime, setStartsAtTime] = useState(formatTime(new Date()));
  const [endAtTime, setEndAtTime] = useState();
  const [discountCodeType, setDiscountCodeType] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
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
  const AppliesToOptions = [
    // { label: "Specific Collection", value: "specific_collection" },
    { label: "Specific Product", value: "specific_product" },
  ];
  const [selectedTags, setSelectedTags] = useState([]);
  const [checked, setChecked] = useState(false);
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
    marginBottom: "10px",
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
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensures two-digit month
    const day = date.getDate().toString().padStart(2, "0"); // Ensures two-digit day
    return `${year}-${month}-${day}`;
  }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateEnd, setSelectedDateEnd] = useState();

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
  function modifyDate(dateString) {
    // Parse the given date string into a Date object
    let date = new Date(dateString);

    // Decrement the month by 1 (Date object handles the year rollover if needed)
    date.setMonth(date.getMonth() - 1);

    // Increment the day by 1
    date.setDate(date.getDate() + 1);

    // Extract the updated year, month, and day, ensuring proper formatting
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure two-digit month
    const day = date.getDate().toString().padStart(2, "0"); // Ensure two-digit day

    // Return the formatted date string
    return `${year}-${month}-${day}`;
  }

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
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      console.log("matching out..", resultOptions);
      setOptions(resultOptions);
    },
    [deselectedOptions]
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
    handleFetchPopulate();
  }, []);
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
      }
      if (!selectedDate) {
        console.log("entring");
        setCodeStartDateError(true);

        isValid = false;

        // return;
      }
      if (prodIds.length === 0) {
        setProductIdsError(true);

        isValid = false;
        // return;
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

      if (!isValid) {
        setModalLoader(false);
        return;
      }

      // return;
      const newDiscount = {
        price_rule: {
          title: newDiscountCode,
          target_type: "line_item",
          target_selection: "entitled",
          allocation_method: "across",
          value_type: valueType,
          value: value,
          customer_selection: "all",
          entitled_product_ids: prodIds,
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
      setToastVisible(true);
      fetchDiscounts();

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
      setProdIds([]);
      setSelectedTags([]);
      setProductIdsError(false);
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
        console.log("Fetched Products:", data.data); // Debugging line

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

  console.log("selected ids", productIds);
  function titleCase(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join("");
  }
  //   const removeTag = useCallback(
  //     (tag) => () => {
  //       const options = [...selectedOptions];
  //       options.splice(options.indexOf(tag), 1);
  //       setSelectedOptions(options);
  //     },
  //     [selectedOptions]
  //   );
  //   const verticalContentMarkup =
  //     selectedOptions.length > 0 ? (
  //       <LegacyStack spacing="extraTight" alignment="center">
  //         {selectedOptions.map((option) => {
  //           let tagLabel = "";
  //           // tagLabel = option.replace("_", " ");
  //           // tagLabel = titleCase(tagLabel);
  //           return (
  //             <Tag key={`option${option}`} onRemove={removeTag(option)}>
  //               {option}
  //             </Tag>
  //           );
  //         })}
  //       </LegacyStack>
  //     ) : null;
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
  const removeTag = useCallback(
    (tag) => () => {
      // console.log("matched option->>>>>>", tag);
      // return;
      // Find the option that matches the selected item's value
      const matchedOption = options.find((option) =>
        option.label === tag.toLowerCase() ? option.value : null
      );

      // return;
      setProdIds((prev) => {
        const updatedSet = new Set(prev);

        // Iterate through previously selected items and remove those not in the current selection
        prev.forEach((item) => {
          // console.log("tagass", matchedOption?.value === item);

          if (matchedOption?.value === item) {
            updatedSet.delete(item);
          }
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
          console.log("problem", matchedOption.value, item);
          if (matchedOption.value === item) {
            updatedSet.delete(item);
          }
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
  console.log("product ids ->>>>>>", prodIds, "selected tags", selectedTags);
  console.log("productIdsError ->>>>>>", productIdsError);
  const tagMarkup = selectedTags.map((option) => (
    <LegacyCard key={option}>
      <Tag onRemove={removeTag(option)}>{option}</Tag>
    </LegacyCard>
  ));

  const handleRandomCodeGenerate = () => {
    const prefix = "CC_";
    const length = 10; // Length of the random part
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Allowed characters for the random part

    // Generate the random part
    let randomPart = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomPart += characters[randomIndex];
    }

    // Create the final discount code
    const discountCode = `${prefix}${randomPart}`;

    // Set the discount code state
    setNewDiscountCode(discountCode);
  };
  const listItemStyle = {
    position: "relative",
    paddingLeft: "1.5em", // Adjust space for custom bullet
  };

  // const bulletStyle = {
  //   // content: "•", // Custom bullet character
  //   color: "gray", // Change bullet color
  //   fontSize: "0.3em", // Change bullet size
  //   position: "absolute",
  //   left: 0,
  //   top: 0,
  //   fontWeight: "bold", // Optionally adjust weight
  // };
  return (
    <Page fullWidth>
      {/* <LegacyStack vertical spacing="loose">
        <Text alignment="start" variant="heading3xl" as="h2">
          Add Discount
        </Text>
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormLayout>
            <FormLayout.Group>
              <PolarisTextField
                label="Discount Code"
                value={newDiscountCode}
                onChange={(value) => setNewDiscountCode(value)}
                error={codeError ? "Discount code is required." : ""}
              />

              <Select
                label="Discount Type"
                options={filteredValueTypeOptions}
                value={valueType}
                onChange={(value) => setValueType(value)}
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <PolarisTextField
                label="Discount Value "
                type="number"
                value={value}
                onChange={handleChange}
                error={valueError ? "Invalid Value" : ""}
              />

              <FormLayout condensed>
                <Autocomplete
                  allowMultiple
                  options={options}
                  selected={selectedOptions}
                  onSelect={updateSelection}
                  textField={textField}
                />
                {productIdsError && (
                  <Text as="p" color="critical">
                    Select atleast a product
                  </Text>
                )}
              </FormLayout>
            </FormLayout.Group>

            <LegacyStack spacing="tight">{tagMarkup}</LegacyStack>
            <FormLayout.Group>
              <PolarisTextField
                label="Start Date"
                type="date"
                value={startsAt}
                onChange={(value) => setStartsAt(value)}
                error={codeStartDateError ? "Start Date is required." : ""}
              />
              <PolarisTextField
                label="End Date"
                type="date"
                value={endAt}
                onChange={(value) => setEndAt(value)}
              />
            </FormLayout.Group>
          </FormLayout>
        </Form>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button loading={modalLoader} onClick={handleCreateDiscount} primary>
            Create Discount
          </Button>
        </div>


        
      </LegacyStack> */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "row",
          gap: "10px",
          marginBottom: "20px",
          borderColor: "transparent",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
            // backgroundColor: "rgba(74, 74, 74, 0.2)",
            cursor: "default", // Default cursor

            backgroundColor: "transparent", // No initial background color
            padding: "4px",
            borderRadius: "5px",
            borderColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(74, 74, 74, 0.2)"; // Change background on hover
            e.currentTarget.style.cursor = "pointer"; // Change cursor to pointer on hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"; // Reset background on mouse leave
            e.currentTarget.style.cursor = "default"; // Reset cursor on mouse leave
          }}
        >
          <Icon source={ArrowLeftMinor} />
        </button>

        {/* <Text alignment="start" variant="headingXl" as="h5">
          Add Discount
        </Text> */}
        <Text variant="headingXl" as="h5">
          Add Discount
        </Text>
      </div>
      <div
        style={{
          // backgroundColor: "black",
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          flexWrap: "wrap", // Ensures the items can wrap if needed
        }}
      >
        {/* first card */}
        <div
          style={{
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            width: "70%",
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
              style={{ fontSize: "14px", fontWeight: "500", color: "black" }}
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
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            width: "70%",
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
                onChange={(value) => setAppliesTo(value)}
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
            marginTop: 110,
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            width: "70%",
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
              justifyItems: "center",
              gap: "10px",
              // marginBottom: -20, // Adjust spacing as needed
            }}
          >
            {/* <DatePickerMain
              label="Select a start date"
              initialDate={selectedDate}
              onDateChange={handleDateChange}
            /> */}

            <FormLayout condensed>
              <DatePickerMain
                label="Select a start date"
                initialDate={selectedDate}
                onDateChange={(val) => handleDateChange(val, false, false)}
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
              // error={codeStartDateError ? "Start Date is required." : ""}
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
              <DatePickerMain
                label="Select an end date"
                initialDate={modifyDate(selectedDateEnd)}
                onDateChange={handleDateChangeEnd}
              />
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
        {/* fourth card */}
        <div
          style={{
            flex: 1,
            // flexBasis: 3 / 2,
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            // height: "50%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #FFFFFF",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
            position: "relative",
            bottom:
              selectedTags.length > 0 && selectedOptions.length > 0 ? 300 : 268,
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Summary
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
              borderColor: "transparent",
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
          onClick={handleCreateDiscount}
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
