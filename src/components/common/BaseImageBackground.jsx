import {ImageBackground} from 'react-native';
import React, {useEffect, useState} from 'react';

const BaseImageBackground = props => {
  const [defaultSource, setDefaultSource] = useState(
    require('@/assets/images/user_bg.jpg'),
  );

  const imagePrefetch = async () => {
    try {
      const response = await fetch(props.source?.uri);
      if (response.ok) {
        setDefaultSource(props.source);
      }
    } catch (error) {
      console.warn('imagePrefetch error', error);
    }
  };

  useEffect(() => {
    imagePrefetch();
  }, [props.source]);

  return <ImageBackground {...props} source={defaultSource} />;
};

export default BaseImageBackground;
