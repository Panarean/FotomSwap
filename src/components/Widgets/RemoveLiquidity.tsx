import { Box, Divider, Flex, Spacer } from "@chakra-ui/layout";
import { AnimatePresence } from "framer-motion";
import { AppState, Tokens } from "../../store";
import { ActionButton, WidgetBodyWrapper, WidgetTitle, WidgetWrapper } from "./";
import { useColorModeValue } from "@chakra-ui/system";
import { useSelector } from "react-redux";
import { Image } from "@chakra-ui/image";
import { Text } from "@chakra-ui/layout";

import { CustomSlider } from './'
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { ethers } from "ethers";
import { FactoryAddress, IERC20, IFactory, IPair, IRouter, RouterAddress } from "../../config/constants";
import { ButtonSpinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { goerli } from "viem/chains";
import { getEthersProvider, getEthersSigner } from "../../web3";

interface Reserves{
    _reserve0:number;
    _reserve1:number;
}
enum ButtonState{
    WAITING,
    INSUFFICIENT,
    INPUTAMOUNT,
    TOKENSELECT,
    APPROVE,
    REMOVE
}
export function RemoveLiquidity({
}:{
}) {
    const navigate = useNavigate();
    const tokens = useSelector<AppState,Record<string,Tokens> >((state: { selectedTokens: any; }) => state.selectedTokens);
    console.log(tokens);
    const [reserves,setReserves] = useState<Reserves|undefined>(undefined)
    const [sliderValue, setSliderValue] = useState<number>(100);
    const {isConnected, isConnecting, address} = useAccount();
    const {isLoading} = useConnect();
    const [lp,setLp] = useState<bigint>(0n);
    const [tSupply,setTsupply] = useState<bigint>(0n);
    const [allowance,setAllowance] = useState<bigint>(0n);
    var buttonText:string = '';
    var buttonState:ButtonState;
    const [isWaiting,setWaiting] = useState<boolean>(false)
    const chain = goerli;
    const provider = getEthersProvider();
    const getAllowance = async()  => {
        if(!isConnected) return;
        if(!address) return;
        if(!tokens.token0) return;
        if(!tokens.token1) return;
        const signer = await getEthersSigner({chainId:chain.id});

        let factoryContract = new ethers.Contract(FactoryAddress,IFactory,signer);
        const pair = await factoryContract.getPair(tokens.token0.contract,tokens.token1.contract);
        if(pair == '0x0000000000000000000000000000000000000000'){
            return;
        }
        
        let pairContract = new ethers.Contract(pair,IPair,signer);
        let _allow = await pairContract.allowance(address,RouterAddress);
        
        setAllowance(_allow);

    }    
    const setButtonState = () => {
        if (!isConnected) {  
            buttonText = 'Connect Wallet';
            buttonState = ButtonState.WAITING;
        }
        else {
            
            if (!sliderValue || sliderValue == 0 ) {
                buttonText = 'Select Amount';
                buttonState = ButtonState.INPUTAMOUNT;
            }
            else if (allowance < parseFloat(lp.toString())*sliderValue/100) {
                buttonText = 'Approve '
                buttonState = ButtonState.APPROVE;
            }
            else {
                buttonText ='Remove Liquidity';
                buttonState = ButtonState.REMOVE;
            }
        }   
    }
    const removeLiquidity = async () => {
        if(!isConnected || !address) return;
        const signer = await getEthersSigner({chainId:chain.id});
        
        setWaiting(true);

        if(tokens && buttonState == ButtonState.APPROVE){
            let factoryContract = new ethers.Contract(FactoryAddress,IFactory,signer);
            const pair = await factoryContract.getPair(tokens.token0?.contract,tokens.token1?.contract);
            if(pair == '0x0000000000000000000000000000000000000000'){
                return;
            }
            let pairContract = new ethers.Contract(pair,IPair,signer);
            
            try {
                // Prepare the transaction
                const transaction = await pairContract.approve(RouterAddress,ethers.MaxUint256)
                await transaction.wait();
            } catch (error) {
                console.error(error);
            }
        }
        
        if(tokens && buttonState == ButtonState.REMOVE){
            const routerContract = new ethers.Contract(RouterAddress,IRouter,signer);
            try{
                const tx = await routerContract.removeLiquidity(
                    tokens.token0?.contract,
                    tokens.token1?.contract,
                    String(Math.floor(parseFloat(lp.toString())*sliderValue/100)),
                    0,
                    0,
                    address,
                    ethers.MaxUint256
                );
                await tx.wait();
                setWaiting(false);
                navigate('/pool');
            }catch(err){
                alert('RemoveLiquidity:'+err);
            }
        }
        getAllowance();
        setWaiting(false);
    }
    const getReserves = async () => {
        if(!isConnected) return;
        if(!address) return;
        if(!tokens.token0) return;
        if(!tokens.token1) return;
        
        let factoryContract = new ethers.Contract(FactoryAddress,IFactory,provider);
        const pair = await factoryContract.getPair(tokens.token0.contract,tokens.token1.contract);
        if(pair == '0x0000000000000000000000000000000000000000'){
            return;
        }
        
        let pairContract = new ethers.Contract(pair,IPair,provider);
        let _tSupply = await pairContract.totalSupply();
        let _lp = await pairContract.balanceOf(address);
        //let pairDecimal = await pairContract.decimals();
        //let tSupply = parseFloat(ethers.utils.formatUnits(_tSupply,pairDecimal));
        //let lp = parseFloat(ethers.utils.formatUnits(_lp,pairDecimal));

        setLp(_lp);
        setTsupply(_tSupply);
        let reserves = await pairContract.getReserves();

        let token0 = await pairContract.token0();
        let token1 = await pairContract.token1();
        let decimal0 = await ((new ethers.Contract(token0,IERC20,provider)).decimals())
        let decimal1 = await ((new ethers.Contract(token1,IERC20,provider)).decimals())
        let balance0 = parseFloat(ethers.formatUnits(reserves._reserve0,decimal0));
        let balance1 = parseFloat(ethers.formatUnits(reserves._reserve1,decimal1));

        let rsvs:Reserves;
        if(token0 == tokens.token0.contract){
            rsvs = {_reserve0:balance0,_reserve1:balance1};
            setReserves(rsvs);
        }
        else if(token0 == tokens.token1.contract){
            rsvs = {_reserve1:balance0,_reserve0:balance1}
            setReserves(rsvs);
        }
    }
    useEffect(() => {
        const timer = setInterval(() => {
            getReserves();
          }, 10000);
        
        getReserves();
          return () => {
            clearInterval(timer);
          };
    },[])
    useEffect(() => {
        getAllowance();
    },[address])
    useEffect(() => {
        if(!isConnected)
            navigate('/swap');
    },[isConnected])
    setButtonState();
    var bodyNode;
    if(!reserves){
        bodyNode = (
            <Flex pt='50px' pb='50px' width='100%' justifyContent={'center'}>
                <ButtonSpinner  mt='-8px' color="blue.500" />
            </Flex>
        )
    }
    else{
        bodyNode = (
            <Flex flexDirection={'column'}  justifyContent='left' padding='30px' borderRadius='10px' width='100%' >
                <Flex justifyContent={'space-between'} width='100%' alignItems='center'>
                    <Flex alignItems={'center'}>
                        <Image src={tokens.token0?.image} boxSize={['20px','25px']} />
                        <Image src={tokens.token1?.image} boxSize={['20px','25px']} ml='-10px'/>
                        <Text ml={['20px','30px']} fontSize={['15px','20px']}>
                            {tokens.token0?.label}-{tokens.token1?.label}
                        </Text>
                    </Flex>
                </Flex>
                <Divider border='1' width='100%' mt='10px' mb='10px'/>
                
                <Flex w="100%" pl='10px' pr='10px' pt='4px' pb='4px' alignItems='center'>
                    <Box>{tokens.token0?.label}</Box>
                    <Spacer/>
                    <Box fontSize='15px'>{
                        (sliderValue*reserves._reserve0*parseFloat(lp.toString())/parseFloat(tSupply.toString())/100).toFixed(3)}
                    </Box>
                    <Image src={tokens.token0?.image} boxSize={'16px'} />
                </Flex>
                <Flex w="100%" pl='10px' pr='10px' pt='4px' pb='4px' alignItems='center'>
                    <Box>{tokens.token1?.label}</Box>
                    <Spacer/>
                    <Box fontSize='15px'>{(sliderValue*reserves._reserve1*parseFloat(lp.toString())/parseFloat(tSupply.toString())/100).toFixed(3)}</Box>
                    <Image src={tokens.token1?.image} boxSize={'16px'} />
                </Flex>
                <Flex w="100%" pl='10px' pr='10px' pt='4px' pb='4px' alignItems='center'>
                    <Box>{'Share of Pool'}</Box>
                    <Spacer/>
                    <Box fontSize='15px'>{(parseFloat(lp.toString())*(100-sliderValue)/(parseFloat(tSupply.toString())-parseFloat(lp.toString())*sliderValue/100)).toFixed(1)}%</Box>
                    
                </Flex>
                <Flex p='16px' mt='30px' mb='20px'>
                    <CustomSlider onSliderChange={(value:number) => setSliderValue(value)}  />
                </Flex>
                
                <ActionButton text={buttonText} isLoading={isConnecting || isLoading || isWaiting} variant={'purple'} onClickFunc={()=>{removeLiquidity()}}/>
                
            </Flex>
        )
    }
    
    return (
        <Flex flex={1} align="center" justify="center" width="100%">
            <AnimatePresence>
                <WidgetWrapper >
                    <WidgetTitle title="RemoveLiquidity" >
                        
                    </WidgetTitle>
                    <WidgetBodyWrapper>
                        <Flex width='100%' borderRadius={10} backgroundColor={useColorModeValue('white.bg.primary','dark.bg.tertiary')}>
                            {bodyNode}
                        </Flex>
                    </WidgetBodyWrapper>
                </WidgetWrapper>
            </AnimatePresence>
        </Flex>
    )
}