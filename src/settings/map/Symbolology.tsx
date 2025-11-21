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
  NamedLayer,
  PointSymbolizer,
  PolygonSymbolizer,
  Rule,
  TextSymbolizer,
  UserStyle,
} from '../../map/types/StyledLayerDescriptor';
import { ErrorBoundary } from '../../shared/ErrorBoundary';

const PointSymbolizerPart = ({
  symbolizer,
}: {
  symbolizer: PointSymbolizer;
}) => {
  console.log(symbolizer);
  return <Box>Point Symbolizer</Box>;
};
const LineSymbolizerPart = ({ symbolizer }: { symbolizer: LineSymbolizer }) => {
  let color;
  let width;
  const svgParams = symbolizer.Stroke?.SvgParameter;
  const cssParams = symbolizer.Stroke?.CssParameter;
  if (svgParams) {
    color = svgParams[0];
    width = svgParams[1];
  } else if (cssParams) {
    color = cssParams[0];
    width = cssParams[2];
  }
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
  let color;
  let opacity;
  const svgParams = symbolizer.Fill?.SvgParameter;
  const cssParams = symbolizer.Fill?.CssParameter;
  if (svgParams) {
    color = svgParams[0];
    opacity = svgParams[1];
  } else if (cssParams) {
    color = cssParams[0];
    opacity = cssParams[1];
  }

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

const NamedLayerPart = ({ nameLayer }: { nameLayer: NamedLayer }) => {
  return (
    <HStack key={nameLayer.Name} justifyContent={'space-between'}>
      <Box>{nameLayer.Name} </Box>
      {Array.isArray(nameLayer.UserStyle) ? (
        nameLayer.UserStyle.map((s) => <UserStylePart style={s} />)
      ) : (
        <UserStylePart style={nameLayer.UserStyle} />
      )}
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
        <ErrorBoundary fallback={'Det gikk veldig dårlig'}>
          {activeThemeLayers.map((layerName) => {
            const themeStyle = themes.get(layerName);
            if (!themeStyle) {
              return null;
            }
            console.log(themeStyle);
            return (
              <AccordionItem key={layerName} value={layerName}>
                <AccordionItemTrigger>
                  <Heading size="md">{layerName}</Heading>
                </AccordionItemTrigger>
                <AccordionItemContent>
                  {Array.isArray(
                    themeStyle.StyledLayerDescriptor.NamedLayer,
                  ) ? (
                    themeStyle.StyledLayerDescriptor.NamedLayer.map((l) => (
                      <NamedLayerPart key={layerName + l.Name} nameLayer={l} />
                    ))
                  ) : (
                    <NamedLayerPart
                      nameLayer={themeStyle.StyledLayerDescriptor.NamedLayer}
                    />
                  )}
                </AccordionItemContent>
              </AccordionItem>
            );
          })}
        </ErrorBoundary>
      </Accordion>
    </VStack>
  );
};
