import { Flex, VStack } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function WidgetWrapper({ children }: { children: ReactNode }) {
    const bgColor = useColorModeValue('light.bg.secondary', 'dark.bg.secondary');

    return (
        <Flex padding={['10px','space60']} bg={bgColor} borderRadius='radius14' width='600px'>
            <VStack spacing='40px' alignItems='flex-start' width='100%'>
                {children}
            </VStack>
        </Flex>
    );
}
