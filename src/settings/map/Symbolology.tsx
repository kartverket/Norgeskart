import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  Heading,
  HStack,
  VStack,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { themeLayersAtom, themeLayerStyles } from '../../map/layers/atoms';
import {
  FeatureTypeStyle,
  LineSymbolizer,
  PointSymbolizer,
  PolygonSymbolizer,
  Rule,
  TextSymbolizer,
  UserStyle,
} from '../../map/types/StyledLayerDescriptor';

const PointSymbolizerPart = ({
  symbolizer,
}: {
  symbolizer: PointSymbolizer;
}) => {
  console.log(symbolizer);
  return <Box>Point Symbolizer</Box>;
};
const LineSymbolizerPart = ({ symbolizer }: { symbolizer: LineSymbolizer }) => {
  const color = symbolizer.Stroke.CssParameter[0];
  //const opacity = symbolizer.Stroke.CssParameter[1];
  const width = symbolizer.Stroke.CssParameter[2];
  return (
    <HStack>
      <Box>Line</Box>
      <Box
        height={'28px'}
        width={'28px'}
        bg={'transparent'}
        borderWidth={width}
        borderColor={color}
      ></Box>
    </HStack>
  );
};
const PolygonSymbolizerPart = ({
  symbolizer,
}: {
  symbolizer: PolygonSymbolizer;
}) => {
  const color = symbolizer.Fill?.CssParameter[0];
  const opacity = symbolizer.Fill?.CssParameter[1];
  return (
    <HStack>
      <Box>Polygon</Box>
      <Box
        height={'28px'}
        width={'28px'}
        bgColor={color}
        opacity={opacity}
      ></Box>
    </HStack>
  );
};
const TextSymbolizerPart = ({ symbolizer }: { symbolizer: TextSymbolizer }) => {
  console.log(symbolizer);
  return <Box>Text</Box>;
};

const RulePart = ({ rule }: { rule: Rule }) => {
  return (
    <VStack align={'flex-start'}>
      <Box>
        {rule.PointSymbolizer && (
          <PointSymbolizerPart symbolizer={rule.PointSymbolizer} />
        )}
        {rule.LineSymbolizer && (
          <LineSymbolizerPart symbolizer={rule.LineSymbolizer} />
        )}
        {rule.PolygonSymbolizer && (
          <PolygonSymbolizerPart symbolizer={rule.PolygonSymbolizer} />
        )}
        {rule.TextSymbolizer && (
          <TextSymbolizerPart symbolizer={rule.TextSymbolizer} />
        )}
      </Box>
    </VStack>
  );
};

const FeatureTypeStylePart = ({ fts }: { fts: FeatureTypeStyle }) => {
  return (
    <Box>
      {Array.isArray(fts.Rule) ? (
        fts.Rule.map((rule) => <RulePart key={rule.Name} rule={rule} />)
      ) : (
        <RulePart rule={fts.Rule} />
      )}
    </Box>
  );
};

const UserStylePart = ({ style }: { style: UserStyle }) => {
  return (
    <HStack justify={'space-between'}>
      <Box>{style.Name}</Box>
      <Box>
        {Array.isArray(style.FeatureTypeStyle) ? (
          style.FeatureTypeStyle.map((fts, index) => (
            <FeatureTypeStylePart key={index} fts={fts} />
          ))
        ) : (
          <FeatureTypeStylePart fts={style.FeatureTypeStyle} />
        )}
      </Box>
    </HStack>
  );
};

export const Symbolology = () => {
  const activeThemeLayers = useAtomValue(themeLayersAtom);
  const themesLoadable = useAtomValue(themeLayerStyles);
  if (themesLoadable.state !== 'hasData') {
    return null;
  }
  const themes = themesLoadable.data;
  if (themes.size === 0) {
    return null;
  }

  return (
    <VStack align={'flex-start'}>
      <Heading as="h2" size="lg" mb="4">
        Tegnforklaring
      </Heading>
      <Accordion collapsible>
        {activeThemeLayers.map((layerName) => {
          const themeStyle = themes.get(layerName);
          if (!themeStyle) {
            return null;
          }
          return (
            <AccordionItem key={layerName} value={layerName}>
              <AccordionItemTrigger>
                <Heading size="md">{layerName}</Heading>
              </AccordionItemTrigger>
              <AccordionItemContent>
                {themeStyle.StyledLayerDescriptor.NamedLayer.map((l) => {
                  return (
                    <HStack
                      key={layerName + l.Name}
                      justifyContent={'space-between'}
                    >
                      <Box>{l.Name} </Box>
                      {Array.isArray(l.UserStyle) ? (
                        l.UserStyle.map((s) => <UserStylePart style={s} />)
                      ) : (
                        <UserStylePart style={l.UserStyle} />
                      )}
                    </HStack>
                  );
                })}
              </AccordionItemContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </VStack>
  );
};
