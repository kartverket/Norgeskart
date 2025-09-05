import Map from 'ol/Map';
import { SearchResult } from "../../types/searchTypes";
import { Overlay } from 'ol';

const popupStyle = {
  backgroundColor: 'white',
  padding: '10px',
  border: '1px solid black',
  top: '10px',
};

const closeButtonStyle = {
  top: '5px',
  background: 'none',
  cursor: 'pointer',
  color: 'black',
  right: '5px',
  position: 'absolute',
};

const listContainerStyle = {
  top: '30px',
};

export const showClusterPopup = (
  results: SearchResult[],
  map: Map,
  coordinates: number[],
) => {
  const popupElement = document.createElement('div');
  Object.assign(popupElement.style, popupStyle);

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  Object.assign(closeButton.style, closeButtonStyle);
  closeButton.onclick = () => {
    map.removeOverlay(popup);
  };

  const listContainer = document.createElement('div');
  Object.assign(listContainer.style, listContainerStyle);
  results.forEach((res) => {
    const item = document.createElement('div');
    item.textContent = res.name;
    listContainer.appendChild(item);
  });

  popupElement.appendChild(closeButton);
  popupElement.appendChild(listContainer);

  const popup = new Overlay({
    element: popupElement,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  });

  map.addOverlay(popup);
  popup.setPosition(coordinates);
};