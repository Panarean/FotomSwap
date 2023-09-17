
import {
    Modal,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import {Button} from '@chakra-ui/react'

export function AlertModal({
    isOpen,
    onClose,
    body
}: {
    isOpen:boolean,
    onClose:()=>void,
    title:string,
    body:string
}) {
  return (
    <>

    <Modal  isOpen={isOpen} onClose={onClose} isCentered>
        <AlertDialogOverlay>
            <AlertDialogContent borderWidth='2px' borderColor='black'>
                <AlertDialogHeader paddingBottom='20px' fontSize='20px' textAlign='center' lineHeight='28px'>
                    {body}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button colorScheme='red' onClick={onClose} ml={5} paddingLeft='30px' paddingRight='30px'>
                        OK
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogOverlay>
      </Modal>
    </>
  )
}