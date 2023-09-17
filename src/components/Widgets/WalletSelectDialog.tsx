import { Button } from "@chakra-ui/button";
import { HStack,VStack,Box } from "@chakra-ui/layout";
import { Image } from '@chakra-ui/image'
import {
    Modal, ModalContent, ModalHeader, ModalBody,   
} from '@chakra-ui/modal';

import metamask from '../assets/images/metamask-icon.png';
import walletConnect from '../assets/images/walletConnect.png';
import coinbase from '../assets/images/coinbase.png';

export function WalletSelectDialog({
    open,setOpen,setWalletIndex
}: {
    open:boolean,
    setOpen:(value:boolean)=>void,
    setWalletIndex : (_id:number) => void
})  {
    return (
        <>
            <Modal isOpen={open} onClose={() => setOpen(false)} isCentered>
                <ModalContent>
                    <ModalHeader>Select a wallet</ModalHeader>
                    <ModalBody>
                        <VStack spacing='10px'>
                        <Button
                            variant="orange"
                            padding='20px'
                            height='50px'
                            onClick={()=> setWalletIndex(0)}
                            textStyle="medium"
                            justifyContent='flex-start'
                        >
                            <HStack spacing="space10">
                                <Image src={metamask} boxSize="space40" />
                                <Box>MetaMask</Box>
                            </HStack>
                        </Button>
                        <Button
                            variant="orange"
                            onClick={()=> setWalletIndex(1)}
                            textStyle="medium"
                            padding='20px'
                            height='50px'
                            justifyContent='flex-start'
                        >
                            <HStack spacing="space10">
                                <Image src={coinbase} boxSize="space40" />
                                <Box>CoinBase</Box>
                            </HStack>
                        </Button>
                        <Button
                            variant="orange"
                            onClick={()=> setWalletIndex(2)}
                            textStyle="medium"
                            padding='20px'
                            height='50px'
                            justifyContent='flex-start'
                        >
                            <HStack spacing="space10">
                                <Image src={walletConnect} boxSize="space40" />
                                <Box>WalletConnect</Box>
                            </HStack>
                        </Button>
                        
                        </VStack>
                        
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}