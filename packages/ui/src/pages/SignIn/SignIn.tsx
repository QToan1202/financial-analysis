import {
  AbsoluteCenter,
  Box,
  chakra,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
} from '@chakra-ui/react'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Button } from '../../components'

type SignInForm = {
  account: string
  password: string
}

const SignInPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>()

  const onSubmit: SubmitHandler<SignInForm> = (values) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2))
        resolve()
      }, 3000)
    })
  }

  return (
    <Flex bgColor="white.100" flex={1}>
      <Flex direction="column" gap="3rem" w="580px">
        <Heading as="h1" textAlign="center" fontSize="3xl" fontWeight="medium">
          Log in to your design account
        </Heading>

        <Flex direction="column" gap="1rem">
          <Button w="full" variant="outline" borderRadius="full">
            Continue with Facebook
          </Button>
          <Button w="full" variant="outline" borderRadius="full">
            Continue with Google
          </Button>
          <Button w="full" variant="outline" borderRadius="full">
            Continue with Apple
          </Button>
        </Flex>

        <Box position="relative">
          <Divider borderColor="gray.100" opacity={0.25} />
          <AbsoluteCenter bg="white.100" px="4" color="gray.100">
            OR
          </AbsoluteCenter>
        </Box>

        <chakra.form display="flex" flexDir="column" gap="1.5rem" onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.account}>
            <FormLabel htmlFor="account" color="gray.100">
              Email address
            </FormLabel>
            <Input
              id="account"
              {...register('account', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.account && <FormErrorMessage>{errors.account.message}</FormErrorMessage>}
          </FormControl>
          <FormControl display="flex" flexDirection="column" isInvalid={!!errors.password}>
            <FormLabel htmlFor="password" color="gray.100">
              Password
            </FormLabel>
            <Input
              id="password"
              {...register('password', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
            <Link href="#" alignSelf="flex-end" textDecoration="underline">
              Forget your password
            </Link>
          </FormControl>
          <Checkbox colorScheme="black">Keep me signed in until I sign out</Checkbox>
          <Button
            isLoading={isSubmitting}
            borderRadius="full"
            bgColor="rgba(17, 17, 17, 0.4)"
            _hover={{ bgColor: 'black.100' }}
            type="submit"
          >
            Log in
          </Button>
        </chakra.form>

        <Divider borderColor="gray.100" opacity={0.25} />

        <Flex direction="column" gap="1rem">
          <Heading as="h3" textAlign="center" fontSize="1.5rem" fontWeight="medium">
            Don&#39;t have an account?
          </Heading>
          <Button
            variant="outline"
            borderRadius="full"
            _hover={{ bgColor: 'black.100', color: 'white.50' }}
          >
            Sign up
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SignInPage
