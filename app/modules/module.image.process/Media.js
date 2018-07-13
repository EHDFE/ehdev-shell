export default ({ data, ...otherProps }) => {
  const type = data.get('type', '');
  const url = data.get('url');
  let media;
  if (type.startsWith('video/')) {
    media = (
      <video
        key={url}
        autoPlay
        loop
        muted
        playsInline
        {...otherProps}
      >
        <source src={url} type={type} />
      </video>
    );
  } else {
    media = <img key={url} src={url} alt="" {...otherProps} />;
  }

  return media;
};
