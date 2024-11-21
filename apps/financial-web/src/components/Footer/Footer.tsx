import {
  chakra,
  Grid,
  GridItem,
  Heading as CHeading,
  ListItem as CListItem,
  Text,
  UnorderedList,
  type ListItemProps,
  type HeadingProps,
  Input,
} from '@chakra-ui/react'
import { Button } from '../Button'

const ListItem = (props: ListItemProps) => (
  <CListItem color="text.gray" marginTop="1rem" {...props} />
)
const Heading = (props: HeadingProps) => (
  <CHeading
    as="h4"
    color="text.gray"
    fontSize=".875rem"
    fontWeight="semibold"
    textTransform="uppercase"
    letterSpacing=".05em"
    {...props}
  />
)

const Footer = () => (
  <chakra.footer bgColor="footer" mt="auto">
    <chakra.div maxW="80rem" padding="2rem" paddingTop="4rem" mx="auto">
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={6}>
        <GridItem>
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={6}>
            <GridItem>
              <Heading>Sections</Heading>
              <UnorderedList styleType="none" margin={0}>
                <ListItem>Stocks</ListItem>
                <ListItem>IPOs</ListItem>
                <ListItem>ETFs</ListItem>
                <ListItem>Blog</ListItem>
              </UnorderedList>
            </GridItem>
            <GridItem>
              <Heading>Services</Heading>
              <UnorderedList styleType="none" margin={0}>
                <ListItem>Stock Analysis Pro</ListItem>
                <ListItem>Free Newsletter</ListItem>
                <ListItem>Get Support</ListItem>
              </UnorderedList>
            </GridItem>
          </Grid>
        </GridItem>

        <GridItem>
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={6}>
            <GridItem>
              <Heading>Website</Heading>
              <UnorderedList styleType="none" margin={0}>
                <ListItem>Login</ListItem>
                <ListItem>FAQ</ListItem>
                <ListItem>Changelog</ListItem>
                <ListItem>Sitemap</ListItem>
                <ListItem>Advertise</ListItem>
              </UnorderedList>
            </GridItem>
            <GridItem>
              <Heading>Company</Heading>
              <UnorderedList styleType="none" margin={0}>
                <ListItem>About</ListItem>
                <ListItem>Contact Us</ListItem>
                <ListItem>Terms of Use</ListItem>
                <ListItem>Privacy Policy</ListItem>
                <ListItem>Data Disclaimer</ListItem>
              </UnorderedList>
            </GridItem>
          </Grid>
        </GridItem>

        <GridItem>
          <Heading>Company</Heading>
          <Text marginY="1rem" color="text.gray">
            Daily market news in bullet point format.
          </Text>
          <chakra.form display="flex" gap="3px">
            <Input
              padding="8px 16px"
              type="text"
              bgColor="white"
              placeholder="Enter your email..."
            />
            <Button type="submit" size="xl">
              Subscribe
            </Button>
          </chakra.form>
        </GridItem>
      </Grid>
    </chakra.div>
  </chakra.footer>
)

export default Footer
