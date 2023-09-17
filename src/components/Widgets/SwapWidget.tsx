
import { ChangeEvent, useEffect, useState } from 'react';
import { BASE_URL, IERC20,  IOracle, RouterAddress, IRouter} from '../../config/constants'
import {  ethers } from 'ethers';

import {
    WidgetBodyWrapper,
    WidgetTitle,
    WidgetWrapper,
    ActionButton,
} from './';

import { AppState, Tokens } from '../../store';
import { SelectToken } from './SelectToken';
import { useDispatch, useSelector } from 'react-redux'
import { Field } from './Field';
import { Button } from '@chakra-ui/react';
import { Box,Flex } from '@chakra-ui/react';
import { useAccount,useConnect } from 'wagmi';
import {  goerli } from 'wagmi/chains'
import axios from 'axios';
//import { arrayify } from 'ethers/lib/utils';
import {  FiRepeat } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
enum ButtonState{
    WAITING,
    INSUFFICIENT,
    INPUTAMOUNT,
    TOKENSELECT,
    APPROVEFIRST,
    SWAP
}

export function SwapWidget() {
    const providerURL = "https://goerli.infura.io/v3/aa69bfabb0ff4ec0b80b0577fda29865";

    const dispatch = useDispatch();

    const {isConnected, isConnecting, address, connector} = useAccount();

    const {isLoading} = useConnect();

    const [isWaiting, setWaiting] = useState<boolean>(false);
    
    var tokens:Tokens[] = useSelector<AppState,Tokens[]>(state => state.tokens);

    const [firstToken, setFirstToken] = useState<Tokens>();
    const [secondToken, setSecondToken] = useState<Tokens>();

    const optionsFirstToken = tokens.filter((value) => value?.value !== secondToken?.value);
    const optionsSecondToken = tokens.filter((value) => value?.value !== firstToken?.value);

    const [firstBalance, setFirstBalance] = useState<number>();
    const [secondBalance, setSecondBalance] = useState<number>();

    const [firstFixedBalance, setFirstFixedBalance] = useState<number>();
    const [secondFiexedBalance, setSecondFixedBalance] = useState<number>();

    const [firstValue, setFirstValue] = useState<number>();
    const [secondValue, setSecondValue] = useState<number>();

    const [firstUsdValue, setFirstUsdValue] = useState<number>();
    const [secondUsdValue, setSecondUsdValue] = useState<number>();

    const [firstAllowance, setFirstAllowance] = useState<string>('0');
    const [secondAllowance, setSecondAllowance] = useState<string>('0');

    var buttonText:string;
    var buttonState:ButtonState;

    const handleChange = (field: 'first' | 'second', event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        if (field === 'first') {
            setFirstValue(parseFloat(value));
            mySetFirstUsdValue(parseFloat(value));
            calcSecondValue(parseFloat(value));
        }
        if (field === 'second') {
            setSecondValue(parseFloat(value));
            mySetSecondUsdValue(parseFloat(value));
            calcFirstValue(parseFloat(value));
        }
    };

    const mySetFirstBalance = async () => {
        if (isConnected && firstToken) {
            const provider = new ethers.providers.Web3Provider(await connector?.getProvider());

            let Contract, Balance:BigNumber, Decimal, TotalBalance:number, FixedBalance:number;

            Contract = new ethers.Contract(firstToken?.contract, IERC20, provider);
            Balance = await Contract.balanceOf(address);
            Decimal = parseInt(await Contract.decimals());
            TotalBalance = parseFloat(ethers.utils.formatUnits(Balance, Decimal));
            FixedBalance = parseFloat(TotalBalance.toFixed(2));
            setFirstBalance(TotalBalance);
            setFirstFixedBalance(FixedBalance)
       }
       else{
            setFirstBalance(undefined);
            setFirstFixedBalance(undefined)
       }
    }

    const mySetSecondBalance = async () => {
        if (isConnected && secondToken) {
            const provider = new ethers.providers.Web3Provider(await connector?.getProvider());

            let Contract, Balance:BigNumber, Decimal, TotalBalance:number, FixedBalance:number;

            Contract = new ethers.Contract(secondToken?.contract, IERC20, provider);
            Balance = await Contract.balanceOf(address);
            Decimal = parseInt(await Contract.decimals());
            TotalBalance = parseFloat(ethers.utils.formatUnits(Balance, Decimal));
            FixedBalance = parseFloat(TotalBalance.toFixed(2));
            setSecondBalance(TotalBalance);
            setSecondFixedBalance(FixedBalance)
        }
        else{
            setSecondBalance(undefined);
            setSecondFixedBalance(undefined)
        }
    }

    const mySetFirstUsdValue = async(value:number) => {
        const provider =  new ethers.providers.JsonRpcProvider(providerURL);
        let oracleContract, tokenPriceData, tokenPrice:number;
        if (firstToken && firstToken?.oracle !== '') {
            oracleContract = new ethers.Contract(firstToken?.oracle, IOracle, provider);
            tokenPriceData = await oracleContract.latestRoundData();
            tokenPrice = parseFloat(ethers.utils.formatUnits(tokenPriceData.answer, 8))
            
            setFirstUsdValue(value * tokenPrice);
        }
        else {
            setFirstUsdValue(value);
        }
    }

    const mySetSecondUsdValue = async(value:number) => {
        const provider =  new ethers.providers.JsonRpcProvider(providerURL);
        let oracleContract, tokenPriceData, tokenPrice:number;
        if (secondToken && secondToken?.oracle !== '') {
            oracleContract = new ethers.Contract(secondToken?.oracle, IOracle, provider);
            tokenPriceData = await oracleContract.latestRoundData();
            tokenPrice = parseFloat(ethers.utils.formatUnits(tokenPriceData.answer, 8))
            
            setSecondUsdValue(value * tokenPrice);
        }
        else {
            setSecondUsdValue(value);
        }
    }

    const getSwapPath = async() => {
        let res = await axios.post(BASE_URL + 'path', {"token0":firstToken?.contract,"token1":secondToken?.contract})

        if (res) {
            return res.data.data.path;
        }  
    }

    const calcFirstValue = async(value:number) => {
        if (!firstToken || !secondToken || !value) return;
        
        let curPath = await getSwapPath();
        if (!curPath) return;
       
        const provider =  new ethers.providers.JsonRpcProvider(providerURL);

        let secondContract = new ethers.Contract(secondToken?.contract, IERC20, provider);
        let secondDecimal = parseInt(await secondContract.decimals());
        let realSecondAmount = ethers.utils.parseUnits(String(value), secondDecimal);

        let routerContract = new ethers.Contract(RouterAddress, IRouter, provider);
        let amounts = [];
        amounts = await routerContract.getAmountsIn(realSecondAmount, curPath);

        let firstContract = new ethers.Contract(firstToken?.contract, IERC20, provider);
        let firstDecimal = parseInt(await firstContract.decimals());
        let realFirstValue = parseFloat(ethers.utils.formatUnits(amounts[0], firstDecimal));

        setFirstValue(realFirstValue);
    }

    const calcSecondValue = async(value:number) => {
        if (!firstToken || !secondToken || !value) return;

        let curPath = await getSwapPath();
        if (!curPath) return;
        
        const provider =  new ethers.providers.JsonRpcProvider(providerURL);

        let firstContract = new ethers.Contract(firstToken?.contract, IERC20, provider);
        let firstDecimal = parseInt(await firstContract.decimals());
        let realFirstAmount = ethers.utils.parseUnits(String(value), firstDecimal);

        let routerContract = new ethers.Contract(RouterAddress, IRouter, provider);
        let amounts = [];
        amounts = await routerContract.getAmountsOut(realFirstAmount, curPath);

        let secondContract = new ethers.Contract(secondToken?.contract, IERC20, provider);
        let secondDecimal = parseInt(await secondContract.decimals());
        let realSecondValue = parseFloat(ethers.utils.formatUnits(amounts[curPath.length-1], secondDecimal));

        setSecondValue(realSecondValue);
    }

    const changeFirstToken = async() => {
        mySetFirstBalance();
        if(firstValue){
            mySetFirstUsdValue(firstValue);
            calcSecondValue(firstValue);
        }
        
        setAllowance('first');
    }

    const changeSecondToken = async() => {
        mySetSecondBalance();
        if(firstValue)    calcSecondValue(firstValue);
    }

    const setMax = async() => {
        if (isConnected && firstToken && firstBalance) {
            const provider = new ethers.providers.Web3Provider(await connector?.getProvider());

            let Contract, FixDecimal;

            Contract = new ethers.Contract(firstToken?.contract, IERC20, provider);
            FixDecimal = parseInt(await Contract.decimals()) / 2;

            let tempFirstBalance = Math.floor(firstBalance * Math.pow(10, FixDecimal) )/ Math.pow(10, FixDecimal);
            
            setFirstValue(tempFirstBalance);
            mySetFirstUsdValue(tempFirstBalance);
            calcSecondValue(tempFirstBalance);
       }
    }

    const switchToken = () => {
        setFirstValue(secondValue);
        let tempFirstToken= firstToken;
        let tempSecondToken = secondToken;
        setFirstToken(tempSecondToken);
        setSecondToken(tempFirstToken);
    }

    const getAllowance = async(token:Tokens) => {
        if (!isConnected) return;
        if (!token)  return;
        const provider = new ethers.providers.Web3Provider(await connector?.getProvider());
        const tokenContract = new ethers.Contract(token.contract, IERC20, provider);
        let allowance:BigNumber = await tokenContract.allowance(address, RouterAddress);
        let decimal = parseInt(await tokenContract.decimals());
        let allowanceNumber = ethers.utils.formatUnits(allowance, decimal);
        return allowanceNumber;
    }
    
    const setAllowance  = async (field:'first'|'second') => {
        let token = field == 'first' ? firstToken : secondToken;
        if (!token) return;
        let allowance = await getAllowance(token);
        if (!allowance) return;
        if (field == 'first') {
            setFirstAllowance(allowance)
        }
        else {
            setSecondAllowance(allowance)
        }
    }

    useEffect(() => {
        setAllowance('first');
        
    }, [address]);

    useEffect(()=>{
        changeFirstToken()
    },[firstToken])

    useEffect(()=>{
        if(firstValue) mySetFirstUsdValue(firstValue);
    },[firstValue])
    
    useEffect(()=>{
        changeSecondToken()
    },[secondToken])

    useEffect(()=>{
        if(secondValue) mySetSecondUsdValue(secondValue);
    },[secondValue])

    useEffect(()=>{
        mySetFirstBalance()
        mySetSecondBalance()
    },[isConnected,address])

    const setButtonState = () => {
        if (!isConnected) {  
            buttonText = 'Connect Wallet';
            buttonState = ButtonState.WAITING;
        }
        else {
            if (!firstToken || !secondToken) {
                buttonText = 'Select Token';
                buttonState = ButtonState.TOKENSELECT;
            }
            else if (!firstValue || firstValue == 0) {
                buttonText = 'Input Amount';
                buttonState = ButtonState.INPUTAMOUNT;
            }
            else if (!firstBalance || firstBalance < firstValue) {
                buttonText = 'Insufficient Balance'
                buttonState = ButtonState.INSUFFICIENT;
            }
            else if (parseFloat(firstAllowance) < firstValue) {
                buttonText = 'Approve ' + firstToken?.label
                buttonState = ButtonState.APPROVEFIRST;
            }
            else {
                buttonText ='Swap';
                buttonState = ButtonState.SWAP;
            }
        }   
    }

    const onClickSwapButton = async () => {
        setWaiting(true);

        if (!isConnected || !address) {
            return;
        }
        if(!firstToken) return;
        if(!firstValue) return;
        let provider = new ethers.providers.Web3Provider(await connector?.getProvider());
        let tokenContract, routerContract;
        let decimal, amoutIn, path;
        let transaction;

        tokenContract = new ethers.Contract(firstToken.contract, IERC20, provider);
        routerContract = new ethers.Contract(RouterAddress, IRouter, provider);

        if (buttonState == ButtonState.APPROVEFIRST) {
            try {
                transaction = await tokenContract.connect(provider.getSigner()).approve(RouterAddress, ethers.constants. MaxUint256)
                await transaction.wait();
            } catch (error) {
                console.error(error);
            }
        }
        else if (buttonState == ButtonState.SWAP) {
            decimal = parseInt(await tokenContract.decimals());
            amoutIn = ethers.utils.parseUnits(String(firstValue), decimal);
            path = await getSwapPath();

            if (!amoutIn || !path || !address) return;
            
            try {
                const transaction = await routerContract.connect(provider.getSigner()).swapExactTokensForTokens(amoutIn, 0, path, address, ethers.constants.MaxUint256);
                await transaction.wait();
            } catch (error) {
                console.error(error);
            }
        }

        setAllowance('first');
        mySetFirstBalance();
        mySetSecondBalance();
        calcSecondValue(firstValue);

        setWaiting(false);
    }

    setButtonState();

    return (
        <Flex flex={1} align="center" justify="center" width="100%">
            <AnimatePresence>
                <WidgetWrapper>
                    <WidgetTitle title="Swap"  subtitle=''/>
            <WidgetBodyWrapper>
                        <Field
                            label="You send"
                            isMaxBtn={true}
                            setMaxFunc={setMax}
                            usdValue={firstUsdValue}
                            balance={firstFixedBalance}
                            value={firstValue}
                            onChange={(event) => handleChange('first', event)}
                            placeholder="0"
                            type="number"
                        >
                            <SelectToken<Tokens> 
                                value={firstToken} 
                                onChange={setFirstToken} 
                                options={optionsFirstToken} 
                            />
                        </Field>
                <Button onClick={() => switchToken()} h='16px' mt='5px' background='transparent'>
                    <FiRepeat style = {{transform: 'rotate(90deg)'}}/>
                </Button>
                        <Field
                            label="You receive"
                            isMaxBtn={false}
                            usdValue={secondUsdValue}
                            balance={secondFiexedBalance}
                            value={secondValue}
                            onChange={(event) => handleChange('second', event)}
                            placeholder="0"
                            type="number"
                            marginTop='-20px'
                        >
                            <SelectToken<Tokens>
                                value={secondToken}
                                onChange={setSecondToken}
                                options={optionsSecondToken}
                            />
                        </Field>

                        <Box width='100%' height='20px'></Box>
                <ActionButton text={buttonText} isLoading={isConnecting || isLoading || isWaiting} variant={'purple'} onClickFunc={()=>{onClickSwapButton()}}/>
                    </WidgetBodyWrapper>
                </WidgetWrapper>
            </AnimatePresence>
        </Flex>
    );
}
