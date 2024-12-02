import { Link as ReactRouterLink, LinkProps as RLinkProps } from 'react-router-dom'
import { Link as ChakraLink, LinkProps as CLinkProps } from '@chakra-ui/react'

export type LinkProps = CLinkProps & RLinkProps

const Link = (props: LinkProps) => <ChakraLink as={ReactRouterLink} {...props} />

export default Link
