export default ({ data, useThumb, mediaRef, ...otherProps }) => {
  const type = data.get('type', '');
  let media;
  let url;
  if (useThumb) {
    url = data.get('thumbUrl');
  } else {
    url = data.get('url');
  }
  const id = data.get('path');
  if (type.startsWith('video/')) {
    media = (
      <video
        key={id}
        autoPlay
        loop
        muted
        playsInline
        ref={mediaRef}
        {...otherProps}
      >
        <source src={url} type={type} />
      </video>
    );
  } else {
    media = (
      <img
        key={id}
        src={url}
        alt=""
        ref={mediaRef}
        {...otherProps}
      />
    );
  }

  return media;
};
