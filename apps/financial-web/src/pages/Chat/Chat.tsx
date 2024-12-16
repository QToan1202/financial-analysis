import { useCallback, useEffect, useMemo, useRef } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  Box,
  Center,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Input,
  useToast,
} from '@chakra-ui/react'
import { CopilotChat } from '@copilotkit/react-ui'
import { useShallow } from 'zustand/shallow'

import { Button, FileItem } from '@components'
import { SUPPORT_FILE_EXTENSIONS } from '@constants'
import { useDeleteDocument, useGetDocuments, useUploadDocument } from '@hooks'
import { useAuthStore } from '@contexts'

import '@copilotkit/react-ui/styles.css'

type UploadDocumentForm = {
  files: FileList
  userId: string
}

const Chat = () => {
  const [isAuthenticated, user] = useAuthStore(
    useShallow((state) => [state.isAuthenticated, state.user])
  )
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UploadDocumentForm>({
    defaultValues: {
      files: undefined,
      userId: isAuthenticated && user._id ? user._id : undefined,
    },
  })
  const toast = useToast({
    duration: 3 * 1000,
    isClosable: true,
  })
  const { mutate: uploadDocument, isPending: isUploadingDocument } = useUploadDocument()
  const handleSubmitFile: SubmitHandler<UploadDocumentForm> = async (values) => {
    uploadDocument(values, {
      onSuccess: () => {
        toast({
          title: 'Document upload success.',
          description: 'Your document have uploaded success. Chat with your data now.',
          status: 'success',
        })
        reset()
      },
      onError: (error) => {
        toast({
          title: 'Document upload fail.',
          description:
            error.message || 'Something went wrong. Please try upload your document again.',
          status: 'error',
        })
      },
    })
  }
  const { mutate: deleteDocument } = useDeleteDocument()
  const handleDeleteDoc = useCallback((id: string) => {
    deleteDocument(id, {
      onSuccess: () => {
        toast({
          title: 'Delete document success.',
          description: 'Your document have been deleted success',
          status: 'success',
        })
      },
      onError: (error) => {
        toast({
          title: 'Delete document fail.',
          description: error.message || 'Something went wrong. Please try again.',
          status: 'error',
        })
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { data: documents, isPending: isGetDocuments, error: errorDocs } = useGetDocuments()
  const DocumentSection = useMemo(() => {
    if (isGetDocuments)
      return (
        <Center>
          <CircularProgress isIndeterminate color="primary.100" />
        </Center>
      )
    if (errorDocs) {
      toast({
        title: 'Get documents fail.',
        description: errorDocs.message || 'Something went wrong. Reload page to try again.',
        status: 'error',
      })
      return
    }

    return documents.map(({ _id, ...rest }) => (
      <FileItem key={_id} my="0.5rem" id={_id} {...rest} onDeleteFile={handleDeleteDoc} />
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, errorDocs, isGetDocuments, handleDeleteDoc])
  const documentContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stable = useRef<number>(0)

  useEffect(() => {
    window.addEventListener('resize', () => {
      console.log(containerRef.current?.getClientRects()[0].height)
      stable.current = documentContainerRef.current?.offsetHeight || 0
    })

    return () => {
      window.removeEventListener('resize', () => {})
    }
  }, [])

  return (
    <Grid flex={1} templateColumns={'1fr 1fr'} ref={containerRef}>
      <GridItem
        display={'flex'}
        flexDirection="column"
        p="0.5rem"
        borderColor="gray.300"
        borderRightWidth="0.5px"
      >
        <FormControl
          as="form"
          display="flex"
          flexDir="column"
          gap=".25rem"
          onSubmit={handleSubmit(handleSubmitFile)}
        >
          <Input
            type="file"
            id="file-upload"
            disabled={isUploadingDocument}
            hidden
            {...register('files', {
              required: 'Your need to upload a file',
              validate: (files?: FileList) => {
                if (!files) return

                const fileName = files[0].name

                if (!fileName) return 'Uploaded file is not acceptable'

                const ext = fileName.split('.').pop()
                if (ext && SUPPORT_FILE_EXTENSIONS.includes(ext)) {
                  return true
                }

                return 'File upload not match PDF, Text or Office Document format'
              },
            })}
          />
          <FormLabel
            htmlFor="file-upload"
            cursor="pointer"
            textAlign="center"
            borderWidth="3px"
            borderRadius="2px"
            borderStyle="dashed"
            borderColor={errors.files ? 'red.50' : 'gray.200'}
            p="1rem"
            m={0}
          >
            {watch('files') && watch('files').item(0)
              ? `Upload file ${watch('files').item(0)?.name}`
              : 'Upload File'}
            <FormHelperText as="p" color={errors.files ? 'red.50' : 'gray.600'}>
              {errors.files?.message || 'Select and upload the file of your choice'}
            </FormHelperText>
          </FormLabel>
          <Button
            type="submit"
            borderRadius="2px"
            isLoading={isUploadingDocument}
            disabled={!isDirty || !!errors.files || isUploadingDocument}
          >
            Upload
          </Button>
        </FormControl>
        <Box
          my="1rem"
          flexGrow={1}
          ref={documentContainerRef}
          h={stable.current}
          overflowY="auto"
          scrollBehavior="smooth"
          scrollMarginY="1"
          scrollPaddingY="1"
          sx={{
            '&::-webkit-scrollbar': {
              width: '0.25rem',
            },
            '&::-webkit-scrollbar-track': {
              width: '0.25rem',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '30px',
            },
          }}
        >
          {DocumentSection}
        </Box>
      </GridItem>
      <GridItem ref={containerRef} borderColor="gray.300" borderLeftWidth="0.5px" p="0.5rem">
        <Box
          as={CopilotChat}
          h="100%"
          maxH={`calc(${containerRef.current?.getClientRects()[0].height}px - 2rem)`}
          instructions={
            'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
          }
          labels={{
            title: 'Your Assistant',
            initial: 'Hi! 👋 How can I assist you today?',
          }}
        />
      </GridItem>
    </Grid>
  )
}

export default Chat
