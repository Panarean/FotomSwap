import { Image } from '@chakra-ui/image';
import { ControlProps, GroupBase, chakraComponents, OptionProps, Props } from 'chakra-react-select';
import { HStack, Text } from '@chakra-ui/react';
import { Select } from '../Select/Select';


function Control<Options>({ children, ...rest }: ControlProps<Options, false, GroupBase<Options>>) {
    const { selectProps } = rest;
    const { value } = selectProps;
    console.log('option',children)
    return (
        <chakraComponents.Control {...rest} >
            <HStack width='100%' alignItems='center' spacing='3px'>
                {value && <Image src={selectProps.value?.image} boxSize='icon.medium' />}
                {children}
            </HStack>
        </chakraComponents.Control>
    );
}

function Option<Options extends unknown>({
    children,
    ...rest
}: OptionProps<Options, false, GroupBase<Options>>) {
    const { data } = rest;

    return (
        <chakraComponents.Option {...rest} >
            <HStack width='100%' alignItems='center' spacing='3px'>
                <Image src={data?.image} boxSize='icon.medium' />
                <Text>{data?.label}</Text>
            </HStack>
        </chakraComponents.Option>
    );
}

export function SelectToken<Options extends unknown>(
    props: Props<Options, false, GroupBase<Options>>
) {
    return (
        <Select
            {...props}
            isSearchable={false}
            hideSelectedOptions
            components={{
                Control,
                Option,
            }}
        />
    );
}
