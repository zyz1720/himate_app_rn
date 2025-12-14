import {Image, ImageBackground} from 'react-native';
import React, {useEffect, useState} from 'react';

const BaseImageBackground = props => {
  const [defaultSource, setDefaultSource] = useState(
    require('@/assets/images/user_bg.jpg'),
  );

  const imagePrefetch = async () => {
    try {
      const isPrefetched = await Image.prefetch(props.source?.uri);
      if (isPrefetched) {
        setDefaultSource(props.source);
      }
    } catch (error) {
      console.error('imagePrefetch error', error);
    }
  };

  useEffect(() => {
    imagePrefetch();
  }, [props.source]);

  return <ImageBackground {...props} source={defaultSource} />;
};

export default BaseImageBackground;
