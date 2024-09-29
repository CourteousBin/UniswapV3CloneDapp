import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";

import Style from "./HeroSection.module.css";
import images from "../../assets";

// import Token from "../Token/Token";
import { Token,SearchToken } from "../index";

const HeroSection = ({ accounts, tokenData }) => {
  const [openSetting, setOpenSetting] = useState(false);
  const [openToken, setOpenToken] = useState(false);
  const [openTokenTwo, setOpenTokenTwo] = useState(false);

  const [tokenOne, setTokenOne] = useState({
    name: "",
    image: "",
  });

  const [tokenTwo, setTokenTwo] = useState({
    name: "",
    image: "",
  });

  return (
    <div className={Style.HeroSection}>
      <div className={Style.heroSection_box}>
        <div className={Style.HeroSection_box_heading}>
          <p>Swap</p>
          <div className={Style.HeroSection_box_heading_img}>
            <Image
              src={images.close}
              alt="image"
              width={50}
              height={50}
              onClick={() => setOpenSetting(true)}
            />
          </div>
        </div>
        <div className={Style.HeroSection_box_input}>
          <input
            type="number"
            placeholder="0"
            // onChange={(e) => (
            //   callOutPut(e.target.value),
            //   setSwapAmount(e.target.value),
            //   setSearch(true)
            // )}
          />
          <button onClick={() => setOpenToken(true)}>
            <Image
              src={tokenOne.image || images.etherlogo}
              width={20}
              height={20}
              alt="ether"
            />
            {tokenOne.symbol || "ETH"}
            <small>9232</small>
            {/* <small>{tokenOne.tokenBalance.slice(0, 7)}</small> */}
          </button>
        </div>
        <div className={Style.HeroSection_box_input}>
          <input
            type="number"
            placeholder="0"
            // onChange={(e) => (
            //   callOutPut(e.target.value),
            //   setSwapAmount(e.target.value),
            //   setSearch(true)
            // )}
          />
          <button onClick={() => setOpenToken(true)}>
            <Image
              src={tokenTwo.image || images.etherlogo}
              width={20}
              height={20}
              alt="ether"
            />
            {tokenTwo.symbol || "ETH"}
            <small>23233</small>
            {/* <small>{tokenTwo.tokenBalance.slice(0, 7)}</small> */}
          </button>
        </div>
        {accounts ? (
          <button
            className={Style.HeroSection_box_btn}
            onClick={() =>
              singleSwapToken({
                token1: tokenOne,
                token2: tokenTwo,
                swapAmount,
              })
            }
          >
            Swap
          </button>
        ) : (
          <button
            onClick={() => connectWallet()}
            className={Style.HeroSection_box_btn}
          >
            Connect Wallet
          </button>
        )}
      </div>

      {openSetting && <Token setOpenSetting={setOpenSetting} />}

      {openToken && (
        <SearchToken
          openToken={setOpenToken}
          tokens={setTokenOne}
          tokenData={tokenData}
        />
      )}

      {openTokenTwo && (
        <SearchToken
          openToken={setOpenTokenTwo}
          tokens={setTokenTwo}
          tokenData={tokenData}
        />
      )}
    </div>
  );
};
export default HeroSection;
