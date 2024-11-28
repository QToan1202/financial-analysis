import { useCallback } from 'react'
import { Box, Flex, Heading, IconButton, Image, Text } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

import { file } from '@assets'

export type FileItemProps = {
  id: string
  name: string
  type: string
  size: string
  onDeleteFile?: (id: string) => void
}
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

const FileItem = ({ id, name, type, size, onDeleteFile }: FileItemProps) => {
  const handleClick = useCallback(() => {
    onDeleteFile?.(id)
  }, [id, onDeleteFile])

  return (
    <Flex
      p="0.5rem"
      justify="space-between"
      align="flex-start"
      bgColor="gray.50"
      borderRadius="10px"
      maxH="100px"
      overflow="hidden"
    >
      <Flex gap="0.5rem">
        <Box boxSize="calc(100px - 0.5rem * 2)" p="0.25rem" borderRadius="2px">
          <Image objectFit="cover" src={file} alt="file img" />
        </Box>
        <Flex direction="column" justify="space-around">
          <Heading as="h6" fontSize="xl" noOfLines={1}>
            {name}
          </Heading>
          <Text>Extension: {type}</Text>
          <Text>Size: {formatFileSize(size)}</Text>
        </Flex>
      </Flex>
      <IconButton
        variant="ghost"
        aria-label="Delete file"
        onClick={handleClick}
        icon={<CloseIcon />}
      />
    </Flex>
  )
}

export default FileItem
