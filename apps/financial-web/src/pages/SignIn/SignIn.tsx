import {
  AbsoluteCenter,
  Box,
  Center,
  chakra,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  useToast,
} from '@chakra-ui/react'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Button, Link } from '@components'
import { Apple, Facebook, Google } from '@assets'
import { SignInForm } from '@types'
import { useGoogleLogin, useLogin } from '@hooks'

const SignInPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>()
  const toast = useToast({
    duration: 3 * 1000,
    isClosable: true,
  })
  const { mutate: loginWithNormalAccount } = useLogin('login')

  const onSubmit: SubmitHandler<SignInForm> = async (values) => {
    loginWithNormalAccount(values, {
      onSuccess: () => {
        toast({
          title: 'Login success.',
          description: 'Welcome back! You have successfully logged in',
          status: 'success',
        })
      },
      onError: (error) => {
        toast({
          title: 'Login Failed.',
          description:
            error.message || 'Something went wrong. Please check your credentials and try again.',
          status: 'error',
        })
      },
    })
  }
  const handleLoginWithGoogle = useGoogleLogin('/google/login', {
    onSuccess: () => {
      toast({
        title: 'Login success.',
        description: 'Welcome back! You have successfully logged in',
        status: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Login Failed.',
        description:
          error.error_description ||
          'Something went wrong. Please check your credentials and try again.',
        status: 'error',
      })
    },
  })

  return (
    <Center>
      <Flex direction="column" flex={1} gap="3rem" maxW="580px" mt="2rem">
        <Heading as="h1" textAlign="center" fontSize="3xl" fontWeight="medium">
          Log in to your design account
        </Heading>

        <Flex direction="column" gap="1rem">
          <Button leftIcon={<Facebook />} w="full" variant="outline" borderRadius="full">
            Continue with Facebook
          </Button>
          <Button
            leftIcon={<Google />}
            onClick={handleLoginWithGoogle}
            w="full"
            variant="outline"
            borderRadius="full"
          >
            Continue with Google
          </Button>
          <Button leftIcon={<Apple />} w="full" variant="outline" borderRadius="full">
            Continue with Apple
          </Button>
        </Flex>

        <Box position="relative">
          <Divider borderColor="gray.100" opacity={0.25} />
          <AbsoluteCenter bg="white" px="4" color="gray.100">
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
              type="password"
              {...register('password', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
            <Link to="#" alignSelf="flex-end" textDecoration="underline">
              Forget your password
            </Link>
          </FormControl>
          <Checkbox colorScheme="blackAlpha">Keep me signed in until I sign out</Checkbox>
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
            <Link to="/sign-up">Sign up</Link>
          </Button>
        </Flex>
      </Flex>
    </Center>
  )
}

export default SignInPage
