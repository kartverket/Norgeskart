import { Overlay } from 'ol';
import Map from 'ol/Map';
import { SearchResult } from '../../types/searchTypes';

const popupStyle = {
  backgroundColor: '#ffffff',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  maxWidth: '300px',
  fontFamily: 'Arial, sans-serif',
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
  marginTop: '15px',
  lineHeight: '1.6',
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
