import { ChangeEvent, useEffect, useState } from 'react';
import { Field } from './';
import { AppState, Tokens } from '../../store';
import {
    ActionButton,
    WidgetBodyWrapper,
    WidgetTitle,
    WidgetWrapper,
} from './';
import { ethers } from 'ethers';
import { SelectToken } from './';
import { useSelector } from 'react-redux';
import { Flex, Box} from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion';
import {AlertModal} from './AlertModal';
import { useAccount,useConnect } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { FactoryAddress, IERC20, IFactory, IOracle, IPair, IRouter, RouterAddress } from '../../config/constants';
import { useNavigate } from 'react-router-dom';
import { getEthersProvider, getEthersSigner } from '../../web3';
interface Reserves{
    _reserve0:bigint;
    _reserve1:bigint;
}
enum ButtonState{
    WAITING,
    INSUFFICIENT,
    INPUTAMOUNT,
    TOKENSELECT,
    APPROVEFIRST,
    APPROVESECOND,
    ADDLIQUIDITY
}
export function AddLiquidity() {
    const navigate = useNavigate();
    var tokens:Tokens[] = useSelector<AppState,Tokens[]>(state => state.tokens);
    var buttonText:string = '';
    var buttonState:ButtonState;
    const [firBal,setFirBal] = useState<string>('');
    const [secBal,setSecBal] = useState<string>('');
    const {  isLoading } = useConnect();
    const [ isWaiting,setWaiting ] = useState<boolean>(false);
    const [reserves,setReserves] = useState<Reserves>({_reserve0:0n,_reserve1:0n});
    const { isConnected, isConnecting,address } = useAccount();
    const [isAlert,setAlert] = useState<boolean>(false);
    const [body,setBody] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [firstAllowance,setFirstAllowance] = useState<string>('0');
    const [secondAllowance, setSecondAllowance] = useState<string>('0');
   
    const [first, setFirst] = useState<Tokens>();
    const [second, setSecond] = useState<Tokens>();
    const optionsFirst = tokens?.filter((value) => value?.value !== second?.value);
    const optionsSecond = tokens.filter((value) => value?.value !== first?.value);

    const [firstBalance, setFirstBalance] = useState<number>();
    const [secondBalance, setSecondBalance] = useState<number>();

    const [firstUsdValue, setFirstUsdValue] = useState<number>();
    const [secondUsdValue, setSecondUsdValue] = useState<number>();

    const chain = goerli;
    const provider = getEthersProvider();
    useEffect(()=>{
        if(!first) return;
        setTokenBalance(first,setFirstBalance)
        setAllowance('first');
    },[first,address])
    useEffect(()=>{
        if(!second) return;
        setTokenBalance(second,setSecondBalance)
        setAllowance('second')
    },[second,address])
    useEffect(() => {
        setRelative('second',parseFloat(secBal))
    },[])
    useEffect(() => {getReserve('first')},[first,second])
    useEffect(()=>{setUsdValue('first')},[first,firBal])
    useEffect(()=>{setUsdValue('second')},[second,secBal])

    const setTokenBalance = async (token:Tokens,setFunc:(value:any)=>void) => {
        if (isConnected) {
            if(!token) return;
            const tokenContract = new ethers.Contract(token?.contract, IERC20, provider);
            let balance = await tokenContract.balanceOf(address);
            let decimal = parseInt(await tokenContract.decimals());
            let balanceNumber = ethers.formatUnits(balance, decimal);
            setFunc(parseFloat(balanceNumber).toFixed(2));
        }
        else{
            setFunc(undefined);
        }
    }
    const getReserve = async (field:'first'|'second') => {
        if(!(first && second))  return;

       
        setWaiting(true);

        let factoryContract = new ethers.Contract(FactoryAddress,IFactory,provider);
        const pair = await factoryContract.getPair(first.contract,second.contract);
        if(pair == '0x0000000000000000000000000000000000000000'){
            setAlert(true);
            setBody('That pair doesn\'t exist')
        }
        
        let pairContract = new ethers.Contract(pair,IPair,provider);
        let reserves = await pairContract.getReserves();

        let token0 = await pairContract.token0();
        let token1 = await pairContract.token1();
        let decimal0 = await ((new ethers.Contract(token0,IERC20,provider)).decimals())
        let decimal1 = await ((new ethers.Contract(token1,IERC20,provider)).decimals())
        
        let rsvs:Reserves;
        if(token0 == first.contract){
            rsvs = {_reserve0:reserves._reserve0*(10n**decimal1), _reserve1:reserves._reserve1*(10n**decimal0)};
            setReserves(rsvs);
        }
        else if(token0 == second.contract){
            rsvs = {_reserve1:reserves._reserve0*(10n**decimal1), _reserve0:reserves._reserve1*(10n**decimal0)};
            setReserves(rsvs);
        }
        else {
            alert('strange')
            rsvs = {_reserve1:0n, _reserve0: 0n}
        }
        console.log('g',rsvs);
        setRelative(field,parseFloat(field =='first'?firBal:secBal), rsvs)
        setWaiting(false)
    }
    const getAllowance = async(token:Tokens)  => {
        if(!isConnected) return;
        if(!token)  return;
        
        const tokenContract = new ethers.Contract(token.contract, IERC20, provider);
        let allowance = await tokenContract.allowance(address,RouterAddress);
        let decimal = parseInt(await tokenContract.decimals());
        let allowanceNumber = ethers.formatUnits(allowance, decimal);
        return allowanceNumber;
    }
    const setAllowance  = async (field:'first'|'second') => {
        let token = field == 'first' ?first:second;
        if(!token) return;
        let allowance = await getAllowance(token);
        if(!allowance) return;
        if(field == 'first'){
            setFirstAllowance(allowance)
        }
        else setSecondAllowance(allowance)
    }
    const setRelative= (field:'first'|'second',value:number,rsvs?:Reserves)=>{
        if(Number.isNaN(value))    return;
        if(!rsvs)   
        {
            if (field === 'first') {
                if(reserves._reserve0 != 0n)
                    setSecBal(String(parseFloat(reserves._reserve1.toString())*(value)/parseFloat(reserves._reserve0.toString())));
            } else {
                if(reserves._reserve1 != 0n)
                    setFirBal(String(parseFloat(reserves._reserve0.toString())*(value)/parseFloat(reserves._reserve1.toString())));                    
            } 
        }
        else{
            console.log(reserves);
            if (field === 'first') {
                if(rsvs._reserve0)
                    setSecBal(String(parseFloat(rsvs._reserve1.toString())*(value)/parseFloat(rsvs._reserve0.toString())));

            } else {
                if(rsvs._reserve1)
                setFirBal(String(parseFloat(rsvs._reserve0.toString())*(value)/parseFloat(rsvs._reserve1.toString())));                    
            }

        }
        
    }
    const handleChange = (field: 'first' | 'second', event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (field === 'first') {
            setFirBal(event.target.value);
            setRelative(field,parseFloat(value))
        } else {
            setSecBal(event.target.value);
            setRelative(field,parseFloat(value))
        }
    };
    const setButtonState = () => {
        if(!isConnected) {  
            buttonText = 'Connect Wallet';
            buttonState = ButtonState.WAITING;
        }
        else{
            
            if(!first || !second){
                buttonState = ButtonState.TOKENSELECT;
                buttonText = 'Select Token'
            }
            else if(firBal == '' || firBal == '0' || secBal == '' || secBal == '0'){
                buttonText = 'Input Amount';
                buttonState = ButtonState.INPUTAMOUNT;
            }
            else if(!firstBalance ||  firstBalance==0 || firstBalance <parseFloat(firBal)){
                buttonText = 'Insufficient Balance'
                buttonState = ButtonState.INSUFFICIENT;
            }
            else if(!secondBalance || secondBalance==0 || secondBalance < parseFloat(secBal)){
                buttonText = 'Insufficient Balance'
                buttonState = ButtonState.INSUFFICIENT;
            }
            else if(parseFloat(firstAllowance) < parseFloat(firBal)){
                buttonText = 'Approve' + first?.label
                buttonState = ButtonState.APPROVEFIRST;

            }
            else if(parseFloat(secondAllowance) < parseFloat(secBal)){
                buttonText = 'Approve' + second?.label
                buttonState = ButtonState.APPROVESECOND;
            }
            else{
                buttonText ='Add Liquidity';
                buttonState = ButtonState.ADDLIQUIDITY;
            }
        }   
    }
    const addLiquidity = async () => {
        if(!isConnected || !address) return;
        
        const signer = await getEthersSigner({chainId:chain.id});
        console.log(signer?.address);
        if(!signer){
            return;
        }
        setWaiting(true);
        if(first && buttonState == ButtonState.APPROVEFIRST){
            
            const tokenContract = new ethers.Contract(first.contract, IERC20, signer);
            try {
                // Prepare the transaction
                const transaction = await tokenContract.approve(RouterAddress,ethers.MaxUint256)
                await transaction.wait();
            } catch (error) {
                console.error(error);
            }
        }
        if(second && buttonState == ButtonState.APPROVESECOND){
            const tokenContract = new ethers.Contract(second.contract, IERC20, signer);
            try {
                // Prepare the transaction
                const transaction = await tokenContract.approve(RouterAddress,ethers.MaxUint256);
                await transaction.wait();
            } catch (error) {
                console.error(error);
            }
        }
        if(first && second && buttonState == ButtonState.ADDLIQUIDITY){
            const routerContract = new ethers.Contract(RouterAddress,IRouter,signer);
            try{
                let firstContract = new ethers.Contract(first.contract,IERC20,signer);
                let secondContract = new ethers.Contract(second.contract,IERC20,signer);
                
                let decimal0 = parseInt(await firstContract.decimals());
                let fDesired = ethers.parseUnits(firBal, decimal0);
                let decimal1 = parseInt(await secondContract.decimals());
                let sDesired = ethers.parseUnits(secBal, decimal1);
                const tx = await routerContract.addLiquidity(
                    first.contract,
                    second.contract,
                    fDesired,
                    sDesired,
                    0,
                    0,
                    address,
                    ethers.MaxUint256
                );
                await tx.wait();
                setTokenBalance(first,setFirstBalance);
                setTokenBalance(second,setSecondBalance);
                setWaiting(false);
                navigate('/pool');
            }catch(err){
                alert('AddLiquidity:'+err);
            }
        }
        setAllowance('first');
        setAllowance('second')
        setWaiting(false);
    }
    const setUsdValue = async(field:'first'|'second') => {
        let oracleContract, tokenPriceData, tokenPrice:number;
        let token = field=='first'?first:second;
        let setFunc = field == 'first'?setFirstUsdValue:setSecondUsdValue;
        let bal = field == 'first'?firBal:secBal;
        if(!token) return;
        if (token.oracle !== '') {
            oracleContract = new ethers.Contract(token.oracle, IOracle, provider);
            tokenPriceData = await oracleContract.latestRoundData();
            tokenPrice = parseFloat(ethers.formatUnits(tokenPriceData.answer, 8))
            
            setFunc(parseFloat(bal) * tokenPrice);
        }
        else {
            setFunc(parseFloat(bal));
        }
    }
    const setMax = async(field:'first'|'second') => {
        if (isConnected ) {
            let Contract, FixDecimal;
            let token = field=='first'?first:second;
            
            if(!token)  return;
            Contract = new ethers.Contract(token?.contract, IERC20, provider);
            FixDecimal = parseInt(await Contract.decimals()) / 2;
            let balance = field=='first' ? firstBalance : secondBalance;
            if(!balance){
                return;
            }
            let tempBalance = Math.floor(balance * Math.pow(10, FixDecimal) )/ Math.pow(10, FixDecimal);
            let setfunc = field == 'first' ? setFirBal : setSecBal;
            setfunc(String(tempBalance));
            setRelative(field,tempBalance);
       }
    }
    setButtonState();
    return (
        <Flex flex={1} align="center" justify="center" width="100%">
            <AnimatePresence>
                <WidgetWrapper>
                    <WidgetTitle title="AddLiquidity" >
                        
                    </WidgetTitle>
                    <WidgetBodyWrapper>
                        
                        <Field
                            label="You send"
                            isMaxBtn={true}
                            setMaxFunc={()=>setMax('first')}
                            usdValue={firstUsdValue}
                            balance={firstBalance}
                            value={firBal}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange('first', event)}
                            placeholder="0"
                            type="number"
                        >
                            <SelectToken<Tokens> 
                                value={first} 
                                onChange={setFirst} 
                                options={optionsFirst} 
                            />
                        </Field>

                        <Field
                            label="You receive"
                            isMaxBtn={true}
                            setMaxFunc={()=>setMax('second')}
                            usdValue={secondUsdValue}
                            balance={secondBalance}
                            value={secBal}

                            onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange('second', event)}
                            placeholder="0"
                            type="number"

                        >
                            <SelectToken<Tokens>
                                value={second}
                                onChange={setSecond}
                                options={optionsSecond}
                            />
                        </Field>

                        <Box  width='100%' height='20px'/>
                        <ActionButton text={buttonText} isLoading={ isConnecting || isLoading || isWaiting } variant={'purple'} onClickFunc={()=>{addLiquidity()}}/>
                        
                        
                    </WidgetBodyWrapper>
                </WidgetWrapper>
                <AlertModal isOpen={isAlert} onClose={()=> setAlert(false)} body={body} title={title}/>
            </AnimatePresence>
        </Flex>
        
    );
}
