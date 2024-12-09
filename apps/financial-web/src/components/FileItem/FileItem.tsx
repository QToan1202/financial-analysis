import { useCallback } from 'react'
import {
  Box,
  Flex,
  FlexProps,
  Heading,
  IconButton,
  Image,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

import { file } from '@assets'
import type { Document } from '@types'
import { AlertDialog } from '@components/Alert'

export type FileItemProps = FlexProps & {
  id: string
  onDeleteFile?: (id: string) => void
} & Omit<Document, '_id'>
const formatFileSize = (bytes: number | string) => {
  if (typeof bytes === 'string') bytes = Number(bytes)
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0

  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024
    index++
  }

  return `${bytes.toFixed(2)} ${units[index]}`
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FileItem = ({ id, name, extension, size, type, onDeleteFile, ...rest }: FileItemProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleConfirmDelete = useCallback(() => {
    onDeleteFile?.(id)
  }, [id, onDeleteFile])

  return (
    <>
      <Flex
        p="0.5rem"
        justify="space-between"
        align="flex-start"
        bgColor="gray.200"
        borderRadius="10px"
        maxH="100px"
        overflow="hidden"
        borderWidth={0.5}
        borderColor="gray.100"
        {...rest}
      >
        <Flex flex={1} gap="0.5rem">
          <Box boxSize="5rem" p="0.25rem" borderRadius="2px">
            <Image objectFit="contain" src={file} alt="file img" />
          </Box>
          <Flex flex={1} direction="column" justify="space-around">
            <Heading as="h6" fontSize="xl" noOfLines={1}>
              {name}
            </Heading>
            <Text>Extension: {extension.toUpperCase()}</Text>
            <Text>Size: {formatFileSize(size)}</Text>
          </Flex>
        </Flex>
        <IconButton
          variant="ghost"
          aria-label="Delete file"
          onClick={onOpen}
          icon={<CloseIcon />}
        />
      </Flex>
      <AlertDialog
        header="Delete Document"
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
      >
        <Text>
          Are you sure you want to remove this document (
          <Text
            as="span"
            fontWeight="bold"
            fontStyle="italic"
            fontSize="0.875rem"
            letterSpacing={0.2}
          >
            {name.split('.').shift()}
          </Text>
          )? After deleted this document can't be retrieval by our chat model.
        </Text>
      </AlertDialog>
    </>
  )
}

export default FileItem
