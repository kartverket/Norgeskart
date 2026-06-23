import { Box, Card, CardBody, Heading, Text, HStack, VStack, Search, SimpleGrid, Accordion, AccordionItem, AccordionItemTrigger, AccordionItemContent } from '@kvib/react';

export const HelpPage = () => {
  return (
    <Box minH="100vh" bg="gray.50">
        <VStack>
            
            <Heading size="2xl" mt={4}>Hva trenger du hjelp med?</Heading>

            <Search backgroundColor="white" placeholder="Søk" ></Search>

            <SimpleGrid columns={{base: 1, md: 2, lg: 3}} gap={4} mt={4}>

                <Card backgroundColor="">
                    <CardBody>
                        <Heading>Tegning og måling</Heading>
                        <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Kart og visning</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Søk</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Deling og eskport</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                     <Card>
                    <CardBody>
                        <Heading>Regler og info</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Test teeeeeeeeeeeeeeeest</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Kontakt oss</Heading>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Om oss</Heading>
                    </CardBody>
                </Card>

                
                <Card>
                    <CardBody>
                        <Heading>Status</Heading>
                    </CardBody>
                </Card>

                
                <Card>
                    <CardBody>
                        <Heading>Personvern</Heading>
                    </CardBody>
                </Card>

                





                </SimpleGrid>         
        </VStack>

    </Box>
  );
};
