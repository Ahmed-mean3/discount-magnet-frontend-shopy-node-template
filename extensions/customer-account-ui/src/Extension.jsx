import {
  reactExtension,
  Text,
  Page,
  View,
  Badge,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@shopify/ui-extensions/checkout";
import { useQuery } from "react-query";

export default reactExtension(
  "customer-account.order-index.block.render",
  () => <Extension />
);

function Extension() {
  const [discountCodes, setDiscountCodes] = useState([]);

  // const {
  //   data,
  //   refetch: refetchProductCount,
  //   isLoading: isLoadingCount,
  // } = useQuery({
  //   queryKey: ["productCount"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/products/count");
  //     return await response.json();
  //   },
  //   refetchOnWindowFocus: false,
  // });
  // fetch("https://jsonplaceholder.typicode.com/todos/1")
  // .then((response) => response.json())
  // .then((data) => {
  //   console.log(data);
  // })
  // .catch((e) => {
  //   console.error("Error:", e);

  //   res.status(500).send({ message: "Failed to fetch discounts data" });
  // });
  // const handlePopulate = async () => {
  //   // setPopulating(true);
  //   const response = await fetch("/api/products", { method: "POST" });

  //   if (response.ok) {
  //     await refetchProductCount();

  //     shopify.toast.show(
  //       t("ProductsCard.productsCreatedToast", { count: productsCount })
  //     );
  //   } else {
  //     shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), {
  //       isError: true,
  //     });
  //   }

  //   // setPopulating(false);
  // };
  // const fetchDiscounts = async () => {
  //   // fetch("https://jsonplaceholder.typicode.com/todos/1")
  //   //   .then((response) => response.json())
  //   //   .then((json) => console.log(json));
  //   // return;
  //   try {
  //     const apiKey = "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"; // Your Shopify API key
  //     const apiPassword = "185e5520a93d7e0433e4ca3555f01b99"; // Your API password (if applicable)
  //     const apiUrl =
  //       "https://store-for-customer-account-test.myshopify.com/admin/api/2024-07/price_rules/1202709266572/discount_codes.json";

  //     const response = await fetch(apiUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Basic ${btoa(`${apiPassword}:${apiKey}`)}`, // Base64 encode the credentials
  //       },
  //     });

  //     const data = await response.json();
  //     console.log("data recieved from api discounts at backend", data);
  //   } catch (error) {
  //     console.log("client error", error);
  //   }
  // };

  const fetchDiscounts = async () => {
    try {
      const apiUrl = "http://localhost:4000/get-discounts";

      const response = await axios.post(apiUrl, {
        price_rules: "1202709266572",
      });

      const data = response.data.discounts; // Assuming the discounts are returned under 'discounts' key
      console.log("data retrieved from middleware server ->>>>>>>", data);
      setDiscountCodes(data.map((discount) => discount.code)); // Extract the discount codes
    } catch (error) {
      console.log("Error receiving data from middleware server", error);
    }
  };
  useEffect(() => {
    fetchDiscounts();
  }, []);
  return (
    <Page>
      <Text style={{ fontWeight: "bold", fontsize: "24px" }}>
        List of Discounts
      </Text>
      <View style={{ display: "flex", gap: "18px", marginTop: "12px" }}>
        {discountCodes.length > 0 ? (
          discountCodes.map((code, index) => (
            <Badge key={index} status="info">
              {code}
            </Badge>
          ))
        ) : (
          <Text>No discounts available</Text>
        )}
      </View>
      {/* <Button onPress={() => console.log("abc")}>click me......</Button> */}
    </Page>
  );
}
