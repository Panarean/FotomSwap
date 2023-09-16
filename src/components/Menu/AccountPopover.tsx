import { VStack } from '@chakra-ui/react';
import { Popover, PopoverBody, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { ReactNode } from 'react';
import {   useDisconnect} from 'wagmi';
import { Button } from '@chakra-ui/react';

/**
 * @param children The popover trigger
 */
export function AccountPopover({ children }: { children: ReactNode }) {
    const { disconnect, isLoading } = useDisconnect();
    

    return (
        <Popover trigger="hover" placement="bottom-end" matchWidth>
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent w='100%' p='1px'>
                <PopoverBody w='100%' p='1px'>
                    <VStack alignItems="flex-start" width="100%">
                        <Button w='100%' variant="small" onClick={()=>disconnect()} isLoading={isLoading}>
                            Disconnect
                        </Button>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
}
