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
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Button, Link } from '@components'
import { Apple, Facebook, Google } from '@assets'
import type { SignUpForm } from '@types'
import { useGoogleLogin, useRegister } from '@hooks'

const SignInPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>()
  const toast = useToast({
    duration: 3 * 1000,
    isClosable: true,
  })
  const { mutate: registerNormalAccount } = useRegister('/register')
  const onSubmit: SubmitHandler<SignUpForm> = (values) => {
    registerNormalAccount(values, {
      onSuccess: () => {
        toast({
          title: 'Register success.',
          description: 'Welcome! You have successfully registered in',
          status: 'success',
        })
      },
      onError: (error) => {
        toast({
          title: 'Register Failed.',
          description:
            error.message || 'Something went wrong. Please check your credentials and try again.',
          status: 'error',
        })
      },
    })
  }
  const handleRegisterWithGoogle = useGoogleLogin('/google/register', {
    onSuccess: () => {
      toast({
        title: 'Register success.',
        description: 'Welcome! You have successfully registered in',
        status: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Register Failed.',
        description:
          error.error_description ||
          'Something went wrong. Please check your credentials and try again.',
        status: 'error',
      })
    },
  })

  return (
    <Center>
      <Flex direction="column" flex={1} gap="3rem" maxW="580px" my="2rem">
        <Heading as="h1" textAlign="center" fontSize="3xl" fontWeight="medium">
          Sign up for free to start access our website
        </Heading>

        <Flex direction="column" gap="1rem">
          <Button leftIcon={<Facebook />} w="full" variant="outline" borderRadius="full">
            Continue with Facebook
          </Button>
          <Button
            leftIcon={<Google />}
            onClick={handleRegisterWithGoogle}
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
          <AbsoluteCenter bg="white.50" px="4" color="gray.100">
            OR
          </AbsoluteCenter>
        </Box>

        <chakra.form display="flex" flexDir="column" gap="1.5rem" onSubmit={handleSubmit(onSubmit)}>
          <Heading as="h2" fontSize="lg" fontWeight="medium" textAlign="center">
            Sign up with your email address
          </Heading>
          <FormControl isInvalid={!!errors.firstName}>
            <FormLabel htmlFor="firstName" color="gray.100">
              First name
            </FormLabel>
            <Input
              id="firstName"
              {...register('firstName', {
                required: 'Please enter your first name',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.firstName && <FormErrorMessage>{errors.firstName.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!errors.lastName}>
            <FormLabel htmlFor="lastName" color="gray.100">
              Last name
            </FormLabel>
            <Input
              id="lastName"
              {...register('lastName', {
                required: 'Please enter your last name',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.lastName && <FormErrorMessage>{errors.lastName.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email" color="gray.100">
              Email
            </FormLabel>
            <Input
              id="email"
              {...register('email', {
                required: 'Email is required for registration',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel htmlFor="phone" color="gray.100">
              Phone
            </FormLabel>
            <Input
              id="phone"
              {...register('phone', {
                required: 'Phone number is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
              })}
            />
            {errors.phone && <FormErrorMessage>{errors.phone.message}</FormErrorMessage>}
          </FormControl>
          <FormControl display="flex" flexDirection="column" isInvalid={!!errors.password}>
            <FormLabel htmlFor="password" color="gray.100">
              Password
            </FormLabel>
            <Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum length should be 8' },
              })}
            />
            <FormHelperText color="gray.100">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </FormHelperText>
            {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
          </FormControl>
          <FormControl display="flex" flexDirection="column" isInvalid={!!errors.confirmPassword}>
            <FormLabel htmlFor="confirmPassword" color="gray.100">
              Confirm password
            </FormLabel>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
            )}
          </FormControl>
          <Checkbox alignItems="baseline" colorScheme="blackAlpha" maxW={'500px'}>
            Share my registration data with our content providers for marketing purposes.
          </Checkbox>
          <>
            <Button
              isLoading={isSubmitting}
              borderRadius="full"
              bgColor="rgba(17, 17, 17, 0.4)"
              _hover={{ bgColor: 'black.100' }}
              type="submit"
            >
              Sign up
            </Button>
            <Text textAlign="center">
              Already have an account?{' '}
              <Link to="/log-in" textDecoration="underline">
                Log in
              </Link>
            </Text>
          </>
        </chakra.form>
      </Flex>
    </Center>
  )
}

export default SignInPage
