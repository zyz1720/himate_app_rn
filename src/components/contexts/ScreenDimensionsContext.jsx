import React, {createContext, useContext, useState, useEffect} from 'react';
import {useWindowDimensions, StatusBar} from 'react-native';

const ScreenDimensionsContext = createContext();

const ScreenDimensionsProvider = ({children}) => {
  const {width, height} = useWindowDimensions();
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [fullWidth, setFullWidth] = useState(width);
  const [fullHeight, setFullHeight] = useState(height);

  useEffect(() => {
    setIsHorizontal(width > height);
    setFullWidth(width);
    setFullHeight(height);
  }, [width, height]);

  return (
    <ScreenDimensionsContext.Provider
      value={{
        isHorizontal,
        fullWidth,
        fullHeight,
        statusBarHeight: StatusBar.currentHeight,
      }}>
      {children}
    </ScreenDimensionsContext.Provider>
  );
};

export const useScreenDimensions = () => useContext(ScreenDimensionsContext);

export default ScreenDimensionsProvider;
