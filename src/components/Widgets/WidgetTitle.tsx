import { Text } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/system';
import { ReactNode } from 'react';
import {  Flex } from '@chakra-ui/react'
export function WidgetTitle({ title, children }: { title: string; subtitle?: string;children?:ReactNode }) {
    const titleColor = useColorModeValue('light.tertiary', 'dark.tertiary');

    return (
        <Flex  justifyContent='space-between' alignItems='center' width='100%'>
            <Text  fontSize='40px' variant='extraLarge' color={titleColor}>
                {title}
            </Text>
            {children && (
                    <Flex padding='5px'>
                        <Flex  height='100%' width='100%' >
                            {children}
                        </Flex>
                    </Flex>
                )}
        </Flex>
    );
}
