import { useCallback, useContext } from "react";

import {
    ChainId,
    CurrencyAmount,
    ETHER,
    Fetcher,
    Percent,
    Route,
    Router,
    Token as SToken,
    TokenAmount,
    Trade,
    WETH
} from "@levx/sushiswap-sdk";
import { ethers } from "ethers";
import { EthersContext } from "../context/EthersContext";
import Token from "../model/Token";

// export const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const SUSHISWAP_ROUTER = "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f";
export const ROUTER = SUSHISWAP_ROUTER;

const convertToken = (token: Token) => {
    return token.symbol === "ETH" ? WETH["1"] : new SToken(ChainId.MAINNET, token.address, token.decimals);
};

// tslint:disable-next-line:max-func-body-length
const useSDK = () => {
    const { provider, signer } = useContext(EthersContext);
    const allowedSlippage = new Percent("50", "10000"); // 0.05%
    const getTrade = useCallback(
        async (fromToken: Token, toToken: Token, fromAmount: ethers.BigNumber) => {
            if (provider) {
                const isETH = fromToken.symbol === "ETH";
                const from = convertToken(fromToken);
                const to = convertToken(toToken);
                const pair = await Fetcher.fetchPairData(from, to, provider);
                const route = new Route([pair], isETH ? ETHER : from, to);
                const amount = isETH
                    ? CurrencyAmount.ether(fromAmount.toString())
                    : new TokenAmount(from, fromAmount.toString());
                return Trade.exactIn(route, amount);
            }
        },
        [provider]
    );
    const swap = useCallback(
        async (trade: Trade) => {
            if (signer) {
                if (trade) {
                    const params = Router.swapCallParameters(trade, {
                        feeOnTransfer: false,
                        allowedSlippage,
                        recipient: await signer.getAddress(),
                        ttl: 60 * 20
                    });
                    const { abi } = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
                    const router = ethers.ContractFactory.getContract(ROUTER, abi, signer);
                    const gasLimit = await router.estimateGas[params.methodName](...params.args, {
                        value: params.value
                    });
                    const tx = await router.functions[params.methodName](...params.args, {
                        value: params.value,
                        gasLimit: gasLimit.mul(120).div(100)
                    });
                    return {
                        trade,
                        tx
                    };
                }
            }
        },
        [signer]
    );
    const wrapETH = useCallback(
        async (amount: ethers.BigNumber) => {
            if (signer) {
                const { abi } = require("@uniswap/v2-periphery/build/IWETH.json");
                const weth = ethers.ContractFactory.getContract(WETH["1"].address, abi, signer);
                const gasLimit = await weth.estimateGas.deposit({
                    value: amount
                });
                return await weth.deposit({
                    value: amount,
                    gasLimit
                });
            }
        },
        [signer]
    );
    const unwrapETH = useCallback(
        async (amount: ethers.BigNumber) => {
            if (signer) {
                const { abi } = require("@uniswap/v2-periphery/build/IWETH.json");
                const weth = ethers.ContractFactory.getContract(WETH["1"].address, abi, signer);
                const gasLimit = await weth.estimateGas.withdraw(amount);
                return await weth.withdraw(amount, {
                    gasLimit
                });
            }
        },
        [signer]
    );
    const calculateFee = (fromAmount: ethers.BigNumber) => {
        return fromAmount.mul(3).div(1000);
    };
    return { allowedSlippage, getTrade, swap, wrapETH, unwrapETH, calculateFee };
};
export default useSDK;
