import { Overlay } from 'ol';
import Map from 'ol/Map';
import i18n from '../../i18n';
import { SearchResult } from '../../types/searchTypes';

const popupStyle = {
  backgroundColor: '#ffffff',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  maxWidth: '300px',
  fontSize: '14px',
  color: '#333',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '5px',
  right: '10px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#888',
  fontSize: '18px',
  fontWeight: 'bold',
};

const listContainerStyle = {
  marginTop: '13px',
  lineHeight: '1.5',
};

export const clusterPopup = (
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
    const resultItem = document.createElement('div');
    resultItem.style.marginBottom = '8px';

    const name = document.createElement('div');
    name.textContent = res.name;

    const type = document.createElement('span');
    type.textContent = ` ${i18n.t(`locationType.${res.type.toLowerCase()}`)}`;
    type.style.fontStyle = 'italic';

    resultItem.appendChild(name);
    resultItem.appendChild(type);

    listContainer.appendChild(resultItem);
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
