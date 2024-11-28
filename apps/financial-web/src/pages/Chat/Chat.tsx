import { FormControl, FormHelperText, FormLabel, Grid, GridItem, Input } from '@chakra-ui/react'
import { CopilotChat } from '@copilotkit/react-ui'
import { SubmitHandler, useForm } from 'react-hook-form'

import { Button } from '@components'

import '@copilotkit/react-ui/styles.css'
import { SUPPORT_FILE_EXTENSIONS } from '@constants'
import { requestForBE } from '@services'

type UploadDocumentForm = {
  files: FileList
}

const Chat = () => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful, errors, isDirty },
  } = useForm<UploadDocumentForm>({
    defaultValues: {
      files: undefined,
    },
  })
  const handleSubmitFile: SubmitHandler<UploadDocumentForm> = async (values) => {
    // const data = new FormData()
    // data.append('file', values.files.item(0) as Blob)
    // const response = await requestForBE.post('http://localhost:8000/uploadfile', data, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // })
    // console.log(response)
    // if (response.statusText === 'OK') {
    //   reset()
    // }
  }

  return (
    <Grid templateColumns={'2fr 1fr'} templateRows="minmax(0, 1fr)" gap="0.25rem">
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
          <Button type="submit" borderRadius="2px" disabled={!isDirty || !!errors.files}>
            Upload
          </Button>
        </FormControl>
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
