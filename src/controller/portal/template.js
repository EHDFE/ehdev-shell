module.exports = assets => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
    <title>传送门</title>
    <style>
    body {
      background-color: #f5f5f5;
      font-size: 16px;
    }
    ul {
      padding: 0;
      list-style: none;
    }
    </style>
  </head>
  <body>
    <ul>${assets.join('')}</ul>
  </body>
  </html>
`;
