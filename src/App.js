import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { getHashes } from "crypto";
import { EtherscanProvider } from "@ethersproject/providers";

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'moreau_shop';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  // ユーザーのウォレットアドレスを格納する状態変数
  const [currentAccout, setCurrentAccout] = useState("");
  // 未設定確認
  console.log("currentAccout: ", currentAccout);
  //認証可能なウォレットアドレスを確認
  const checkIfWalletIsConnected = async () => {
    // Metamask保有の確認
    const { ethereum } = window;
    if(!ethereum){
      console.log("Make sure you have MetaMask!");
      return;
    }else{
      console.log("We have the ethereum object", ethereum);
    }
    // 認証可能ウォレットアドレス保持している場合、許可を求める
    //　許可後account に格納
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account: " ,account);
      setCurrentAccout(account);

      let chainId = await ethereum.request({method: "eth_chainId"});
      console.log("Connected to chain " + chainId);
      // 04xはRinkebyのID
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId){
        alert("You are not connected to the Rinkeby Test Network!");
      }

      // イベントリスナー
      setupEventListener();
    }else{
      console.log("No authorized account found");
    }
  };

  // connectWalletメソッド
  const connectWallet = async () =>{
    try{
      const {ethereum } = window;
      if(!ethereum){
        alert("Get MetaMask!");
        return;
      }
      // ウォレットアドレスにリクエストを送信
      const accouts = await ethereum.request({ method: "eth_requestAccounts"});
      console.log("Connected", accouts[0]);
      // ウォレットアドレスを紐づけ
      setCurrentAccout(accouts[0]);

      // イベントリスナー
      setupEventListener();
    }catch(error){
      console.log(error);
    }
  };

  const setupEventListener = async () =>{
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFTが発行される
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS, myEpicNft.abi, signer
        );
        // Eventがemitされる際に、コントラクトから送信される情報を受け取る
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from,tokenId.toNumber());
          alert(`あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch(error){
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // コントラクトとWebサイトを連携
  const askContractToMintNft  = async () => {
    const CONTRACT_ADDRESS = "0xF221EE41004B9403554CD6816C05491fc5D5B158"
    try {
      const {ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,myEpicNft.abi,signer
        );
        console.log("Going to pop wallet now to pay ges....");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        ); 
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch(error){
      console.log(error);
    }
  };

  //初期表示に、useEffect()内の関数を呼び出す
  useEffect(() => {
    checkIfWalletIsConnected();
  },[]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          {/*method add*/}
          {currentAccout === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
        <div>
          <a href="https://www.pixiv.net/users/68252861">作品URL</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
