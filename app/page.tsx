"use client";
// import BuyCard from "@/components/BuyCard";
// import SellCard from "@/components/SellCard";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import { Children, useState } from 'react';
import BuySellCard from '@/components/BuySellCard';

import "@/app/font.css";

import API from "../public/API/api_tokens.json";
console.log(API.tokenA);
const CreateOrderPage = () => {

  const mul = (a: number, b: number): number => {
    console.log("mul a * b", a * b);
    return a * b;
  }

  const divide = (a: number, b: number): number => {
    return a / b;
  }

  const limit = (_limit: number, _price: number) => {
    return _limit * _price;
  }

  return (
    <div className="flex relative h-screen flex-col items-center">
      <div>
        <Tabs
          aria-label="tabs"
          defaultValue={0}
          sx={{ bgcolor: "transparent" }}
        >
          <TabList
            disableUnderline
            sx={{
              fontFamily: "GothamPro",
              margin: "0 -88px 0 0",
              top: "65px",
              position: "absolute",
              right: "50%",
              width: "195px",
              p: 0.5,
              gap: 0.5,
              borderRadius: "1000px",
              backgroundColor: "rgba(255, 255, 255, 0.09)",
              [`& .${tabClasses.root}[aria-selected="true"]`]: {
                boxShadow: "sm",
                backgroundColor: "#FFF",
                color: "#0A0914",
              },
            }}
          >
            <Tab sx={{ width: "98px" }} disableIndicator>
              Buy
            </Tab>
            <Tab disableIndicator sx={{ width: "98px" }}>
              Sell
            </Tab>
          </TabList>
          <TabPanel sx={{ marginTop: "126px" }} value={0}>
            <BuySellCard 
              tokenA={API.tokenA} tokenB={API.tokenB}
              TXT_BUTTON="Create order"
              func={mul}
              limit={limit}
              tabIndex={0} // Buy tab
            />
          </TabPanel>
          <TabPanel sx={{ marginTop: "126px" }} value={1}>
            <BuySellCard 
              tokenA={API.tokenA} tokenB={API.tokenB}
              TXT_BUTTON="Create order"
              func={divide}
              limit={limit}
              tabIndex={1} // Sell tab
            />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateOrderPage;
