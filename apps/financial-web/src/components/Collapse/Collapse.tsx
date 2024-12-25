import { useMemo, useRef } from 'react'
import { Flex, useBreakpointValue, useDisclosure, chakra, useSize } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { Link, Button } from '@components'
import { DRAWER_ITEM } from '@constants'
import { ArrowLeft, ArrowRight } from '@assets'

const ChakraBox = chakra(motion.div, {
  // shouldForwardProp: isValidMotionProp,
})

const Collapse = () => {
  const { isOpen, getButtonProps } = useDisclosure({
    defaultIsOpen: true,
  })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dimensions = useSize(btnRef)

  const isTablet = useBreakpointValue({ xl: false, lg: true })
  const DrawerItem = useMemo(
    () =>
      DRAWER_ITEM.map(({ title, href, icon }, index) => (
        <Flex key={index} borderRadius=".375rem">
          <Link
            to={href}
            flex={1}
            display="flex"
            alignItems="center"
            gap=".5rem"
            p="1rem"
            borderRadius=".375rem"
            _hover={{ textDecoration: 'none', color: 'text.default', bgColor: 'gray.bg' }}
          >
            {icon}
            {isOpen && (
              <chakra.span color="#4b5563" fontSize="sm" fontWeight="semibold">
                {title}
              </chakra.span>
            )}
          </Link>
        </Flex>
      )),
    [isOpen]
  )

  return (
    !isTablet && (
      <ChakraBox
        initial={false}
        animate={{ width: isOpen ? 220 : `calc(${dimensions?.height}px + 2rem)` }}
        display="flex"
        p="1rem"
        flexDir="column"
        overflow="hidden"
        justifyContent="flex-start"
        borderRightWidth={1}
        h="full"
      >
        {DrawerItem}
        <Button
          size="lg"
          pl="1rem"
          display="flex"
          justifyContent="flex-start"
          variant="unstyled"
          ref={btnRef}
          alignSelf="stretch"
          aria-label="collapse-btn"
          leftIcon={isOpen ? <ArrowLeft /> : <ArrowRight />}
          _hover={{ bgColor: 'gray.bg' }}
          {...getButtonProps()}
        >
          {isOpen && (
            <chakra.span color="#4b5563" fontSize="sm" fontWeight="semibold">
              Collapse
            </chakra.span>
          )}
        </Button>
      </ChakraBox>
    )
  )
}

export default Collapse
