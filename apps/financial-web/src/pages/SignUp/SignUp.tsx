import {
  AbsoluteCenter,
  Box,
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
  Link,
  Text,
} from '@chakra-ui/react'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { Button } from '../../components'

type SignUpForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const SignInPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>()

  const onSubmit: SubmitHandler<SignUpForm> = (values) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2))
        resolve()
      }, 3000)
    })
  }

  return (
    <Flex direction="column" gap="3rem" w="580px">
      <Heading as="h1" textAlign="center" fontSize="3xl" fontWeight="medium">
        Sign up for free to start access our website
      </Heading>

      <Flex direction="column" gap="1rem">
        <Button w="full" variant="outline" borderRadius="full">
          Sign up with Facebook
        </Button>
        <Button w="full" variant="outline" borderRadius="full">
          Sign up with Google
        </Button>
        <Button w="full" variant="outline" borderRadius="full">
          Sign up with Apple
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
              required: 'This is required',
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
              required: 'This is required',
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
              required: 'This is required',
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
              required: 'This is required',
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
            {...register('password', {
              required: 'This is required',
              minLength: { value: 4, message: 'Minimum length should be 4' },
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
          <Input id="confirmPassword" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
          )}
        </FormControl>
        <Checkbox alignItems="baseline" colorScheme="black" maxW={'500px'}>
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
            <Link href="#" textDecoration="underline">
              Log in
            </Link>
          </Text>
        </>
      </chakra.form>
    </Flex>
  )
}

export default SignInPage
