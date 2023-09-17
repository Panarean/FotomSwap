import { Button } from '@chakra-ui/react';
import { useConnect } from 'wagmi';
import { goerli } from 'wagmi/chains'
import {useState} from 'react'
import { WalletSelectDialog } from './WalletSelectDialog'

export function ActionButton({
    text,
    isLoading,
    variant,
    onClickFunc
}: {
   text:string|undefined,
   isLoading:boolean,
   variant:string,
   onClickFunc?:()=>void
}) {
    
    var { connect } = useConnect();
    const [open,setOpen] = useState<boolean>(false);
    const { connectors } = useConnect();
    const setWalletIndex = (_id:number) => {
        connect({connector:connectors[_id],chainId:goerli.id});
        setOpen(false);
    }

    let retVal =(<></>);
    if (isLoading ) {
        retVal = (<Button height='60px' variant="orange" isLoading={isLoading } />);
    }

    else {
        retVal = (
            <>
                <Button height='60px' variant={variant} onClick={() => {
                    if(text == 'Connect Wallet')    setOpen(true)
                    else if(onClickFunc)     onClickFunc()
                    
                }
                }>
                    {text}
                </Button>
                
                <WalletSelectDialog open={open} setOpen={setOpen} setWalletIndex={setWalletIndex}  />

            </>
        );
    }

    return retVal;

}
