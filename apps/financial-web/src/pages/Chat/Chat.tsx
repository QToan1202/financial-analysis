import { SubmitHandler, useForm } from 'react-hook-form'
import {
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

import '@copilotkit/react-ui/styles.css'
import { SUPPORT_FILE_EXTENSIONS } from '@constants'
import { useUploadDocument } from '@hooks'
import { useAuthStore } from '@contexts'

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

  return (
    <Grid templateColumns={'1fr 1fr'} templateRows="minmax(0, 1fr)" gap="0.25rem" height="700px">
      <GridItem p="0.5rem">
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
        <FileItem id={'1'} name={'Agent document'} type={'PFD'} size={'42994'} />
      </GridItem>
      <GridItem
        as={CopilotChat}
        height="100%"
        instructions={
          'You are assisting the user as best as you can. Answer in the best way possible given the data you have.'
        }
        labels={{
          title: 'Your Assistant',
          initial: 'Hi! 👋 How can I assist you today?',
        }}
      ></GridItem>
    </Grid>
  )
}

export default Chat
