import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean };

const Image: React.FC<Props> = ({ src = '', alt = '', style, ...rest }) => {
  return <img src={typeof src === 'string' ? src : ''} alt={alt} style={style} {...rest} />;
};

export default Image;