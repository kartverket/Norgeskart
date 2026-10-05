import {
  Heading,
  Icon,
  PopoverArrow,
  PopoverBody,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const ProjectionPopover = () => {
  const { t } = useTranslation();

  return (
    <PopoverRoot>
      <PopoverTrigger>
        <Icon size={20} icon={'info'} color="green.700" />
      </PopoverTrigger>

      <PopoverContent>
        <PopoverCloseTrigger />
        <PopoverArrow />
        <PopoverBody>
          <PopoverTitle>
            <Heading size="md">
              {t('map.settings.layers.projection.popover.title')}
            </Heading>
          </PopoverTitle>
          <Text>{t('map.settings.layers.projection.popover.body')}</Text>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
