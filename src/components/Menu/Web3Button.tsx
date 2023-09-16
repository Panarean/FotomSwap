import { Button } from '@chakra-ui/react';
//import { walletConnected }  from '../../config/constants/localStorage'
import { useAccount ,useConnect} from 'wagmi';
import { AccountPopover } from './AccountPopover';
import {  useState } from 'react';
import { WalletSelectDialog} from '../Widgets/WalletSelectDialog'

export function Web3Button() {
    const { isConnected, address, isConnecting } = useAccount();
    const {connect,isLoading,connectors} = useConnect();
    const [open, setOpen] = useState<boolean>(false);
    const connectWallet = () => {
        setOpen(true);
    }
    
    const setWalletIndex = (_id:number) => {
        console.log(_id);
        console.log(connectors[_id]);
        connect({connector:connectors[_id]});
        setOpen(false);
    }
    let retVal = (
        <>
        </>
    );
    if (isLoading || isConnecting) {
        retVal =  (
            <Button
                isLoading={isLoading || isConnecting}
                size="medium"
                textStyle="medium"
                width={165}
            />
        );
    }

    else if (isConnected) {
        retVal= (
            <AccountPopover>
                <Button size="medium" width={165}>
                    {address?.slice(0, 6)}...{address?.slice(address.length - 4)}
                </Button>
            </AccountPopover>
        );
    }
    
    else{
        retVal = (
            <>
                <Button size="medium" onClick={connectWallet} textStyle="medium" width={165}>
                    Connect wallet
                </Button>
            </>
            
        )
    }
    retVal = (
        <>
           {retVal}
           <WalletSelectDialog open={open} setOpen={setOpen} setWalletIndex={setWalletIndex} />
        </>
    );
    return retVal;
}
