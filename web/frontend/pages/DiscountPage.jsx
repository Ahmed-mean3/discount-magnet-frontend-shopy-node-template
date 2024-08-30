import {
  Card,
  Page,
  Layout,
  TextContainer,
  Text,
  Button,
  Frame,
  Modal,
  Checkbox,
  FormLayout,
  Form,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";

export default function DiscountPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [PriceRuleData, setPriceRuleData] = useState("");
  console.log("data->>>>>>>>>>>", PriceRuleData);
  const handleSubmit = useCallback(() => {
    setPriceRuleData("");
    setNewsletter(false);
  }, []);

  const handleNewsLetterChange = useCallback(
    (value) => setNewsletter(value),
    []
  );
  const handlePriceRuleDataChange = useCallback((key, value) => {
    setPriceRuleData({ ...PriceRuleData, [key]: value });
  }, []);

  const handleChange = useCallback(() => setActive(!active), [active]);

  const activator = (
    <Button onClick={handleChange}>Add Another Discount</Button>
  );
  return (
    <Page>
      <Text alignment="center" variant="heading3xl" as="h2">
        All Discounts
      </Text>
      {/* <TitleBar title={t("PageName.title")}>
        <button variant="primary" onClick={() => console.log("Primary action")}>
          {t("PageName.primaryAction")}
        </button>
        <button onClick={() => console.log("Secondary action")}>
          {t("PageName.secondaryAction")}
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <TextContainer>
              <p>{t("PageName.body")}</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <TextContainer>
              <p>{t("PageName.body")}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <TextContainer>
              <p>{t("PageName.body")}</p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout> */}
      <Frame>
        <Modal
          activator={activator}
          open={active}
          onClose={handleChange}
          title="Fill up the fields below to Create a discount on a collection or product"
          primaryAction={{
            content: "Confirm",
            onAction: handleChange,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleChange,
            },
          ]}
        >
          <Modal.Section>
            {/* <TextContainer>
              <p>
                Use Instagram posts to share your products with millions of
                people. Let shoppers buy from your store without leaving
                Instagram.
              </p>
            </TextContainer> */}
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <Checkbox
                  label="Sign up for the Polaris newsletter"
                  checked={newsletter}
                  onChange={handleNewsLetterChange}
                />

                <TextField
                  value={PriceRuleData}
                  onChange={(e) => setPriceRuleData("title", e)}
                  label="Collection Title"
                  type="text"
                  autoComplete="PriceRuleData"
                  //   helpText={
                  //     <span>
                  //       We’ll use this PriceRuleData address to inform you on future
                  //       changes to Polaris.
                  //     </span>
                  //   }
                />

                <Button submit>Submit</Button>
              </FormLayout>
            </Form>
          </Modal.Section>
        </Modal>
      </Frame>
    </Page>
  );
}
