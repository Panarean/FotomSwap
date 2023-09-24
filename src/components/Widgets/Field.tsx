import { Input, InputProps } from '@chakra-ui/react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FieldProps extends InputProps {
    label: string;
    isMaxBtn?: boolean;
    setMaxFunc?: ()=>void;
    usdValue?: number;
    balance?: number;
    children?: ReactNode;
}

/**
 * Displays an `Input` on the right and `children` on the left
 */
export function Field({ label, isMaxBtn, setMaxFunc, usdValue, balance, children, ...rest }: FieldProps) {
    const labelColor = useColorModeValue('light.primary', 'dark.primary');
    const bgColor = useColorModeValue('transparent', 'dark.bg.primary');
    const bgOutline = useColorModeValue(
        { outline: '1px solid', outlineColor: 'light.bg.primary' },
        {}
    );
    const bgHover = useColorModeValue('light.bg.primary', 'dark.bg.hover.primary');

    return (
        <VStack spacing='space8' align='flex-start' width='100%' role='group' {...rest}>
            <Text variant='small' color={labelColor}>
                {label}
            </Text>
                <HStack
                    width='100%'
                    spacing='space3'
                    borderRadius='radius14'
                    bg={bgColor}
                    {...bgOutline}
                    _groupHover={{
                        bg: bgHover,
                    }}
                    _focusVisible={{ bg: bgHover }}
                >
                    <VStack width={['50%','100%']}>
                        <Flex paddingLeft='space0' height='100%' width='100%'>
                            <Input
                                variant='halfRound'
                                fontSize={24}
                                textAlign='start'
                                paddingLeft='space30'
                                paddingRight='space0'
                                paddingTop='space10'
                                paddingBottom='space10'
                                width='100%'
                                
                                {...rest}
                                marginTop={'0px'}
                            />
                        </Flex>
                        <Flex paddingLeft='space30' height='100%' width='100%'>
                                <Text variant='small' color={labelColor}>
                                    {usdValue ? '$' + usdValue : ''}
                                </Text>
                        </Flex>
                    </VStack>
                    <VStack width='100%'>
                        {children && (
                            <Flex paddingTop='space20' paddingBottom='space10' paddingLeft='space0' paddingRight='space10' height='100%' width='100%' >
                                    {children}
                            </Flex>
                        )}
                        <Flex paddingBottom='space10' paddingRight='space10' height='100%' width='100%' justifyContent={'flex-end'}>
                            <Text variant='small' paddingRight='space10' color={labelColor}>
                                {balance ? 'Balance : ' + balance : 'Balance :  0'}
                            </Text>
                            {isMaxBtn && balance && (
                                <Text as='a' onClick={() => {
                                    if(setMaxFunc)  setMaxFunc()
                                    }}
                                >
                                    Max
                                </Text>
                            )}                                
                        </Flex>
                    </VStack>
                </HStack>
        </VStack>
    );
}
