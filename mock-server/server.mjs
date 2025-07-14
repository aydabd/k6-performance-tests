/* eslint-env node */
/* global process, console */
import http from 'http';
import { parse } from 'url';

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = parse(req.url, true);
  const method = req.method.toUpperCase();

  if (method === 'GET' && url.pathname === '/api/v2/breeds') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ breeds: [] }));
  } else if (method === 'GET' && url.pathname.startsWith('/api/v2/breeds/')) {
    const id = url.pathname.split('/').pop();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id }));
  } else if (method === 'GET' && url.pathname === '/api/v2/facts') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ facts: [] }));
  } else if (method === 'POST' && url.pathname === '/webservicesserver/numberconversion.wso') {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    const response = `\
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <NumberToWordsResponse xmlns="http://www.dataaccess.com/webservicesserver/">
      <NumberToWordsResult>two hundred and fifty six</NumberToWordsResult>
    </NumberToWordsResponse>
  </soap:Body>
</soap:Envelope>`;
    res.end(response);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => console.log('Mock server listening on port', port));
