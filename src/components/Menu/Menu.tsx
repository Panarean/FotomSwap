import { Image } from '@chakra-ui/image';
import { HStack, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import logo from '../../assets/images/logo.png';
import { Web3Button } from './Web3Button';
import { useNavigate } from 'react-router-dom';

export function Menu() {
    const navigate = useNavigate();
    const textColor = useColorModeValue('accent.normalPurple', 'dark.tertiary');
    
    return (
        <HStack spacing="space10" width="100%" padding="space20" align="center">
            <Image src={logo} boxSize="30px" objectFit="contain" />
            <Text variant="extraLarge" color={textColor}>
                DAI
            </Text>
            <Text onClick={()=>navigate('/swap')}>
                Swap
            </Text>
            <Text onClick={() => navigate('/pool')}>
                Pool
            </Text>
            <HStack spacing="space20" flex={1} alignItems="center" justifyContent="flex-end">
                <Web3Button />
            </HStack>
        </HStack>
    );
}
