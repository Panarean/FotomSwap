import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers'
import { Image } from '@chakra-ui/image';
import { AppState, Tokens } from '../../store';

import {
    WidgetBodyWrapper,
    WidgetTitle,
    WidgetWrapper,
} from './';
import { useSelector } from 'react-redux';
import { Box, Divider, Flex, Spacer, VStack } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Text } from '@chakra-ui/react'
import { FactoryAddress, IERC20, IFactory, IOracle, IPair, IRouter, REWARDICON, RouterAddress } from '../../config/constants';
import { useDispatch } from 'react-redux';
import { ButtonSpinner } from '@chakra-ui/react';

import { getEthersProvider } from '../../web3';

export function Pool() {

    var tokens:Tokens[] = useSelector<AppState,Tokens[]>(state => state.tokens);
    const [firstLoad,setFirstLoad] = useState<boolean>(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [positions,setPositions] = useState<Record<string,any>[]>([]);
    const { isConnected, address } = useAccount();
    const provider = getEthersProvider();
    useEffect(() => {
        /*const timer = setInterval(() => {
            getPositions();
          }, 10000);
        
          return () => {
            clearInterval(timer);
          };*/
    },[])
    const getPositions = async () => {
        if(!isConnected || !address){
            setPositions([])
            setFirstLoad(false)
            console.log('disconnnect',address,isConnected);
            return;
        } 
        if(tokens.length == 0){
            setFirstLoad(false);
        };
        
        const _positions = [];
                
        const factoryContract = new ethers.Contract(FactoryAddress,IFactory,provider);
        const routerContract = new ethers.Contract(RouterAddress,IRouter,provider);
        let len = parseInt(await factoryContract.allPairsLength());
        for (let i = 0 ; i < len ; i ++){
            let pair = await factoryContract.allPairs(i);
            
            let pairContract = new ethers.Contract(pair,IPair,provider);
            let res = await routerContract.getUserLiquidity(address,pair)
            let lp = await pairContract.balanceOf(address);
            if(lp == 0n) continue;
            let total = await pairContract.totalSupply();
            let token0 = await pairContract.token0();
            let token1 = await pairContract.token1();
            
            let firstToken:Tokens = tokens.filter(elem => elem?.contract == token0)[0];
            if(!firstToken) return;
            let firstPrice, secondPrice,oracleContract;
            if(firstToken?.oracle == '')
                firstPrice = 100000000n;
            else if(firstToken?.oracle == 'none')
                firstPrice = 0n;
            else {
                oracleContract = new ethers.Contract(firstToken?.oracle,IOracle,provider);
                firstPrice = (await oracleContract.latestRoundData()).answer;
            }
            let secondToken:Tokens = tokens.filter(elem => elem?.contract == token1)[0];
            if(!secondToken) return;
            let decimal0 = await (new ethers.Contract(token0,IERC20,provider)).decimals();
            let decimal1 = await (new ethers.Contract(token1,IERC20,provider)).decimals();
            if(secondToken?.oracle == ''){
                secondPrice = 100000000n;
            }
            else if(secondToken?.oracle == 'non'){
                secondPrice = 0n;
            }
            else {
                oracleContract = new ethers.Contract(secondToken?.oracle,IOracle,provider);
                secondPrice = (await oracleContract.latestRoundData()).answer;
            }
            
            let reserves:bigint[] = await pairContract.getReserves();
            let timestamp = (await provider.getBlock(await provider.getBlockNumber()))?.timestamp;
            if(!timestamp)  return;

            let _deltaTime = BigInt(timestamp)-reserves[2];
            let deltaTime = BigInt(_deltaTime);
            
            let TotalPriceA = reserves[0]*firstPrice / BigInt(10n**decimal0)
            let TotalPriceB = reserves[1]*secondPrice/ BigInt(10n**decimal1)
            let TotalPrice;

            if(TotalPriceA*TotalPriceB != 0n)  TotalPrice = TotalPriceA+TotalPriceB;
            else if(TotalPriceA == 0n ) TotalPrice = TotalPriceB * 2n;
            else TotalPrice = TotalPriceA * 2n;
            let rewardAmount = TotalPrice*deltaTime*lp/total + res.savedReward;

            
            let firBal = parseFloat(ethers.formatUnits( reserves[0]*lp/total,decimal0)).toFixed(3);
            let secBal = parseFloat(ethers.formatUnits( reserves[1]*lp/total,decimal1)).toFixed(3);
            let reward = parseFloat(ethers.formatUnits(rewardAmount,18)).toFixed(3);
            let position = {
                token0:firstToken,
                token1:secondToken,
                firstBalance:firBal,
                secondBalance:secBal,
                pair,
                lp,
                total,
                reward
            }          
            //console.log('reward',pair,rewardAmount);
            _positions.push(position)

        }
        setPositions(_positions)     

        setFirstLoad(false)
        
    }

    useEffect(() => {
        getPositions();
    },[address,tokens,isConnected])
    useEffect(() => {
        console.log('addressChange')
        setFirstLoad(true);
    },[address])

    let positionNode;
    console.log(address,firstLoad,isConnected,positions);
    if(firstLoad == true) {
        positionNode = (
            <Box pt='50px' pb='50px'>
                <ButtonSpinner  color="blue.500" />
            </Box>
        )
    }
    else if(positions.length == 0 ) {
        positionNode = (
            <Text width='50%' textAlign='center' marginTop='40px' marginBottom='40px' fontSize='20px'>
                Your liquidity positions will appear here.
            </Text>
        )
    }
    else{
        positionNode = (
            <>
                {
                    positions.map(elem => {   
                        return (
                            <Flex flexDirection={'column'}  justifyContent='left' padding='10px' borderRadius='10px' width='100%' >
                                <Flex justifyContent={'space-between'} width='100%' alignItems='center'>
                                    <Flex alignItems={'center'}>
                                        <Image src={elem.token0.image} boxSize={['20px','25px']} />
                                        <Image src={elem.token1.image} boxSize={['20px','25px']} ml='-10px'/>
                                        <Text ml={['20px','30px']} fontSize={['15px','20px']}>
                                            {elem.token0.label}-{elem.token1.label}
                                        </Text>
                                    </Flex>
                                    <Text fontSize={['10px','15px']}>
                                        {(parseFloat(elem.lp)/parseFloat(elem.total)*100).toFixed(1)+'%'}
                                    </Text>
                                </Flex>
                                <Divider border='1' width='100%' mt='10px' mb='10px'/>
                                <Flex w="100%" p='4px' alignItems='center'>
                                    <Box>Pooled {elem.token0.label}</Box>
                                    <Spacer/>
                                    <Box fontSize='15px'>{elem.firstBalance}</Box>
                                    <Image src={elem.token0.image} boxSize={'16px'} />
                                    
                                </Flex>
                                <Flex w="100%" p='4px' alignItems='center'>
                                    <Box>Pooled {elem.token1.label}</Box>
                                    <Spacer/>
                                    <Box>{elem.secondBalance}</Box>
                                    <Image src={elem.token1.image} boxSize={'16px'} />
                                </Flex>
                                <Flex w="100%" p='4px' alignItems='center'>
                                    <Box>Reward </Box>
                                    <Spacer/>
                                    <Box>{elem.reward}</Box>
                                    <Image src={REWARDICON} boxSize={'16px'} />
                                </Flex>
                                <Flex pt={3} justifyContent={'center'} w='100%'>
                                    <Text  as='a' decoration={'underline'}  onClick={()=>{
                                        dispatch({type:'selectTokens',payload:{token0:elem.token0,token1:elem.token1}});
                                        navigate('/removeLiquidity');
                                    }} >
                                        Remove Liquidity
                                    </Text>
                                </Flex>
                                
                            </Flex>
                        )
                    })
                }
            </>
        )
    }
    
    return (
        <Flex flex={1} align="center" justify="center" width="100%">
            <AnimatePresence>
                <WidgetWrapper>
                    <WidgetTitle title="Pool" subtitle="Get some tokens to test the app" >
                        <Text as='a' textDecoration="underline" onClick={() => navigate('/addLiquidity')}>
                            AddLiquidity
                        </Text>
                        
                    </WidgetTitle>
                    <WidgetBodyWrapper>
                        <VStack spacing='10px' justifyContent='center' padding='15px' width='100%' borderRadius='10px' borderWidth='thin' borderColor="#55555f" >
                            {positionNode}
                        </VStack>
                        
                    </WidgetBodyWrapper>
                </WidgetWrapper>
            </AnimatePresence>
        </Flex>
    );
}
