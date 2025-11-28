import {
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

export const ProjectionPopover = () => {
  return (
    <PopoverRoot>
      <PopoverTrigger>
        <Icon icon={'info'} />
      </PopoverTrigger>

      <PopoverContent>
        <PopoverCloseTrigger />
        <PopoverArrow />
        <PopoverBody>
          <PopoverTitle>Hva er et CRS</PopoverTitle>
          <Text>
            Hvem vet, men det er viktig. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. more lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </Text>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
  return <div>ProjectionPopover</div>;
};
